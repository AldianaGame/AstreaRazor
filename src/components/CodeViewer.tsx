import React, { useState } from 'react';
import { LimiterConfig } from '../types';
import { generateInoCode } from '../utils/codeGenerator';
import { Download, Copy, Check, FileCode, Terminal, HelpCircle, ExternalLink } from 'lucide-react';

interface CodeViewerProps {
  config: LimiterConfig;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);
  const [showIdeGuide, setShowIdeGuide] = useState(false);

  const inoContent = generateInoCode(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(inoContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([inoContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wemos_d1_cdi_limiter_${config.maxRpm}rpm.ino`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md flex flex-col">
      {/* Code Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-zinc-100 font-mono">
              wemos_d1_cdi_limiter.ino
            </h3>
            <p className="text-[11px] text-zinc-400">
              Kode C++ siap flash ke Wemos D1 Mini via Arduino IDE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIdeGuide(!showIdeGuide)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            Cara Flash ke Wemos
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin!' : 'Salin Kode'}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download .ino File
          </button>
        </div>
      </div>

      {/* Arduino IDE Flash Guide Accordion */}
      {showIdeGuide && (
        <div className="mb-4 p-4 rounded-xl bg-zinc-900 border border-cyan-800/60 text-xs text-zinc-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-cyan-300">
            <Terminal className="w-4 h-4" />
            Panduan Upload Kode di Arduino IDE:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-zinc-300 text-[11px] pl-1">
            <li>Buka <b>Arduino IDE</b> (versi 1.8.x atau 2.x).</li>
            <li>Buka menu <b>File &gt; Preferences</b>, tambahkan URL Board Manager ESP8266:
              <code className="block mt-1 p-1 bg-black/60 rounded text-cyan-300 font-mono select-all">
                http://arduino.esp8266.com/stable/package_esp8266com_index.json
              </code>
            </li>
            <li>Buka <b>Tools &gt; Board &gt; Boards Manager</b>, cari <b>esp8266</b> lalu klik Install.</li>
            <li>Pilih board: <b>Tools &gt; Board &gt; ESP8266 Boards &gt; LOLIN(WEMOS) D1 R2 & mini</b>.</li>
            <li>Atur <b>Upload Speed</b>: 921600 atau 115200, dan <b>CPU Frequency</b>: 80 MHz (atau 160 MHz).</li>
            <li>Pilih Port COM yang sesuai dengan kabel USB Wemos Anda.</li>
            <li>Klik tombol tanda panah <b>Upload</b> (Ctrl + U) dan tunggu hingga 100% Selesai!</li>
          </ol>
        </div>
      )}

      {/* Code Text Box with line numbers simulation and high readability */}
      <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
        <div className="absolute top-2 right-3 pointer-events-none text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          ESP8266 ARDUINO C++
        </div>
        <pre className="p-4 overflow-x-auto text-[11px] font-mono leading-relaxed text-zinc-300 max-h-[500px] overflow-y-auto select-all">
          <code>{inoContent}</code>
        </pre>
      </div>
    </div>
  );
};
