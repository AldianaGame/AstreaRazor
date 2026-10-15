import { useState, useEffect, useRef } from 'react';
import { LimiterConfig, EngineTelemetry } from './types';
import { Tachometer } from './components/Tachometer';
import { Oscilloscope } from './components/Oscilloscope';
import { WiringDiagram } from './components/WiringDiagram';
import { CodeViewer } from './components/CodeViewer';
import { ConfigPanel } from './components/ConfigPanel';
import { ThrottleBar } from './components/ThrottleBar';
import { ExhaustVisualizer } from './components/ExhaustVisualizer';
import { WifiPanelSimulator } from './components/WifiPanelSimulator';
import { RumbleStepSequencer } from './components/RumbleStepSequencer';
import { audioEngine } from './utils/audioEngine';
import { generateInoCode } from './utils/codeGenerator';
import {
  Cpu,
  Download,
  Gauge,
  Code2,
  FileQuestion,
  Wrench,
  Sparkles,
  Volume2,
  VolumeX,
  Wifi,
  Music,
} from 'lucide-react';

const default30Steps = [
  true, true, true, false,
  true, true, true, true, false, false,
  true, true, true, false,
  true, true, true, false, false,
  true, true, true, true, false,
  true, true, true, true, false, false,
];

const defaultConfig: LimiterConfig = {
  // Master On/Off Switch & Histeresis Limiter
  enableLimiter: true,
  limiterHysteresis: 250,

  pulserInPin: 'D2',
  cutOutPin: 'D1',
  launchSwitchPin: 'D6',
  shiftLightPin: 'D4',
  maxRpm: 10500,
  softCutBand: 600,
  launchRpm: 5500,
  pulsesPerRev: 1,
  debounceMicros: 2500,
  pwmFrequency: 1000,
  limiterMode: 'pwm_soft',
  invertCutOutput: false,
  enableLaunchControl: true,
  enableShiftLight: true,
  enableSerialTelemetry: true,
  enableOledDisplay: false,
  enableWifiTuner: true,
  wifiSsid: 'WEMOS-CDI-LIMITER',
  wifiPass: '12345678',

  // Fitur Backfire & Rumble Idle
  enableBackfire: true,
  backfireMode: 'decel_pops',
  backfireAggression: 3,
  enableRumbleIdle: true,
  rumblePattern: 'custom_30_step',
  rumbleMaxRpm: 2200,
  rumbleSteps: default30Steps,
  rumbleSpeed: 2,
};

