import React from 'react';
import { LimiterConfig, LimiterMode, BackfireMode, RumblePattern } from '../types';
import {
  Sliders,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Shield,
  Sparkles,
  Music,
  Power,
  RotateCcw,
  Wifi,
  Radio,
  Lightbulb,
  Gauge,
  HelpCircle,
} from 'lucide-react';

interface ConfigPanelProps {
  config: LimiterConfig;
  onChange: (newConfig: LimiterConfig) => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onChange,
  audioMuted,
  onToggleAudio,
}) => {
  const update = <K extends keyof LimiterConfig>(key: K, value: LimiterConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const modes: { id: LimiterMode; name: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'pwm_soft',
      name: 'PWM Soft Cut (Halus)',
      desc: 'Duty cycle PWM bertahap naik sesuai RPM. Mengurangi hentakan kasar pada mesin & klep.',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'cycle_skip',
      name: 'Cycle-Skip Spark Drop',
      desc: 'Memutus 1 dari 3 percikan pulser secara bergantian. Suara khas limiter motor injeksi modern.',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'pop_and_bang',
      name: 'Bee-R Racing (Pop & Bang)',
      desc: 'Stuttering osilasi cepat untuk menghasilkan letupan knalpot khas drag race / balap liar.',
      icon: <Flame className="w-4 h-4 text-orange-500" />,
    },
    {
      id: 'hard_cut',
      name: 'Instant Hard Cut',
      desc: 'Langsung memutus pulser 100% begitu mencapai batas RPM dengan kontrol histeresis.',
      icon: <Shield className="w-4 h-4 text-red-500" />,
    },
  ];

  const hysteresisVal = config.limiterHysteresis || 250;
  const cutOffRpm = config.maxRpm;
  const cutReleaseRpm = Math.max(1000, config.maxRpm - hysteresisVal);

  return (
    <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
            Parameter Limiter &amp; ECU Tuning
          </h3>
        </div>

        {/* Audio Toggle Button */}
        <button
          type="button"
          onClick={onToggleAudio}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            audioMuted
              ? 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:text-zinc-200'
              : 'bg-emerald-950/90 text-emerald-300 border border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
          }`}
        >
          {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
          {audioMuted ? 'Suara Mesin: OFF' : 'Suara Mesin: ON'}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PUSAT TOMBOL ON / OFF SETIAP FITUR (MASTER TOGGLE HUB) */}
      {/* ========================================================================= */}
      <div className="bg-zinc-900/90 p-4 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-2">
            <Power className="w-4 h-4 text-cyan-400" />
            Tombol Saklar On / Off Setiap Fitur
          </label>
          <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2 py-0.5 rounded border border-zinc-800">
            MASTER SWITCHES
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {/* 1. Master Limiter */}
          <button
            type="button"
            onClick={() => update('enableLimiter', !config.enableLimiter)}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
              config.enableLimiter
                ? 'bg-red-950/60 border-red-500/80 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <Shield className={`w-3.5 h-3.5 ${config.enableLimiter ? 'text-red-400' : 'text-zinc-600'}`} />
              <span className={`w-2 h-2 rounded-full ${config.enableLimiter ? 'bg-red-400 animate-pulse' : 'bg-zinc-700'}`} />
            </div>
            <span className="text-[11px] font-bold tracking-tight">LIMITER CDI</span>
            <span
              className={`mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                config.enableLimiter ? 'bg-red-900 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {config.enableLimiter ? 'ON (AKTIF)' : 'OFF (BYPASS)'}
            </span>
          </button>

          {/* 2. Backfire */}
          <button
            type="button"
            onClick={() => update('enableBackfire', !config.enableBackfire)}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
              config.enableBackfire
                ? 'bg-orange-950/60 border-orange-500/80 text-orange-200 shadow-[0_0_12px_rgba(249,115,22,0.2)]'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <Flame className={`w-3.5 h-3.5 ${config.enableBackfire ? 'text-orange-400' : 'text-zinc-600'}`} />
              <span className={`w-2 h-2 rounded-full ${config.enableBackfire ? 'bg-orange-400 animate-pulse' : 'bg-zinc-700'}`} />
            </div>
            <span className="text-[11px] font-bold tracking-tight">BACKFIRE</span>
            <span
              className={`mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                config.enableBackfire ? 'bg-orange-900 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {config.enableBackfire ? 'ON (POPS)' : 'OFF (MATI)'}
            </span>
          </button>

          {/* 3. Rumble Idle */}
          <button
            type="button"
            onClick={() => update('enableRumbleIdle', !config.enableRumbleIdle)}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
              config.enableRumbleIdle
                ? 'bg-purple-950/60 border-purple-500/80 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <Music className={`w-3.5 h-3.5 ${config.enableRumbleIdle ? 'text-purple-400' : 'text-zinc-600'}`} />
              <span className={`w-2 h-2 rounded-full ${config.enableRumbleIdle ? 'bg-purple-400 animate-pulse' : 'bg-zinc-700'}`} />
            </div>
            <span className="text-[11px] font-bold tracking-tight">RUMBLE IDLE</span>
            <span
              className={`mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                config.enableRumbleIdle ? 'bg-purple-900 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {config.enableRumbleIdle ? 'ON (CHOP)' : 'OFF (MATI)'}
            </span>
          </button>

          {/* 4. Launch Control */}
          <button
            type="button"
            onClick={() => update('enableLaunchControl', !config.enableLaunchControl)}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
              config.enableLaunchControl
                ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <Gauge className={`w-3.5 h-3.5 ${config.enableLaunchControl ? 'text-cyan-400' : 'text-zinc-600'}`} />
              <span className={`w-2 h-2 rounded-full ${config.enableLaunchControl ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-700'}`} />
            </div>
            <span className="text-[11px] font-bold tracking-tight">2-STEP LAUNCH</span>
            <span
              className={`mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                config.enableLaunchControl ? 'bg-cyan-900 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {config.enableLaunchControl ? 'ON (ACTIVE)' : 'OFF (MATI)'}
            </span>
          </button>

          {/* 5. Shift Light */}
          <button
            type="button"
            onClick={() => update('enableShiftLight', !config.enableShiftLight)}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
              config.enableShiftLight
                ? 'bg-yellow-950/60 border-yellow-500/80 text-yellow-200 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <Lightbulb className={`w-3.5 h-3.5 ${config.enableShiftLight ? 'text-yellow-400' : 'text-zinc-600'}`} />
              <span className={`w-2 h-2 rounded-full ${config.enableShiftLight ? 'bg-yellow-400 animate-pulse' : 'bg-zinc-700'}`} />
            </div>
            <span className="text-[11px] font-bold tracking-tight">SHIFT LIGHT</span>
            <span
              className={`mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                config.enableShiftLight ? 'bg-yellow-900 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {config.enableShiftLight ? 'ON (LED D4)' : 'OFF (MATI)'}
            </span>
          </button>

          {/* 6. Wi-Fi Web Tuner */}
          <button
            type="button"
            onClick={() => update('enableWifiTuner', !config.enableWifiTuner)}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
              config.enableWifiTuner
                ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <Wifi className={`w-3.5 h-3.5 ${config.enableWifiTuner ? 'text-emerald-400' : 'text-zinc-600'}`} />
              <span className={`w-2 h-2 rounded-full ${config.enableWifiTuner ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-700'}`} />
            </div>
            <span className="text-[11px] font-bold tracking-tight">WI-FI TUNER</span>
            <span
              className={`mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                config.enableWifiTuner ? 'bg-emerald-900 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {config.enableWifiTuner ? 'ON (192.168.4.1)' : 'OFF (MATI)'}
            </span>
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-medium text-zinc-400 uppercase">
          Metode Pemotongan Pulser (Limiter Algorithm)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {modes.map((m) => {
            const isSelected = config.limiterMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => update('limiterMode', m.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                    : 'bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {m.icon}
                  <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-zinc-200'}`}>
                    {m.name}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FITUR HISTESIS LIMITER & RPM CUT CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-zinc-900/70 p-4 rounded-xl border border-red-900/40 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            <h4 className="text-xs font-mono font-bold text-red-200 uppercase">
              Batas RPM &amp; Histeresis Pantulan Limiter
            </h4>
          </div>
          <span className="text-[10px] font-mono text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-800">
            {config.enableLimiter ? 'LIMITER STATUS: AKTIF' : 'LIMITER STATUS: BYPASS'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Max RPM Limit */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-medium text-zinc-300">
                Max RPM (Batas Mulai Cut)
              </label>
              <span className="text-xs font-mono font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
                {config.maxRpm.toLocaleString()} RPM
              </span>
            </div>
            <input
              type="range"
              min={7000}
              max={14000}
              step={100}
              value={config.maxRpm}
              onChange={(e) => update('maxRpm', Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>7,000 RPM</span>
              <span>10,500</span>
              <span>14,000 RPM</span>
            </div>
          </div>

          {/* HISTERESIS LIMITER SLIDER */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Histeresis Limiter RPM</span>
              </label>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                {hysteresisVal} RPM
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={600}
              step={25}
              value={hysteresisVal}
              onChange={(e) => update('limiterHysteresis', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>50 RPM (Ketat/Rapat)</span>
              <span>250 RPM (Ideal)</span>
              <span>600 RPM (Lompatan Jauh)</span>
            </div>
          </div>
        </div>

        {/* Visualisasi Histeresis Bar & Penjelasan */}
        <div className="bg-black/60 p-3 rounded-lg border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Siklus Logika Histeresis:
            </span>
            <span className="text-[11px] text-zinc-300">
              Pita Jeda: <b className="text-amber-400">{hysteresisVal} RPM</b>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
            <div className="bg-red-950/40 p-2 rounded border border-red-800/60">
              <div className="text-[10px] text-red-400 font-bold">1. CUT PULSER AKTIF DI:</div>
              <div className="text-sm font-black text-red-300">≥ {cutOffRpm.toLocaleString()} RPM</div>
            </div>
            <div className="bg-emerald-950/40 p-2 rounded border border-emerald-800/60">
              <div className="text-[10px] text-emerald-400 font-bold">2. CUT DILEPAS KEMBALI DI:</div>
              <div className="text-sm font-black text-emerald-300">&lt; {cutReleaseRpm.toLocaleString()} RPM</div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
            <b>Fungsi Histeresis:</b> Mencegah pulser hidup-mati secara liar (*fluttering*) pada frekuensi ultra-tinggi saat RPM berada di ambang batas. Dengan histeresis {hysteresisVal} RPM, limiter CDI menghasilkan pantulan (*bounce*) <i>"tat-tat-tat"</i> yang sangat renyah, padat, dan aman untuk CDI &amp; koil pengapian.
          </p>
        </div>

        {/* Soft Cut Window Band */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-medium text-zinc-300">
              Rentang Soft Cut Band (PWM Gradual)
            </label>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
              {config.softCutBand} RPM
            </span>
          </div>
          <input
            type="range"
            min={200}
            max={1500}
            step={50}
            value={config.softCutBand}
            onChange={(e) => update('softCutBand', Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>200 RPM</span>
            <span>Mulai Soft Cut: {(config.maxRpm - config.softCutBand).toLocaleString()} RPM</span>
            <span>1,500 RPM</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FITUR BACKFIRE & RUMBLE IDLE ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fitur Backfire & Pop Bangs */}
        <div className="bg-gradient-to-br from-orange-950/30 to-zinc-900/60 p-4 rounded-xl border border-orange-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableBackfire}
                onChange={(e) => update('enableBackfire', e.target.checked)}
                className="rounded accent-orange-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                Fitur Backfire (Pop &amp; Bangs)
              </span>
            </label>
            <span className="text-[10px] font-mono text-orange-400/80 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800/60">
              {config.enableBackfire ? 'AKTIF' : 'NON-AKTIF'}
            </span>
          </div>

          {config.enableBackfire && (
            <div className="space-y-3 pt-1">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 block mb-1">Pola Backfire:</span>
                <select
                  value={config.backfireMode}
                  onChange={(e) => update('backfireMode', e.target.value as BackfireMode)}
                  className="w-full bg-zinc-950 text-xs font-mono text-orange-200 p-2 rounded-lg border border-orange-800/60"
                >
                  <option value="decel_pops">Decel Pops (Letupan Kecil Renyah saat Lepas Gas)</option>
                  <option value="limiter_flame">Limiter Flame (Semburan Api Panjang Knalpot)</option>
                  <option value="antilag_aggressive">Antilag Aggressive (Ledakan Keras &amp; Api Petasan)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400">Tingkat Agresivitas:</span>
                  <span className="text-orange-400 font-bold">Level {config.backfireAggression} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={config.backfireAggression}
                  onChange={(e) => update('backfireAggression', Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>1 (Halus)</span>
                  <span>3 (Sedang)</span>
                  <span>5 (Api Brutal)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fitur Rumble Idle / Chop Cam (Idle Pincang) */}
        <div className="bg-gradient-to-br from-purple-950/30 to-zinc-900/60 p-4 rounded-xl border border-purple-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableRumbleIdle}
                onChange={(e) => update('enableRumbleIdle', e.target.checked)}
                className="rounded accent-purple-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Music className="w-4 h-4" />
                Fitur Rumble Idle (Chop Cam)
              </span>
            </label>
            <span className="text-[10px] font-mono text-purple-400/80 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">
              {config.enableRumbleIdle ? 'AKTIF' : 'NON-AKTIF'}
            </span>
          </div>

          {config.enableRumbleIdle && (
            <div className="space-y-3 pt-1">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 block mb-1">Batas Maksimal Rumble:</span>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400">Aktif di bawah:</span>
                  <span className="text-purple-300 font-bold">{config.rumbleMaxRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min={1800}
                  max={2800}
                  step={50}
                  value={config.rumbleMaxRpm}
                  onChange={(e) => update('rumbleMaxRpm', Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>1,800 RPM</span>
                  <span>Di atas {config.rumbleMaxRpm} RPM langsung halus</span>
                  <span>2,800 RPM</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Launch Control (2-Step) & Shift Light toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 2-Step Launch Control */}
        <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableLaunchControl}
                onChange={(e) => update('enableLaunchControl', e.target.checked)}
                className="rounded accent-cyan-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-cyan-300">
                2-Step Launch Control
              </span>
            </label>
            {config.enableLaunchControl && (
              <span className="text-xs font-mono font-bold text-cyan-400">
                {config.launchRpm} RPM
              </span>
            )}
          </div>
          {config.enableLaunchControl ? (
            <>
              <input
                type="range"
                min={3000}
                max={9000}
                step={100}
                value={config.launchRpm}
                onChange={(e) => update('launchRpm', Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>Tombol di Pin: {config.launchSwitchPin}</span>
                <span>Batas: {config.launchRpm} RPM</span>
              </div>
            </>
          ) : (
            <p className="text-[11px] text-zinc-500">
              Batasi RPM saat kopling ditarik atau tombol stang ditekan untuk start balap.
            </p>
          )}
        </div>

        {/* Shift Light & PWM Frequency */}
        <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableShiftLight}
                onChange={(e) => update('enableShiftLight', e.target.checked)}
                className="rounded accent-yellow-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-yellow-300">
                Lampu Indikator Shift Light
              </span>
            </label>
            <span className="text-[10px] font-mono text-zinc-400">Pin {config.shiftLightPin}</span>
          </div>

          <div className="pt-1">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
              <span>Frekuensi PWM ESP8266:</span>
              <span className="text-zinc-200 font-bold">{config.pwmFrequency} Hz</span>
            </div>
            <select
              value={config.pwmFrequency}
              onChange={(e) => update('pwmFrequency', Number(e.target.value))}
              className="w-full bg-zinc-950 text-xs font-mono text-zinc-200 p-2 rounded-lg border border-zinc-700"
            >
              <option value={500}>500 Hz (Responsif standar)</option>
              <option value={1000}>1000 Hz (Direkomendasikan)</option>
              <option value={2000}>2000 Hz (Modulasi sangat halus)</option>
              <option value={5000}>5000 Hz (Frekuensi tinggi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pin Assignment Selector Grid */}
      <div className="pt-2 border-t border-zinc-800/80">
        <label className="text-xs font-mono font-medium text-zinc-400 uppercase block mb-2">
          Konfigurasi Pin Wemos D1 Mini
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block">Input Pulser:</span>
            <select
              value={config.pulserInPin}
              onChange={(e) => update('pulserInPin', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-zinc-200 font-mono text-xs"
            >
              <option value="D2">D2 (GPIO4) - Standar</option>
              <option value="D5">D5 (GPIO14)</option>
              <option value="D7">D7 (GPIO13)</option>
            </select>
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block">Output PWM Cut:</span>
            <select
              value={config.cutOutPin}
              onChange={(e) => update('cutOutPin', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-zinc-200 font-mono text-xs"
            >
              <option value="D1">D1 (GPIO5) - Standar</option>
              <option value="D5">D5 (GPIO14)</option>
              <option value="D6">D6 (GPIO12)</option>
            </select>
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block">Tombol Launch:</span>
            <select
              value={config.launchSwitchPin}
              onChange={(e) => update('launchSwitchPin', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-zinc-200 font-mono text-xs"
            >
              <option value="D6">D6 (GPIO12)</option>
              <option value="D7">D7 (GPIO13)</option>
              <option value="D3">D3 (GPIO0)</option>
            </select>
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block">Shift Light:</span>
            <select
              value={config.shiftLightPin}
              onChange={(e) => update('shiftLightPin', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-zinc-200 font-mono text-xs"
            >
              <option value="D4">D4 (GPIO2 / LED)</option>
              <option value="D7">D7 (GPIO13)</option>
              <option value="D8">D8 (GPIO15)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Toggles */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-zinc-800/80 text-xs text-zinc-300">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableSerialTelemetry}
            onChange={(e) => update('enableSerialTelemetry', e.target.checked)}
            className="rounded accent-cyan-500 cursor-pointer"
          />
          <span>Aktifkan Serial Telemetri (115200 baud)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableWifiTuner}
            onChange={(e) => update('enableWifiTuner', e.target.checked)}
            className="rounded accent-cyan-500 cursor-pointer"
          />
          <span>Aktifkan Web Tuner via Wi-Fi AP HP</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableOledDisplay}
            onChange={(e) => update('enableOledDisplay', e.target.checked)}
            className="rounded accent-cyan-500 cursor-pointer"
          />
          <span>Support Layar OLED 0.96" SSD1306</span>
        </label>
      </div>
    </div>
  );
};
