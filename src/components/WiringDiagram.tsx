import React, { useState } from 'react';
import { LimiterConfig } from '../types';
import { getGpioNumber } from '../utils/codeGenerator';
import { ShieldAlert, Zap, Cpu, CheckCircle2, Copy, AlertTriangle } from 'lucide-react';

interface WiringDiagramProps {
  config: LimiterConfig;
}

export const WiringDiagram: React.FC<WiringDiagramProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState<'schematic' | 'bom' | 'safety'>('schematic');
  const [copiedBom, setCopiedBom] = useState(false);

  const bomItems = [
    { name: 'Wemos D1 Mini (ESP8266)', qty: '1 pcs', role: 'Mikrokontroler utama pemroses sinyal RPM & PWM', note: 'Flash ESP8266 via USB micro' },
    { name: 'Optocoupler PC817 / EL817', qty: '2 pcs', role: 'Isolator optik input pulser & pemutus output pulser', note: 'Mencegah lonjakan voltase pulser membakar ESP8266' },
    { name: 'MOSFET N-Channel (IRLZ44N / 2N7000)', qty: '1 pcs (Opsional)', role: 'Pengganti optocoupler output jika butuh switching pulser super cepat', note: 'Gunakan Logic Level (IRLZ, bukan IRFZ)' },
    { name: 'Dioda 1N4148 / 1N4007', qty: '1 pcs', role: 'Penyearah sinyal AC pulser (hanya pulsa positif)', note: 'Pasang seri pada jalur kabel pulser input' },
    { name: 'Resistor 1kΩ 1/4W', qty: '2 pcs', role: 'Pembatas arus LED optocoupler input pulser', note: 'Membatasi arus dari pulser ke PC817' },
    { name: 'Resistor 220Ω 1/4W', qty: '1 pcs', role: 'Pembatas arus output PWM Wemos D1 ke PC817', note: 'Dari pin D1 ke Anoda PC817' },
    { name: 'Resistor 10kΩ 1/4W', qty: '2 pcs', role: 'Pull-up resistor input & pull-down gate mosfet', note: 'Menstabilkan sinyal logika digital' },
    { name: 'Kapasitor Keramik 100nF (104)', qty: '1 pcs', role: 'Filter noise EMF pengapian pada jalur 5V', note: 'Paralel pada pin 5V dan GND Wemos' },
    { name: 'DC-DC Buck Converter (Mini360 / LM2596)', qty: '1 pcs', role: 'Penurun tegangan 12V Aki motor ke 5.0V stabil', note: 'Wajib disetel ke 5.0V sebelum disambung ke Wemos' },
    { name: 'Push Button Waterproof', qty: '1 pcs (Opsional)', role: 'Tombol aktivasi 2-Step Launch Control di stang', note: 'Hubungkan antara pin D6 dan GND' },
    { name: 'LED Indikator 5mm / Shift Light', qty: '1 pcs (Opsional)', role: 'Lampu indikator shift RPM', note: 'Seri resistor 330Ω dari D4 ke GND' },
  ];

  const handleCopyBom = () => {
    const text = bomItems.map(item => `- ${item.name} (${item.qty}): ${item.role} [${item.note}]`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBom(true);
    setTimeout(() => setCopiedBom(false), 2000);
  };

  return (
    <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md">
      {/* Tab Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-zinc-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Skema Rangkaian & Hardware Wiring Wemos D1 Mini
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Panduan isolasi proteksi optocoupler PC817 agar Wemos aman dari lonjakan spike pulser motor.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('schematic')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'schematic'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Diagram Skema
          </button>
          <button
            onClick={() => setActiveTab('bom')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'bom'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Daftar Komponen (BOM)
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'safety'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Aturan Keamanan
          </button>
        </div>
      </div>

      {activeTab === 'schematic' && (
        <div className="space-y-4">
          {/* Visual SVG Circuit Block Diagram */}
          <div className="w-full overflow-x-auto bg-zinc-900/90 rounded-xl p-4 border border-zinc-800">
            <svg viewBox="0 0 860 380" className="w-full min-w-[760px] h-auto">
              <defs>
                <linearGradient id="wemosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="cdiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7f1d1d" />
                  <stop offset="100%" stopColor="#450a0a" />
                </linearGradient>
                <linearGradient id="optoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1c1917" />
                  <stop offset="100%" stopColor="#292524" />
                </linearGradient>
                <filter id="shadowBox">
                  <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* PULSER COIL (PICK-UP) ON LEFT */}
              <g filter="url(#shadowBox)">
                <rect x="20" y="40" width="130" height="90" rx="8" fill="#18181b" stroke="#06b6d4" strokeWidth="2" />
                <text x="85" y="65" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">PULSER MOTOR</text>
                <text x="85" y="82" textAnchor="middle" fill="#94a3b8" fontSize="9">Pick-Up Magneto</text>
                <text x="85" y="100" textAnchor="middle" fill="#cbd5e1" fontSize="10">Kabel Biru/Kuning</text>
                <circle cx="150" cy="70" r="5" fill="#06b6d4" />
                <circle cx="150" cy="105" r="5" fill="#64748b" />
                <text x="140" y="65" textAnchor="end" fill="#38bdf8" fontSize="9">+</text>
                <text x="140" y="102" textAnchor="end" fill="#94a3b8" fontSize="9">GND</text>
              </g>

              {/* INPUT OPTOCOUPLER PC817 (Top Middle) */}
              <g filter="url(#shadowBox)">
                <rect x="230" y="30" width="160" height="110" rx="8" fill="url(#optoGrad)" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="310" y="52" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">OPTOCOUPLER INPUT</text>
                <text x="310" y="68" textAnchor="middle" fill="#cbd5e1" fontSize="10">PC817 (RPM Sensor)</text>
                <text x="240" y="90" fill="#94a3b8" fontSize="9">Pin 1: 1N4148 + 1kΩ</text>
                <text x="240" y="110" fill="#94a3b8" fontSize="9">Pin 2: Ground Pulser</text>
                <text x="380" y="90" textAnchor="end" fill="#94a3b8" fontSize="9">Pin 4: Collector</text>
                <text x="380" y="110" textAnchor="end" fill="#94a3b8" fontSize="9">Pin 3: Emitter (GND)</text>
              </g>

              {/* PULSER WIRE FROM PICKUP TO OPTOCOUPLER */}
              <path d="M 150 70 L 180 70 L 180 70 L 230 70" stroke="#06b6d4" strokeWidth="2.5" fill="none" />
              <text x="190" y="62" fill="#06b6d4" fontSize="9" fontWeight="bold">Dioda 1N4148</text>
              <path d="M 150 105 L 190 105 L 190 105 L 230 105" stroke="#64748b" strokeWidth="2" fill="none" />

              {/* WIRE FROM OPTOCOUPLER INPUT TO WEMOS D2 */}
              <path d="M 390 85 L 470 85" stroke="#38bdf8" strokeWidth="2" fill="none" />
              <text x="430" y="78" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">Pin {config.pulserInPin}</text>
              <path d="M 390 110 L 440 110 L 440 160 L 470 160" stroke="#64748b" strokeWidth="2" fill="none" />

              {/* WEMOS D1 MINI (CENTER) */}
              <g filter="url(#shadowBox)">
                <rect x="470" y="30" width="180" height="230" rx="10" fill="url(#wemosGrad)" stroke="#0284c7" strokeWidth="2" />
                <rect x="500" y="15" width="40" height="15" rx="3" fill="#475569" stroke="#64748b" strokeWidth="1" />
                <text x="520" y="26" textAnchor="middle" fill="#f8fafc" fontSize="8">USB</text>
                <text x="560" y="55" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">WEMOS D1 MINI</text>
                <text x="560" y="72" textAnchor="middle" fill="#94a3b8" fontSize="9">ESP8266 Wi-Fi Core</text>

                {/* Left pins of Wemos */}
                <text x="480" y="90" fill="#38bdf8" fontSize="10" fontWeight="bold">{config.pulserInPin} (GPIO{getGpioNumber(config.pulserInPin)}) IN</text>
                <text x="480" y="125" fill="#f59e0b" fontSize="10" fontWeight="bold">{config.cutOutPin} (GPIO{getGpioNumber(config.cutOutPin)}) PWM</text>
                <text x="480" y="160" fill="#94a3b8" fontSize="10">GND</text>
                <text x="480" y="195" fill="#ef4444" fontSize="10" fontWeight="bold">5V (VCC)</text>
                <text x="480" y="230" fill="#06b6d4" fontSize="10">3V3 (Out)</text>

                {/* Right pins */}
                <text x="640" y="90" textAnchor="end" fill="#a855f7" fontSize="10">{config.enableLaunchControl ? `${config.launchSwitchPin}: 2-Step` : 'D6'}</text>
                <text x="640" y="125" textAnchor="end" fill="#eab308" fontSize="10">{config.enableShiftLight ? `${config.shiftLightPin}: Shift LED` : 'D4'}</text>
              </g>

              {/* OUTPUT CUT SHUNT (PC817 or MOSFET) (Bottom Middle) */}
              <g filter="url(#shadowBox)">
                <rect x="230" y="170" width="160" height="110" rx="8" fill="url(#optoGrad)" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="310" y="192" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">PEMUTUS PULSER</text>
                <text x="310" y="208" textAnchor="middle" fill="#cbd5e1" fontSize="10">PC817 / MOSFET Shunt</text>
                <text x="240" y="230" fill="#94a3b8" fontSize="9">Input: Dari {config.cutOutPin}</text>
                <text x="240" y="250" fill="#94a3b8" fontSize="9">Pin 2: Ground Wemos</text>
                <text x="380" y="230" textAnchor="end" fill="#f59e0b" fontSize="9">Ke Jalur Pulser</text>
                <text x="380" y="250" textAnchor="end" fill="#94a3b8" fontSize="9">Ke Ground Mesin</text>
              </g>

              {/* WIRE FROM WEMOS D1 TO OUTPUT CUT */}
              <path d="M 470 125 L 430 125 L 430 220 L 390 220" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
              <text x="430" y="180" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold" transform="rotate(-90 430 180)">Resistor 220Ω</text>

              {/* WIRE FROM OUTPUT CUT TO PULSER-TO-CDI LINE */}
              <path d="M 230 225 L 90 225 L 90 70" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" fill="none" />
              <text x="140" y="215" fill="#f59e0b" fontSize="9" fontWeight="bold">Shunt ke Ground</text>

              {/* CDI UNIT ON RIGHT/BOTTOM */}
              <g filter="url(#shadowBox)">
                <rect x="20" y="280" width="160" height="80" rx="8" fill="url(#cdiGrad)" stroke="#ef4444" strokeWidth="2" />
                <text x="100" y="305" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="bold">CDI UNIT MOTOR</text>
                <text x="100" y="322" textAnchor="middle" fill="#fecaca" fontSize="9">(Standar / Racing / Shogun)</text>
                <text x="100" y="340" textAnchor="middle" fill="#ffffff" fontSize="10">Pin Trigger Pulser</text>
              </g>

              {/* PULSER WIRE CONNECTING TO CDI */}
              <path d="M 85 130 L 85 280" stroke="#06b6d4" strokeWidth="3" fill="none" />
              <text x="95" y="160" fill="#38bdf8" fontSize="9" fontWeight="bold">Kabel Pulser Asli</text>

              {/* 12V AKI & STEP-DOWN BUCK CONVERTER (Right Bottom) */}
              <g filter="url(#shadowBox)">
                <rect x="690" y="160" width="140" height="90" rx="8" fill="#18181b" stroke="#10b981" strokeWidth="1.5" />
                <text x="760" y="182" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">BUCK CONVERTER</text>
                <text x="760" y="198" textAnchor="middle" fill="#cbd5e1" fontSize="9">Mini360 / LM2596</text>
                <text x="700" y="220" fill="#f59e0b" fontSize="9">In: 12V Aki Motor</text>
                <text x="700" y="238" fill="#10b981" fontSize="9" fontWeight="bold">Out: 5.0V Stabil</text>
              </g>

              {/* WIRE FROM STEP DOWN TO WEMOS 5V & GND */}
              <path d="M 690 230 L 660 230 L 660 195 L 650 195" stroke="#ef4444" strokeWidth="2" fill="none" />
              <circle cx="650" cy="195" r="3" fill="#ef4444" />
              <path d="M 690 240 L 670 240 L 670 160 L 650 160" stroke="#64748b" strokeWidth="2" fill="none" />
              <circle cx="650" cy="160" r="3" fill="#64748b" />
            </svg>
          </div>

          {/* Quick Step Connection Guide in Indonesian */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase mb-2">
                <CheckCircle2 className="w-4 h-4" />
                1. Cara Sambung Input Sensor Pulser
              </div>
              <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                <li>Kabel pulser (+) motor diparalel (T-tap) ke anoda <b>Dioda 1N4148</b>.</li>
                <li>Katoda 1N4148 disambung ke resistor <b>1kΩ</b>, lalu ke Pin 1 (Anoda LED) optocoupler PC817.</li>
                <li>Pin 2 PC817 disambung ke ground pulser / bodi mesin.</li>
                <li>Pin 4 PC817 ke pin <b>{config.pulserInPin}</b> Wemos D1 Mini (dengan internal pull-up).</li>
                <li>Pin 3 PC817 ke pin <b>GND</b> Wemos D1 Mini.</li>
              </ul>
            </div>

            <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase mb-2">
                <Zap className="w-4 h-4" />
                2. Cara Sambung Output Pemutus Pulser (Shunt)
              </div>
              <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                <li>Pin <b>{config.cutOutPin}</b> Wemos disambung seri dengan resistor <b>220Ω</b> ke Pin 1 PC817 output.</li>
                <li>Pin 2 PC817 output ke pin <b>GND</b> Wemos.</li>
                <li>Pin 4 (Collector) PC817 disambung ke <b>kabel pulser</b> yang menuju CDI.</li>
                <li>Pin 3 (Emitter) PC817 disambung ke <b>Ground mesin / rangka</b>.</li>
                <li><b>Logika Kerja:</b> Saat Wemos mengeluarkan sinyal PWM HIGH, optocoupler langsung menghubungkan pulser ke ground mesin, sehingga CDI tidak menerima pulsa dan pengapian terhenti (spark cut).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bom' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              Daftar komponen elektronik yang mudah dibeli di toko komponen atau marketplace (Tokopedia/Shopee/Bukalapak):
            </p>
            <button
              onClick={handleCopyBom}
              className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-md transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedBom ? 'Tersalin!' : 'Salin Daftar BOM'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="p-3">Komponen</th>
                  <th className="p-3">Jumlah</th>
                  <th className="p-3">Fungsi / Peran</th>
                  <th className="p-3">Catatan Perakitan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40">
                {bomItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/30">
                    <td className="p-3 font-semibold text-zinc-100">{item.name}</td>
                    <td className="p-3 font-mono text-cyan-400">{item.qty}</td>
                    <td className="p-3 text-zinc-300">{item.role}</td>
                    <td className="p-3 text-zinc-400 text-[11px]">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="space-y-3 text-xs text-zinc-300">
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-200 text-sm mb-1">
                PERINGATAN KRUSIAL: TEGANGAN SPIKE PULSER MOTOR
              </h3>
              <p className="text-red-300/90 leading-relaxed">
                Koil pick-up (pulser) magnet motor menghasilkan gelombang AC bolak-balik dengan tegangan puncak
                bisa mencapai <b>15V hingga 60V+</b> pada putaran tinggi (10.000 RPM).
                Pin GPIO ESP8266 Wemos D1 Mini <b>hanya mentoleransi maksimal 3.3V</b>.
                Jika Anda menyambungkan kabel pulser langsung ke pin D1/D2 tanpa rangkaian isolator optocoupler PC817
                atau diode clamp, Wemos D1 Mini akan langsung hang, rusak, atau terbakar permanen!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                Cegah Noise Pengapian (EMF Spike)
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Koil pengapian (ignition coil) dan busi menghasilkan gelombang elektromagnetik kuat (EMI/RFI).
                Pastikan:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                <li>Gunakan busi berkode "R" (Resistor type, contoh: CPR9EA-9 atau CR7HSA).</li>
                <li>Bungkus modul Wemos dalam box plastik berpelindung dan letakkan minimal 15-20 cm dari koil busi.</li>
                <li>Tambahkan kapasitor keramik 100nF dekat pin 5V dan GND Wemos untuk meredam riak tegangan.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Metode Shunting ke Ground (Aman untuk CDI)
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Memutus jalur pulser dengan metode <b>shunting ke ground (menghubungkan pulser ke ground)</b> jauh lebih aman
                dan responsif daripada memutus fisik kabel pulser dengan relay mekanik:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                <li>Optocoupler PC817 / N-MOSFET bereaksi dalam hitungan mikrodetik (µs).</li>
                <li>Saat shunted, gerbang SCR di dalam CDI tetap 0V, sehingga kapasitor CDI tidak dilepaskan ke koil.</li>
                <li>Tidak menimbulkan percikan kontak api mekanis seperti pada relay konvensional.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
