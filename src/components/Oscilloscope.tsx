import React, { useEffect, useRef } from 'react';
import { EngineTelemetry, LimiterConfig } from '../types';

interface OscilloscopeProps {
  telemetry: EngineTelemetry;
  config: LimiterConfig;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({ telemetry, config }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    rpm,
    isHardCut,
    isSoftCut,
    pwmDuty,
    pulserFrequencyHz,
    pulserPeriodUs,
  } = telemetry;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear dark grid
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Draw oscilloscope grid lines
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1;
      const stepX = 40;
      const stepY = 24;
      for (let x = 0; x < width; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center division dashed lines
      ctx.strokeStyle = '#27272a';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, height * 0.33);
      ctx.lineTo(width, height * 0.33);
      ctx.moveTo(0, height * 0.66);
      ctx.lineTo(width, height * 0.66);
      ctx.stroke();
      ctx.setLineDash([]);

      // Oscilloscope Channel 1: Pulser Signal (Cyan)
      // Height zone: 10px to height * 0.30
      const ch1BaseY = height * 0.26;
      const ch1Amp = height * 0.20;

      // Channel 2: Wemos D1 PWM Cut Output (Amber)
      const ch2BaseY = height * 0.58;
      const ch2Amp = height * 0.18;

      // Channel 3: Net CDI Gate Trigger / Spark Outcome (Green/Red)
      const ch3BaseY = height * 0.90;
      const ch3Amp = height * 0.18;

      // Frequency / speed calculation
      // Animate wave moving left
      const scrollSpeed = Math.max(1, (rpm / 600) * 1.8);
      phase = (phase + scrollSpeed) % width;

      // Pulser period in pixels
      const pulseWidthPixels = Math.max(25, 20000 / Math.max(600, rpm));
      const bumpWidth = pulseWidthPixels * 0.18; // pulse width of the reluctor tooth

      // --- Draw CH1: Pulser Pickup Coil Signal ---
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4'; // Cyan
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x++) {
        const offset = (x + phase) % pulseWidthPixels;
        let y = ch1BaseY;
        if (offset < bumpWidth) {
          // Sinusoidal/AC spike bump
          const sinPart = Math.sin((offset / bumpWidth) * Math.PI * 2);
          y = ch1BaseY - sinPart * ch1Amp;
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // --- Draw CH2: PWM Cut Signal from Wemos D1 ---
      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b'; // Amber
      ctx.lineWidth = 2;

      // PWM wavelength in pixels (at 1000Hz relative to screen scale)
      const pwmPeriodPx = 14;
      const dutyFrac = pwmDuty / 100;

      for (let x = 0; x < width; x++) {
        let isHigh = false;
        if (isHardCut) {
          isHigh = true;
        } else if (isSoftCut) {
          const modX = (x + phase * 2) % pwmPeriodPx;
          isHigh = modX < pwmPeriodPx * dutyFrac;
        } else {
          isHigh = false;
        }
        const y = isHigh ? ch2BaseY - ch2Amp : ch2BaseY;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // --- Draw CH3: Resulting Pulser reaching CDI SCR gate ---
      ctx.beginPath();
      ctx.strokeStyle = isHardCut ? '#ef4444' : isSoftCut ? '#eab308' : '#10b981'; // Red if cut, green if intact
      ctx.lineWidth = 2.5;

      for (let x = 0; x < width; x++) {
        const offset = (x + phase) % pulseWidthPixels;
        let isCutNow = false;
        if (isHardCut) {
          isCutNow = true;
        } else if (isSoftCut) {
          const modX = (x + phase * 2) % pwmPeriodPx;
          isCutNow = modX < pwmPeriodPx * dutyFrac;
        }

        let y = ch3BaseY;
        if (offset < bumpWidth) {
          if (!isCutNow) {
            const sinPart = Math.sin((offset / bumpWidth) * Math.PI * 2);
            y = ch3BaseY - sinPart * ch3Amp;
          } else {
            // Cut to 0V ground
            y = ch3BaseY;
          }
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [rpm, isHardCut, isSoftCut, pwmDuty, config.pwmFrequency]);

  return (
    <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md flex flex-col">
      {/* Header with channel legends */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span className="text-xs font-mono font-bold tracking-wider text-zinc-300">
            DIGITAL LOGIC OSCILLOSCOPE
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-cyan-400"></span>
            <span className="text-cyan-400">CH1: Pulser In ({config.pulserInPin})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-amber-400"></span>
            <span className="text-amber-400">CH2: PWM Cut ({config.cutOutPin})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-emerald-400"></span>
            <span className="text-emerald-400">CH3: CDI Trigger Gate</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-[220px] rounded-xl overflow-hidden border border-zinc-800 bg-black">
        <canvas
          ref={canvasRef}
          width={640}
          height={220}
          className="w-full h-full block"
        />

        {/* Labels directly on canvas overlay */}
        <div className="absolute top-2 left-3 pointer-events-none text-[10px] font-mono text-cyan-400 bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-800/50">
          CH1: PICK-UP COIL AC SENSOR
        </div>
        <div className="absolute top-[38%] left-3 pointer-events-none text-[10px] font-mono text-amber-400 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/50">
          CH2: WEMOS D1 PWM SHUNT ({Math.round(pwmDuty)}% DUTY)
        </div>
        <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] font-mono text-emerald-400 bg-zinc-950/80 px-1.5 py-0.5 rounded border border-zinc-700/50">
          CH3: NET CDI TRIGGER PULSE
        </div>

        {/* Live Spark Status badge */}
        <div className="absolute top-2 right-3 pointer-events-none">
          {isHardCut ? (
            <span className="px-2 py-1 bg-red-950/90 text-red-300 border border-red-600 rounded text-[10px] font-mono font-bold animate-pulse">
              SPARK CUT 100% (NO FIRE)
            </span>
          ) : isSoftCut ? (
            <span className="px-2 py-1 bg-amber-950/90 text-amber-300 border border-amber-600 rounded text-[10px] font-mono font-bold">
              PWM CHOPPING ({Math.round(pwmDuty)}% CUT)
            </span>
          ) : (
            <span className="px-2 py-1 bg-emerald-950/90 text-emerald-300 border border-emerald-600 rounded text-[10px] font-mono font-bold">
              NORMAL SPARK FIRING
            </span>
          )}
        </div>
      </div>

      {/* Oscilloscope Real-Time Signal Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800 text-center">
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Pulser Frequency</div>
          <div className="text-xs font-mono font-bold text-cyan-400">
            {pulserFrequencyHz.toFixed(1)} Hz
          </div>
        </div>
        <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800 text-center">
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Period (Interval)</div>
          <div className="text-xs font-mono font-bold text-zinc-200">
            {Math.round(pulserPeriodUs).toLocaleString()} µs
          </div>
        </div>
        <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800 text-center">
          <div className="text-[10px] font-mono text-zinc-500 uppercase">PWM Cut Duty</div>
          <div className="text-xs font-mono font-bold text-amber-400">
            {Math.round(pwmDuty)}% ({Math.round((pwmDuty / 100) * 1023)}/1023)
          </div>
        </div>
        <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800 text-center">
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Limiter Logic</div>
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase">
            {config.limiterMode === 'pwm_soft' ? 'Soft PWM' : config.limiterMode === 'cycle_skip' ? 'Cycle Skip' : config.limiterMode === 'pop_and_bang' ? 'Bee-R Pop' : 'Hard Cut'}
          </div>
        </div>
      </div>
    </div>
  );
};