export default function App() {
  const [config, setConfig] = useState<LimiterConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<'simulator' | 'rumble30' | 'wifipanel' | 'code' | 'wiring' | 'guide'>('simulator');
  const [audioMuted, setAudioMuted] = useState(true);
  const [throttle, setThrottle] = useState(0);
  const [isLaunchPressed, setIsLaunchPressed] = useState(false);
  const [manualBackfireTrigger, setManualBackfireTrigger] = useState(false);

  // Engine telemetry state
  const [telemetry, setTelemetry] = useState<EngineTelemetry>({
    rpm: 1400,
    targetRpm: 1400,
    throttle: 0,
    isLimiting: false,
    isSoftCut: false,
    isHardCut: false,
    isSoftCutting: false,
    isHardCutting: false,
    isLaunchActive: false,
    isBackfiring: false,
    isRumbleActive: false,
    activeRumbleStep: 0,
    exhaustFlame: 0,
    pwmDuty: 0,
    sparkCutRatio: 0,
    pulserFrequencyHz: 23.3,
    pulserPeriodUs: 42857,
    shiftLightOn: false,
  });

  const simRef = useRef({
    currentRpm: 1400,
    previousRpm: 1400,
    pulseCounter: 0,
    rumblePhase: 0,
    flameCooldown: 0,
    isHardCutLatched: false,
  });

  // Audio mute sync
  const toggleAudio = () => {
    const next = !audioMuted;
    setAudioMuted(next);
    audioEngine.init();
    audioEngine.setMuted(next);
  };

  const handleManualBackfire = () => {
    setManualBackfireTrigger(true);
    audioEngine.init();
    if (audioMuted) {
      setAudioMuted(false);
      audioEngine.setMuted(false);
    }
    audioEngine.playLoudBackfire();
    setTimeout(() => setManualBackfireTrigger(false), 250);
  };

  // Virtual Engine Physics & Limiter Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      const idleBaseRpm = 1400;
      const naturalMaxRpm = 13500;
      const effectiveLimit = isLaunchPressed && config.enableLaunchControl ? config.launchRpm : config.maxRpm;
      const softStart = effectiveLimit - config.softCutBand;
      const hysteresis = Math.max(50, config.limiterHysteresis || 250);
      const disengageThreshold = effectiveLimit - hysteresis;

      // Target RPM based on throttle
      const demandRpm = idleBaseRpm + (throttle / 100) * (naturalMaxRpm - idleBaseRpm);

      let current = simRef.current.currentRpm;
      const prevRpm = simRef.current.previousRpm;

      let isHardCut = false;
      let isSoftCut = false;
      let isBackfiring = manualBackfireTrigger;
      let isRumble = false;
      let pwmDuty = 0;

      // Accumulate engine crankshaft pulses for 30-step sequencer (speed divider)
      const speedDiv = Math.max(1, config.rumbleSpeed || 2);
      const pulsesPerSec = (current / 60) * config.pulsesPerRev;
      simRef.current.pulseCounter += (pulsesPerSec / speedDiv) * dt;
      const activeStep = Math.floor(simRef.current.pulseCounter) % 30;

      // 1. Rumble Idle 30-Step Sequencer logic
      let isStepFire = true;
      if (config.enableRumbleIdle && throttle < 8 && current <= config.rumbleMaxRpm) {
        isRumble = true;
        simRef.current.rumblePhase += dt * 14;
        const lope = Math.sin(simRef.current.rumblePhase) * 60 + Math.cos(simRef.current.rumblePhase * 0.5) * 35;
        current += lope * dt * 2.8;

        // Check if the current 30-step is FIRE (true) or CUT (false)
        const stepState = config.rumbleSteps && config.rumbleSteps[activeStep] !== undefined
          ? config.rumbleSteps[activeStep]
          : true;

        isStepFire = stepState;
        if (!isStepFire) {
          pwmDuty = 100; // Spark cut for this stroke
        }
      }

      // 2. Rev Limiter checks (DIPENGARUHI OLEH TOMBOL ON/OFF LIMITER & HISTERESIS)
      if (config.enableLimiter) {
        // Histeresis state latching
        if (current >= effectiveLimit) {
          simRef.current.isHardCutLatched = true;
        } else if (current < disengageThreshold) {
          simRef.current.isHardCutLatched = false;
        }

        if (simRef.current.isHardCutLatched) {
          isHardCut = true;
          pwmDuty = 100;
        } else if (current >= softStart) {
          isSoftCut = true;
          if (config.limiterMode === 'pwm_soft') {
            const progress = (current - softStart) / Math.max(50, config.softCutBand);
            pwmDuty = Math.min(85, Math.max(15, progress * 85));
          } else if (config.limiterMode === 'cycle_skip') {
            pwmDuty = 40;
          } else if (config.limiterMode === 'pop_and_bang') {
            pwmDuty = 65;
            isBackfiring = true;
          }
        }
      } else {
        simRef.current.isHardCutLatched = false;
      }

      // 3. Overrun Backfire detection
      const decel = prevRpm - current;
      if (config.enableBackfire && decel > 35 && current > 3500 && throttle < 15) {
        isBackfiring = true;
      }

      // Engine acceleration dynamics
      let engineTorque = (demandRpm - current) * 4.2;
      const drag = current * 0.85;

      if (isHardCut) {
        engineTorque = -current * 2.8;
      } else if (isSoftCut) {
        const suppression = 1 - (pwmDuty / 100) * 0.75;
        engineTorque = engineTorque * suppression - drag * (pwmDuty / 100) * 0.5;
      } else if (isRumble && !isStepFire) {
        engineTorque -= 150; // Minor power stroke drop
      }

      current += engineTorque * dt;
      if (current < 1150) current = 1150;
      if (current > 14500) current = 14500;

      simRef.current.previousRpm = simRef.current.currentRpm;
      simRef.current.currentRpm = current;

      let flameLevel = isBackfiring ? 100 : isHardCut ? 60 : 0;
      if (simRef.current.flameCooldown > 0) {
        simRef.current.flameCooldown -= dt;
        flameLevel = Math.max(flameLevel, simRef.current.flameCooldown * 100);
      }

      const pulserFreq = Math.max(10, (current / 60) * config.pulsesPerRev);
      const pulserPeriod = 1000000 / pulserFreq;
      const shiftLight = config.enableShiftLight && current >= (config.maxRpm - 400);

      audioEngine.update(current, isHardCut, isSoftCut, pwmDuty, isRumble, isBackfiring, isStepFire);

      setTelemetry({
        rpm: current,
        targetRpm: demandRpm,
        throttle,
        isLimiting: isHardCut || isSoftCut,
        isSoftCut,
        isHardCut,
        isSoftCutting: isSoftCut,
        isHardCutting: isHardCut,
        isLaunchActive: isLaunchPressed && config.enableLaunchControl,
        isBackfiring,
        isRumbleActive: isRumble,
        activeRumbleStep: activeStep,
        exhaustFlame: flameLevel,
        pwmDuty,
        sparkCutRatio: pwmDuty,
        pulserFrequencyHz: pulserFreq,
        pulserPeriodUs: pulserPeriod,
        shiftLightOn: shiftLight,
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [throttle, isLaunchPressed, config, manualBackfireTrigger]);

  const handleDownloadIno = () => {
    const code = generateInoCode(config);
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wemos_d1_cdi_limiter_${config.maxRpm}rpm.ino`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Glow Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-600/10 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-300/40">
              <Cpu className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
                  Wemos D1 Mini CDI Limiter
                </h1>
                <span className="text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  30-STEP RUMBLE IDLE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Generator Kode Arduino (.ino) &amp; Simulator Pemutus Pulser CDI PWM dengan Panel 30-Step Irama Idle Pincang
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                audioMuted
                  ? 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  : 'bg-emerald-950/90 text-emerald-300 border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline">{audioMuted ? 'Audio Off' : 'Audio On'}</span>
            </button>

            {/* Quick 1-Click Download .ino */}
            <button
              onClick={handleDownloadIno}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-black shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download .ino File
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 my-5 overflow-x-auto pb-1 border-b border-zinc-800/80">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'simulator'
                ? 'bg-zinc-900 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Gauge className="w-4 h-4" />
            Simulator Dyno
          </button>
          <button
            onClick={() => setActiveTab('rumble30')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rumble30'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Music className="w-4 h-4 text-purple-400" />
            Panel 30-Step Rumble
          </button>
          <button
            onClick={() => setActiveTab('wifipanel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wifipanel'
                ? 'bg-zinc-900 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Wifi className="w-4 h-4" />
            Web Panel Wi-Fi (HP)
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'code'
                ? 'bg-zinc-900 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Code2 className="w-4 h-4" />
            File .ino (Arduino C++)
          </button>
          <button
            onClick={() => setActiveTab('wiring')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wiring'
                ? 'bg-zinc-900 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Skema &amp; Rangkaian Opto
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'guide'
                ? 'bg-zinc-900 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            Panduan &amp; Cara Kerja
          </button>
        </nav>

        {/* Tab 1: Simulator & Tachometer */}
        {activeTab === 'simulator' && (
          <div className="space-y-5">
            {/* Quick Links Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-gradient-to-r from-purple-950/60 to-zinc-900 border border-purple-800/50 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-300">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span><b>Sequencer 30-Step Aktif:</b> Atur irama lope idle di bawah.</span>
                </div>
                <button
                  onClick={() => setActiveTab('rumble30')}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors"
                >
                  Buka Panel 30 Step
                </button>
              </div>

              <div className="bg-gradient-to-r from-cyan-950/60 to-zinc-900 border border-cyan-800/50 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Wifi className="w-4 h-4 text-cyan-400" />
                  <span><b>Wi-Fi Web Panel:</b> Akses HP di <code>192.168.4.1</code></span>
                </div>
                <button
                  onClick={() => setActiveTab('wifipanel')}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg transition-colors"
                >
                  Panel HP
                </button>
              </div>
            </div>

            {/* Virtual Throttle Dyno Bar */}
            <ThrottleBar
              throttle={throttle}
              onThrottleChange={setThrottle}
              isLaunchPressed={isLaunchPressed}
              onLaunchToggle={setIsLaunchPressed}
              onQuickRev={(pct) => setThrottle(pct)}
              onIdle={() => setThrottle(0)}
            />

            {/* Exhaust Visualizer with Live Flame & Smoke FX */}
            <ExhaustVisualizer
              telemetry={telemetry}
              config={config}
              onManualBackfire={handleManualBackfire}
            />

            {/* 30-Step Sequencer (Visible right on the simulator!) */}
            <RumbleStepSequencer
              config={config}
              onConfigChange={setConfig}
              telemetry={telemetry}
            />

            {/* Gauge + Oscilloscope Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 flex flex-col">
                <Tachometer telemetry={telemetry} config={config} />
              </div>
              <div className="lg:col-span-7 flex flex-col">
                <Oscilloscope telemetry={telemetry} config={config} />
              </div>
            </div>

            {/* Config & Parameter Panel */}
            <ConfigPanel
              config={config}
              onChange={setConfig}
              audioMuted={audioMuted}
              onToggleAudio={toggleAudio}
            />
          </div>
        )}

        {/* Tab 2: Dedicated 30-Step Rumble Sequencer Tab */}
        {activeTab === 'rumble30' && (
          <div className="space-y-5">
            <RumbleStepSequencer
              config={config}
              onConfigChange={setConfig}
              telemetry={telemetry}
            />

            {/* Throttle Bar to test it live */}
            <ThrottleBar
              throttle={throttle}
              onThrottleChange={setThrottle}
              isLaunchPressed={isLaunchPressed}
              onLaunchToggle={setIsLaunchPressed}
              onQuickRev={(pct) => setThrottle(pct)}
              onIdle={() => setThrottle(0)}
            />

            {/* Exhaust Visualizer */}
            <ExhaustVisualizer
              telemetry={telemetry}
              config={config}
              onManualBackfire={handleManualBackfire}
            />
          </div>
        )}

        {/* Tab 3: Wi-Fi Web Panel Simulator */}
        {activeTab === 'wifipanel' && (
          <div className="space-y-5">
            <WifiPanelSimulator
              config={config}
              onConfigChange={setConfig}
              telemetry={telemetry}
            />
          </div>
        )}

        {/* Tab 4: Arduino .ino Code */}
        {activeTab === 'code' && (
          <div className="space-y-5">
            <CodeViewer config={config} />
            <ConfigPanel
              config={config}
              onChange={setConfig}
              audioMuted={audioMuted}
              onToggleAudio={toggleAudio}
            />
          </div>
        )}

        {/* Tab 5: Hardware Schematic & Wiring */}
        {activeTab === 'wiring' && (
          <div className="space-y-5">
            <WiringDiagram config={config} />
          </div>
        )}

        {/* Tab 6: Explanation & Technical Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-4">
            <div className="bg-zinc-950/80 p-6 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
                <Sparkles className="w-5 h-5" />
                Cara Kerja Sequencer 30-Step Irama Rumble Idle (Chop Cam)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300 leading-relaxed">
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-purple-800/50 space-y-2">
                  <h4 className="font-bold text-purple-300 text-sm">
                    1. Konsep Matriks Kotak 30-Step
                  </h4>
                  <p>
                    Dalam 30 putaran kruk as (crankshaft revolutions), setiap kotak mewakili 1 siklus putaran:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400">
                    <li>
                      <b className="text-emerald-400">HIJAU (FIRE):</b> Pulser diteruskan normal ke CDI, terjadi proses pembakaran di ruang bakar.
                    </li>
                    <li>
                      <b className="text-red-400">MERAH (CUT):</b> Pulser di-ground selama 1 putaran oleh Wemos D1 Mini, sehingga busi tidak memercikkan api.
                    </li>
                    <li>
                      Kombinasi kotak ON dan OFF membentuk <b>ritme ketukan musik pengapian</b> yang unik sesuai selera Anda!
                    </li>
                  </ul>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-xl border border-cyan-800/50 space-y-2">
                  <h4 className="font-bold text-cyan-300 text-sm">
                    2. Penyimpanan Efisien 30-Bit Bitmask
                  </h4>
                  <p>
                    Di dalam firmware C++ Wemos D1 Mini:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400">
                    <li>
                      Susunan 30 kotak dikonversi menjadi sebuah integer 32-bit (<code>uint32_t rumbleBitmask30</code>).
                    </li>
                    <li>
                      Sangat hemat memori: hanya memakai 4 byte di flash EEPROM.
                    </li>
                    <li>
                      Proses eksekusi di ISR menggunakan operasi bit shift <code>(bitmask &gt;&gt; (pulseCount % 30)) &amp; 1</code> yang memakan waktu kurang dari 1 mikrodetik (µs).
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto pt-8 pb-4 text-center text-xs text-zinc-500 font-mono border-t border-zinc-900">
          <p>
            Wemos D1 Mini (ESP8266) CDI RPM Limiter Firmware Studio • Dilengkapi Sequencer 30-Step Irama Rumble Idle &amp; Wi-Fi Web Panel
          </p>
        </footer>
      </div>
    </div>
  );
}
