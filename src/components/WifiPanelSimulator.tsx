import React, { useState } from 'react';
import { LimiterConfig, EngineTelemetry, BackfireMode, LimiterMode } from '../types';
import { Wifi, Smartphone, Save, Info, Music, Zap, Flame } from 'lucide-react';

interface WifiPanelSimulatorProps {
  config: LimiterConfig;
  onConfigChange: (newConfig: LimiterConfig) => void;
  telemetry: EngineTelemetry;
}

export const WifiPanelSimulator: React.FC<WifiPanelSimulatorProps> = ({
  config,
  onConfigChange,
  telemetry,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local state for the phone inputs before clicking "Save"
  const [tempEnableLimiter, setTempEnableLimiter] = useState(config.enableLimiter ?? true);
  const [tempLimiterHysteresis, setTempLimiterHysteresis] = useState(config.limiterHysteresis ?? 250);
  const [tempMaxRpm, setTempMaxRpm] = useState(config.maxRpm);
  const [tempSoftBand, setTempSoftBand] = useState(config.softCutBand);
  const [tempLimiterMode, setTempLimiterMode] = useState<LimiterMode>(config.limiterMode);
  const [tempEnableBackfire, setTempEnableBackfire] = useState(config.enableBackfire);
  const [tempBackfireMode, setTempBackfireMode] = useState<BackfireMode>(config.backfireMode);
  const [tempBackfireAgg, setTempBackfireAgg] = useState(config.backfireAggression);
  const [tempEnableRumble, setTempEnableRumble] = useState(config.enableRumbleIdle);
  const [tempRumbleMax, setTempRumbleMax] = useState(config.rumbleMaxRpm);
  const [tempRumbleSpeed, setTempRumbleSpeed] = useState(config.rumbleSpeed || 2);
  const [tempEnableLaunch, setTempEnableLaunch] = useState(config.enableLaunchControl);
  const [tempEnableShiftLight, setTempEnableShiftLight] = useState(config.enableShiftLight);
  const [tempSteps, setTempSteps] = useState<boolean[]>(
    config.rumbleSteps && config.rumbleSteps.length === 30
      ? config.rumbleSteps
      : Array(30).fill(true).map((_, i) => i % 5 !== 3)
  );

  const togglePhoneStep = (index: number) => {
    const updated = [...tempSteps];
    updated[index] = !updated[index];
    setTempSteps(updated);
  };

  const applyPhonePreset = (pattern: boolean[]) => {
    setTempSteps(pattern);
  };

  const handleSaveToEeprom = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigChange({
      ...config,
      enableLimiter: tempEnableLimiter,
      limiterHysteresis: tempLimiterHysteresis,
      maxRpm: tempMaxRpm,
      softCutBand: tempSoftBand,
      limiterMode: tempLimiterMode,
      enableBackfire: tempEnableBackfire,
      backfireMode: tempBackfireMode,
      backfireAggression: tempBackfireAgg,
      enableRumbleIdle: tempEnableRumble,
      rumblePattern: 'custom_30_step',
      rumbleMaxRpm: tempRumbleMax,
      rumbleSteps: tempSteps,
      rumbleSpeed: tempRumbleSpeed,
      enableLaunchControl: tempEnableLaunch,
      enableShiftLight: tempEnableShiftLight,
    });
    setToastMessage('Semua Saklar & Parameter Berhasil Disimpan ke EEPROM!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md">
      {/* Title & Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-cyan-400" />
            Wi-Fi Web Tuner Panel (192.168.4.1)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Setel parameter ECU &amp; irama kotak 30-step langsung dari browser HP tanpa kabel dan tanpa internet.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/60 px-3 py-1.5 rounded-xl text-xs text-emerald-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>AP AKTIF: {config.wifiSsid || 'WEMOS-CDI-LIMITER'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Connection Instructions & Info Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">STATUS ACCESS POINT:</span>
              <span className="text-cyan-400 font-bold">STANDALONE SOFT-AP</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-black/60 p-2.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-500">SSID Wi-Fi:</span>
                <span className="font-bold text-zinc-100">{config.wifiSsid || 'WEMOS-CDI-LIMITER'}</span>
              </div>
              <div className="bg-black/60 p-2.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-500">Password:</span>
                <span className="font-bold text-amber-400">{config.wifiPass || '12345678'}</span>
              </div>
              <div className="bg-black/60 p-2.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-500">Alamat IP Web:</span>
                <span className="font-bold text-emerald-400">http://192.168.4.1</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5 text-xs text-zinc-300">
            <div className="flex items-center gap-2 font-bold text-cyan-400">
              <Smartphone className="w-4 h-4" />
              Cara Menyetel dari Smartphone:
            </div>
            <ol className="list-decimal list-inside space-y-2 text-zinc-300 text-[11px] leading-relaxed">
              <li>
                <b>Nyalakan Kontak Motor:</b> Wemos D1 Mini memancarkan hotspot <code>{config.wifiSsid || 'WEMOS-CDI-LIMITER'}</code>.
              </li>
              <li>
                <b>Sambungkan Wi-Fi HP:</b> Masukkan password <code>{config.wifiPass || '12345678'}</code>.
              </li>
              <li>
                <b>Buka Browser HP:</b> Kunjungi <code>http://192.168.4.1</code> di Chrome / Safari.
              </li>
              <li>
                <b>Klik Kotak 30-Step:</b> Anda bisa tap kotak hijau/merah di layar HP untuk menciptakan irama ketukan idle pincang baru, lalu klik <b>SIMPAN KE EEPROM</b>.
              </li>
            </ol>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <b>Sinkronisasi Real-Time:</b> Kotak 30-step di ponsel Anda akan tersimpan ke memori internal flash Wemos dan langsung aktif pada putaran langsam mesin.
            </p>
          </div>
        </div>

        {/* Right Side: Virtual Mobile Phone Screen Mockup (7 cols) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative w-full max-w-[410px] rounded-[36px] border-[6px] border-zinc-800 bg-black p-3 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
            {/* Phone Speaker & Notch */}
            <div className="absolute top-2 inset-x-0 flex justify-center z-20 pointer-events-none">
              <div className="w-28 h-4 bg-zinc-800 rounded-full flex items-center justify-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-black/80"></div>
                <div className="w-8 h-1 bg-zinc-900 rounded-full"></div>
              </div>
            </div>

            {/* Browser Address Bar Simulation */}
            <div className="mt-5 mb-3 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>http://192.168.4.1</span>
              </div>
              <span className="text-[9px] text-zinc-500 uppercase">WEMOS AP</span>
            </div>

            {/* Virtual Web Dashboard Body (Inside Phone) */}
            <div className="bg-zinc-950 rounded-2xl p-3.5 border border-zinc-800/80 max-h-[620px] overflow-y-auto space-y-3.5 text-left">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div>
                  <h3 className="text-sm font-black text-white font-mono">WEMOS CDI TUNER</h3>
                  <span className="text-[10px] text-zinc-400">Panel 30 Step Sequencer</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>

              {/* Live Tachometer Card on Phone */}
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center">
                <div
                  className={`text-3xl font-black font-mono tracking-tight transition-colors ${
                    telemetry.isHardCut
                      ? 'text-red-500 animate-pulse'
                      : telemetry.isSoftCut
                      ? 'text-amber-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {Math.round(telemetry.rpm).toLocaleString()}
                </div>
                <div className="text-[9px] font-mono text-zinc-500">LIVE ENGINE RPM</div>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      telemetry.isHardCut
                        ? 'bg-red-950 text-red-300 border-red-700'
                        : telemetry.isSoftCut
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : telemetry.isBackfiring
                        ? 'bg-orange-950 text-orange-300 border-orange-700'
                        : telemetry.isRumbleActive
                        ? 'bg-purple-950 text-purple-300 border-purple-700'
                        : 'bg-zinc-800 text-emerald-400 border-zinc-700'
                    }`}
                  >
                    {telemetry.isHardCut
                      ? 'HARD CUT 100%'
                      : telemetry.isSoftCut
                      ? `PWM SOFT CUT (${Math.round(telemetry.pwmDuty)}%)`
                      : telemetry.isBackfiring
                      ? 'BACKFIRE POP!!'
                      : telemetry.isRumbleActive
                      ? '30-STEP RUMBLE'
                      : 'NORMAL RUN'}
                  </span>
                </div>
              </div>

              {/* Form Controls inside Phone */}
              <form onSubmit={handleSaveToEeprom} className="space-y-3">
                {/* 30-STEP RUMBLE GRID INSIDE PHONE */}
                <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-purple-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-purple-300">
                      <Music className="w-3.5 h-3.5 text-purple-400" />
                      <span>Kotak 30 Step Irama Lope</span>
                    </label>
                    <span className="text-[10px] font-mono text-cyan-400 bg-black/60 px-1.5 py-0.5 rounded border border-zinc-800">
                      STEP {(telemetry.activeRumbleStep + 1).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {/* 6 columns x 5 rows grid on phone */}
                  <div className="grid grid-cols-6 gap-1 pt-1">
                    {tempSteps.map((isFire, idx) => {
                      const isCurrent = telemetry.activeRumbleStep === idx && telemetry.isRumbleActive;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => togglePhoneStep(idx)}
                          className={`p-1 rounded-md text-[9px] font-mono font-bold border transition-all ${
                            isFire
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                              : 'bg-red-950 text-red-300 border-red-600'
                          } ${isCurrent ? 'ring-2 ring-cyan-400 scale-105 z-10' : ''}`}
                        >
                          {(idx + 1).toString().padStart(2, '0')}{isFire ? '●' : '✕'}
                        </button>
                      );
                    })}
                  </div>

                  {/* Preset quick buttons on phone */}
                  <div className="flex items-center gap-1 pt-1 overflow-x-auto text-[9px]">
                    <button
                      type="button"
                      onClick={() => applyPhonePreset([
                        true, true, true, false,
                        true, true, true, true, false, false,
                        true, true, true, false,
                        true, true, true, false, false,
                        true, true, true, true, false,
                        true, true, true, true, false, false,
                      ])}
                      className="px-2 py-0.5 bg-zinc-800 text-zinc-200 rounded border border-zinc-700 whitespace-nowrap"
                    >
                      Herex
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPhonePreset([
                        true, true, false, false,
                        true, false, false, false,
                        true, true, false, false,
                        true, false, false, false,
                        true, true, false, false,
                        true, false, false, false,
                        true, true, false, false,
                        true, false,
                      ])}
                      className="px-2 py-0.5 bg-zinc-800 text-zinc-200 rounded border border-zinc-700 whitespace-nowrap"
                    >
                      Harley
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPhonePreset(Array(30).fill(true))}
                      className="px-2 py-0.5 bg-zinc-800 text-zinc-200 rounded border border-zinc-700 whitespace-nowrap"
                    >
                      All Fire
                    </button>
                  </div>

                  {/* Kecepatan Tempo Rumble Selector on Phone */}
                  <div className="pt-2 border-t border-purple-900/40">
                    <div className="flex justify-between items-center text-[10px] font-mono text-purple-300 mb-1">
                      <span>TEMPO / KECEPATAN:</span>
                      <span className="font-bold text-cyan-400">
                        {tempRumbleSpeed === 1 ? '1x Cepat' : tempRumbleSpeed === 2 ? '2x Sedang' : tempRumbleSpeed === 3 ? '3x Lambat' : '4x Helikopter'}
                      </span>
                    </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { s: 1, lbl: '1x' },
                          { s: 2, lbl: '2x' },
                          { s: 3, lbl: '3x' },
                          { s: 4, lbl: '4x' },
                        ].map((sp) => (
                          <button
                            key={sp.s}
                            type="button"
                            onClick={() => setTempRumbleSpeed(sp.s)}
                            className={`py-1 text-[9px] font-mono font-bold rounded border transition-colors ${
                              tempRumbleSpeed === sp.s
                                ? 'bg-purple-600 text-white border-purple-400'
                                : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-white'
                            }`}
                          >
                            {sp.lbl}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                {/* QUICK FEATURE TOGGLES ON PHONE */}
                <div className="bg-zinc-900/70 p-2 rounded-xl border border-zinc-800 space-y-1.5">
                  <div className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                    Saklar On/Off Fitur (Quick Toggle):
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                    <label className="flex items-center gap-1.5 p-1 rounded bg-black/40 border border-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempEnableLimiter}
                        onChange={(e) => setTempEnableLimiter(e.target.checked)}
                        className="accent-red-500 rounded"
                      />
                      <span className={tempEnableLimiter ? 'text-red-400 font-bold' : 'text-zinc-500'}>
                        Limiter CDI
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 p-1 rounded bg-black/40 border border-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempEnableLaunch}
                        onChange={(e) => setTempEnableLaunch(e.target.checked)}
                        className="accent-cyan-500 rounded"
                      />
                      <span className={tempEnableLaunch ? 'text-cyan-400 font-bold' : 'text-zinc-500'}>
                        2-Step Launch
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 p-1 rounded bg-black/40 border border-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempEnableRumble}
                        onChange={(e) => setTempEnableRumble(e.target.checked)}
                        className="accent-purple-500 rounded"
                      />
                      <span className={tempEnableRumble ? 'text-purple-400 font-bold' : 'text-zinc-500'}>
                        Rumble Idle
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 p-1 rounded bg-black/40 border border-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempEnableShiftLight}
                        onChange={(e) => setTempEnableShiftLight(e.target.checked)}
                        className="accent-yellow-500 rounded"
                      />
                      <span className={tempEnableShiftLight ? 'text-yellow-400 font-bold' : 'text-zinc-500'}>
                        Shift Light
                      </span>
                    </label>
                  </div>
                </div>

                {/* LIMITER & HISTERESIS SECTION ON PHONE */}
                <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-red-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-red-300 font-mono">
                      LIMITER &amp; HISTERESIS
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      tempEnableLimiter ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {tempEnableLimiter ? 'AKTIF' : 'BYPASS'}
                    </span>
                  </div>

                  {/* Max RPM */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400 text-[10px]">MAX RPM (CUT):</span>
                      <span className="text-red-400 font-bold text-[10px]">
                        {tempMaxRpm.toLocaleString()} RPM
                      </span>
                    </div>
                    <input
                      type="range"
                      min={7000}
                      max={14000}
                      step={100}
                      value={tempMaxRpm}
                      onChange={(e) => setTempMaxRpm(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded accent-red-500 cursor-pointer"
                    />
                  </div>

                  {/* Histeresis Slider */}
                  <div className="space-y-0.5 pt-1 border-t border-zinc-800">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-amber-400 text-[10px] font-bold">HISTERESIS:</span>
                      <span className="text-amber-400 font-bold text-[10px]">
                        {tempLimiterHysteresis} RPM
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={600}
                      step={25}
                      value={tempLimiterHysteresis}
                      onChange={(e) => setTempLimiterHysteresis(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Lepas Cut:</span>
                      <span className="text-emerald-400 font-bold">
                        {(tempMaxRpm - tempLimiterHysteresis).toLocaleString()} RPM
                      </span>
                    </div>
                  </div>

                  {/* Soft Cut Band */}
                  <div className="space-y-0.5 pt-1 border-t border-zinc-800">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400 text-[10px]">SOFT CUT BAND:</span>
                      <span className="text-amber-400 font-bold text-[10px]">
                        {tempSoftBand} RPM
                      </span>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={1500}
                      step={50}
                      value={tempSoftBand}
                      onChange={(e) => setTempSoftBand(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Backfire Section on Phone */}
                <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-orange-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-orange-400">
                      <input
                        type="checkbox"
                        checked={tempEnableBackfire}
                        onChange={(e) => setTempEnableBackfire(e.target.checked)}
                        className="rounded accent-orange-500"
                      />
                      <span>Fitur Backfire</span>
                    </label>
                    <span className="text-[10px] font-mono text-orange-300">
                      Lv {tempBackfireAgg}
                    </span>
                  </div>
                  {tempEnableBackfire && (
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={tempBackfireAgg}
                      onChange={(e) => setTempBackfireAgg(Number(e.target.value))}
                      className="w-full h-1.5 accent-orange-500 cursor-pointer"
                    />
                  )}
                </div>

                {/* Save button inside phone */}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-black text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  SIMPAN KE MEMORI EEPROM
                </button>
              </form>

              {/* Toast Popup inside Phone */}
              {toastMessage && (
                <div className="p-2 bg-emerald-500 text-black font-bold text-xs rounded-lg text-center animate-bounce shadow-lg">
                  {toastMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
