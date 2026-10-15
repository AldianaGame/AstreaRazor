// Engine sound synthesis using Web Audio API for simulating RPM, CDI rev limiter, Rumble Idle, and Backfire

class EngineAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private isMuted: boolean = true;
  private isInitialized: boolean = false;
  private lastBackfireTime: number = 0;

  public init() {
    if (this.isInitialized && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master gain
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.0;
      this.gainNode.connect(this.ctx.destination);

      // Low rumble engine cylinder stroke oscillator
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sawtooth';
      this.osc1.frequency.value = 35;

      // Sub-harmonic oscillator for exhaust bass punch
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.value = 70;

      // Low-pass filter simulating engine case and exhaust pipe acoustics
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 550;

      this.osc1.connect(this.filter);
      this.osc2.connect(this.filter);
      this.filter.connect(this.gainNode);

      this.osc1.start();
      this.osc2.start();
      this.isInitialized = true;
    } catch {
      // AudioContext might require user gesture
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.ctx.state === 'suspended' && !muted) {
      this.ctx.resume();
    }
    if (this.gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.linearRampToValueAtTime(muted ? 0.0 : 0.14, now + 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public update(
    rpm: number,
    isHardCut: boolean,
    isSoftCut: boolean,
    pwmDuty: number,
    isRumble: boolean = false,
    isBackfire: boolean = false,
    isStepFire: boolean = true
  ) {
    if (!this.isInitialized || this.isMuted || !this.ctx || !this.osc1 || !this.osc2 || !this.gainNode || !this.filter) return;

    const now = this.ctx.currentTime;

    // Firing frequency calculation based on RPM
    const fundamentalFreq = Math.max(22, (rpm / 60) * 0.9);
    this.osc1.frequency.setTargetAtTime(fundamentalFreq, now, 0.02);
    this.osc2.frequency.setTargetAtTime(fundamentalFreq * 1.5, now, 0.02);

    // Dynamic exhaust filter frequency opens up at higher RPM
    const filterCutoff = Math.min(2200, 450 + (rpm / 14000) * 1600);
    this.filter.frequency.setTargetAtTime(filterCutoff, now, 0.04);

    // 1. RUMBLE IDLE / CHOP CAM (30-Step Sequencer Rhythm)
    if (isRumble && rpm < 2400) {
      if (!isStepFire) {
        // Step is CUT (spark suppressed / compression stroke only)
        this.gainNode.gain.setTargetAtTime(0.025, now, 0.01);
      } else {
        // Step is FIRE (full combustion power stroke)
        this.gainNode.gain.setTargetAtTime(0.16, now, 0.015);
      }
      // Occasional gentle exhaust thud
      if (Math.random() < 0.04 && now - this.lastBackfireTime > 0.16) {
        this.playPop(0.12, 0.025);
        this.lastBackfireTime = now;
      }
    }
    // 2. OVERRUN BACKFIRE / POP & BANG
    else if (isBackfire) {
      // Cut momentarily, then blast loud pop
      this.gainNode.gain.setTargetAtTime(0.04, now, 0.01);
      if (now - this.lastBackfireTime > 0.08) {
        this.playLoudBackfire();
        this.lastBackfireTime = now;
      }
    }
    // 3. HARD CUT REV LIMITER (Stuttering bee-r)
    else if (isHardCut) {
      const stutter = (Math.sin(now * 85) > 0.05) ? 0.02 : 0.16;
      this.gainNode.gain.setTargetAtTime(stutter, now, 0.006);
      if (Math.random() < 0.22 && now - this.lastBackfireTime > 0.07) {
        this.playPop(0.28, 0.04);
        this.lastBackfireTime = now;
      }
    }
    // 4. SOFT CUT PWM
    else if (isSoftCut) {
      const suppression = 1 - (pwmDuty / 100) * 0.55;
      const flutter = suppression * (0.11 + 0.04 * Math.sin(now * 140));
      this.gainNode.gain.setTargetAtTime(flutter, now, 0.02);
    }
    // 5. NORMAL ENGINE ACCELERATION
    else {
      const targetGain = Math.min(0.20, 0.10 + (rpm / 14000) * 0.08);
      this.gainNode.gain.setTargetAtTime(targetGain, now, 0.04);
    }
  }

  // Realistic explosive exhaust pop & bang
  public playLoudBackfire() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;

      // 1. High transient crackle noise (exhaust crack)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass for crisp exhaust crack
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1800;
      bp.Q.value = 2.5;

      const popGain = this.ctx.createGain();
      popGain.gain.setValueAtTime(0.55, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      noise.connect(bp);
      bp.connect(popGain);
      popGain.connect(this.ctx.destination);
      noise.start();

      // 2. Low-frequency boom (header pressure shockwave)
      const boom = this.ctx.createOscillator();
      boom.type = 'triangle';
      boom.frequency.setValueAtTime(140, now);
      boom.frequency.exponentialRampToValueAtTime(35, now + 0.09);

      const boomGain = this.ctx.createGain();
      boomGain.gain.setValueAtTime(0.40, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      boom.connect(boomGain);
      boomGain.connect(this.ctx.destination);
      boom.start();
      boom.stop(now + 0.1);
    } catch {
      // safe fallback
    }
  }

  private playPop(volume = 0.25, duration = 0.04) {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const popGain = this.ctx.createGain();
      popGain.gain.setValueAtTime(volume, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      noise.connect(popGain);
      popGain.connect(this.ctx.destination);
      noise.start();
    } catch {
      // safe fallback
    }
  }
}

export const audioEngine = new EngineAudioSynthesizer();
