import React from 'react';
import { EngineTelemetry, LimiterConfig } from '../types';
import { Music, Zap, Flame, Sparkles, Play, Gauge, Power } from 'lucide-react';

interface RumbleStepSequencerProps {
  config: LimiterConfig;
  onConfigChange: (newConfig: LimiterConfig) => void;
  telemetry: EngineTelemetry;
}

export const RumbleStepSequencer: React.FC<RumbleStepSequencerProps> = ({
  config,
  onConfigChange,
  telemetry,
}) => {
  const steps = config.rumbleSteps && config.rumbleSteps.length === 30
    ? config.rumbleSteps
    : Array(30).fill(true).map((_, i) => (i % 5 !== 3 && i % 8 !== 0));

  const currentSpeed = config.rumbleSpeed || 2;

  const toggleStep = (index: number) => {
    const updated = [...steps];
    updated[index] = !updated[index];
    onConfigChange({
      ...config,
      rumbleSteps: updated,
      rumblePattern: 'custom_30_step',
    });
  };

  const setSpeed = (speedVal: number) => {
    onConfigChange({
      ...config,
      rumbleSpeed: speedVal,
    });
  };

  const applyPreset = (presetName: string, pattern: boolean[]) => {
    onConfigChange({
      ...config,
      enableRumbleIdle: true,
      rumblePattern: 'custom_30_step',
      rumbleSteps: pattern,
    });
  };

  // Presets definition for Indonesian motorcycle scene & V-Twin
  const presets: { name: string; desc: string; pattern: boolean[] }[] = [
    {
      name: 'Herex Tiger / Megapro Drag',
      desc: 'Pincang garang dengan pola 3-1-4-2 ketukan khas noken as overlap tinggi',
      pattern: [
        true, true, true, false,
        true, true, true, true, false, false,
        true, true, true, false,
        true, true, true, false, false,
        true, true, true, true, false,
        true, true, true, true, false, false,
      ],
    },
    {
      name: 'Harley V-Twin Potato-Potato',
      desc: 'Ritme khas mesin V-Twin dengan dua ledakan rapat lalu jeda panjang',
      pattern: [
        true, true, false, false,
        true, false, false, false,
        true, true, false, false,
        true, false, false, false,
        true, true, false, false,
        true, false, false, false,
        true, true, false, false,
        true, false,
      ],
    },
    {
      name: 'Road Race Cam 280°',
      desc: 'Idle pincang cepat dan padat, akselerasi langsung menyalak',
      pattern: [
        true, true, true, true, false,
        true, true, true, true, false,
        true, true, true, true, false,
        true, true, true, true, false,
        true, true, true, true, false,
        true, true, true, true, false,
      ],
    },
    {
      name: 'Stutter Beat Syncopated',
      desc: 'Irama acak berdenyut dengan letupan knalpot renyah',
      pattern: [
        true, true, false, true, true, false, false, true,
        true, true, false, true, false, false, true, true,
        true, true, false, true, true, false, false, true,
        true, false, true, true, false, false,
      ],
    },
    {
      name: 'Mild Touring (Halus)',
      desc: 'Hanya sedikit aksen lope halus tanpa getaran berlebihan',
      pattern: [
        true, true, true, true, true, true, false,
        true, true, true, true, true, true, false,
        true, true, true, true, true, true, false,
        true, true, true, true, true, true, false,
        true, true,
      ],
    },
  ];

  const speedOptions = [
    { val: 1, label: 'Cepat (1x)', desc: '1 Pulsa/Kotak', badge: 'Fast Rapat' },
    { val: 2, label: 'Sedang (2x)', desc: '2 Pulsa/Kotak', badge: 'Rekomendasi Herex' },
    { val: 3, label: 'Lambat (3x)', desc: '3 Pulsa/Kotak', badge: 'Berat & Padat' },
    { val: 4, label: 'Helikopter (4x)', desc: '4 Pulsa/Kotak', badge: 'Super Slow Moge' },
  ];

  const handleAllFire = () => {
    onConfigChange({
      ...config,
      rumbleSteps: Array(30).fill(true),
    });
  };

  const handleInvert = () => {
    onConfigChange({
      ...config,
      rumbleSteps: steps.map((s) => !s),
    });
  };

  // Metrics
  const fireCount = steps.filter(Boolean).length;
  const cutCount = 30 - fireCount;
  const cutPct = Math.round((cutCount / 30) * 100);

  const getLopeSeverity = () => {
    if (cutCount === 0) return { label: 'Normal (Tanpa Lope)', color: 'text-zinc-400' };
    if (cutPct < 20) return { label: 'Mild Lope (Santai & Halus)', color: 'text-emerald-400' };
    if (cutPct < 40) return { label: 'Aggressive Cam (Garang Drag)', color: 'text-purple-400' };
    return { label: 'Extreme Chop (Pincang Berat)', color: 'text-orange-400' };
  };

  const lopeInfo = getLopeSeverity();

  return (
    <div className="bg-zinc-950/90 p-5 rounded-2xl border border-purple-800/50 shadow-2xl backdrop-blur-md space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-600/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Music className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              Panel Sequencer 30-Step Irama Rumble Idle
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/60">
                CUSTOM BEAT &amp; SPEED
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Atur irama ketukan on/off dan kecepatan tempo detak idle pincang mesin motor.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Rumble Master On/Off Switch */}
          <button
            type="button"
            onClick={() => onConfigChange({ ...config, enableRumbleIdle: !config.enableRumbleIdle })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
              config.enableRumbleIdle
                ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Power className={`w-3.5 h-3.5 ${config.enableRumbleIdle ? 'text-purple-400' : 'text-zinc-600'}`} />
            <span>RUMBLE: {config.enableRumbleIdle ? 'ON' : 'OFF'}</span>
          </button>

          {/* Live Step Cursor Badge */}
          <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800 text-xs font-mono">
            <span className="text-zinc-500">PLAYHEAD:</span>
            <span className="font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              STEP {(telemetry.activeRumbleStep + 1).toString().padStart(2, '0')} / 30
            </span>
            <span className="text-[10px] text-purple-400 font-semibold">
              {telemetry.isRumbleActive ? '● AKTIF' : '○ IDLE OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* PENGATUR KECEPATAN / TEMPO RUMBLE IDLE */}
      <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-purple-700/50 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300">
            <Gauge className="w-4 h-4 text-purple-400" />
            <span>KECEPATAN / TEMPO IRAMA RUMBLE IDLE:</span>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-black/60 px-2.5 py-0.5 rounded-full border border-purple-800">
            {currentSpeed === 1 ? '1 Pulsa/Step (Cepat)' : currentSpeed === 2 ? '2 Pulsa/Step (Sedang)' : currentSpeed === 3 ? '3 Pulsa/Step (Lambat)' : '4 Pulsa/Step (Helikopter)'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {speedOptions.map((opt) => {
            const isSelected = currentSpeed === opt.val;
            return (
              <button
                key={opt.val}
                type="button"
                onClick={() => setSpeed(opt.val)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-950 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] ring-1 ring-purple-400'
                    : 'bg-zinc-900 hover:bg-zinc-800/80 border-zinc-700/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-purple-200' : 'text-zinc-200'}`}>
                    {opt.label}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{opt.desc}</div>
                <span className="inline-block mt-1 text-[9px] font-bold text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded">
                  {opt.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 30-STEP INTERACTIVE GRID */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <b>HIJAU = FIRE</b> (Busi Memercik)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-600"></span>
            <b>MERAH = CUT</b> (Pulser Dipotong / Di-skip)
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-15 gap-2">
          {steps.map((isFire, idx) => {
            const isCurrent = telemetry.activeRumbleStep === idx && telemetry.isRumbleActive;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleStep(idx)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all select-none group cursor-pointer ${
                  isFire
                    ? 'bg-emerald-950/60 hover:bg-emerald-900/70 border-emerald-600/70 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : 'bg-red-950/70 hover:bg-red-900/80 border-red-600/80 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                } ${
                  isCurrent
                    ? 'ring-2 ring-cyan-400 scale-105 z-10 shadow-[0_0_20px_#06b6d4]'
                    : ''
                }`}
              >
                {/* Active step glowing indicator bar */}
                {isCurrent && (
                  <div className="absolute -top-1.5 w-6 h-1 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#38bdf8]" />
                )}

                {/* Step Number */}
                <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover:text-white">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>

                {/* Status icon & label */}
                <div className="mt-1 flex items-center justify-center">
                  {isFire ? (
                    <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/30" />
                  ) : (
                    <Flame className="w-4 h-4 text-red-400" />
                  )}
                </div>

                <span className="text-[9px] font-mono font-black mt-0.5 tracking-tighter">
                  {isFire ? 'FIRE' : 'CUT'}
                </span>

                {/* Current playhead badge */}
                {isCurrent && (
                  <span className="absolute -bottom-2 bg-cyan-400 text-black text-[8px] font-black px-1 rounded-full uppercase">
                    NOW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Buttons & Utilities */}
      <div className="space-y-2 pt-2 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Preset Irama Populer (Klik untuk Menerapkan):
          </label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAllFire}
              className="px-2.5 py-1 text-[11px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700 transition-colors"
            >
              Nyalakan Semua
            </button>
            <button
              onClick={handleInvert}
              className="px-2.5 py-1 text-[11px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700 transition-colors"
            >
              Balik Pola
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p.name, p.pattern)}
              className="p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-600/70 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-200 group-hover:text-purple-300 transition-colors">
                  {p.name}
                </span>
                <Play className="w-3 h-3 text-zinc-500 group-hover:text-purple-400" />
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Statistics and Lope Character Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 text-center">
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Total Percikan Menyala (Fire)</div>
          <div className="text-sm font-mono font-bold text-emerald-400">
            {fireCount} / 30 Langkah ({Math.round((fireCount / 30) * 100)}%)
          </div>
        </div>
        <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 text-center">
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Total Pulsa Dipotong (Cut)</div>
          <div className="text-sm font-mono font-bold text-red-400">
            {cutCount} / 30 Langkah ({cutPct}%)
          </div>
        </div>
        <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 text-center">
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Karakter Irama Lope</div>
          <div className={`text-xs font-mono font-bold ${lopeInfo.color}`}>
            {lopeInfo.label}
          </div>
        </div>
      </div>
    </div>
  );
};
