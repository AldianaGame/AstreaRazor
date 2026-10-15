import React from 'react';
import { EngineTelemetry, LimiterConfig } from '../types';

interface TachometerProps {
  telemetry: EngineTelemetry;
  config: LimiterConfig;
}

export const Tachometer: React.FC<TachometerProps> = ({ telemetry, config }) => {
  const maxDisplayRpm = 14000;
  const { rpm, isHardCut, isSoftCut, isLaunchActive, pwmDuty, shiftLightOn } = telemetry;
  const { maxRpm, softCutBand, launchRpm, enableLaunchControl } = config;

  const softCutStart = maxRpm - softCutBand;
  const effectiveLimit = isLaunchActive && enableLaunchControl ? launchRpm : maxRpm;

  // Gauge angles: from -135 deg (0 RPM) to +135 deg (14000 RPM), total 270 deg sweep
  const startAngle = -135;
  const totalSweep = 270;
  const needleAngle = startAngle + Math.min(1, Math.max(0, rpm / maxDisplayRpm)) * totalSweep;

  // Arc math helper for SVG
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngleDeg: number, endAngleDeg: number) => {
    const start = polarToCartesian(x, y, radius, endAngleDeg);
    const end = polarToCartesian(x, y, radius, startAngleDeg);
    const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const cx = 150;
  const cy = 150;
  const r = 118;

  // Angles for colored segments
  const softCutAngle = startAngle + (softCutStart / maxDisplayRpm) * totalSweep;
  const maxCutAngle = startAngle + (maxRpm / maxDisplayRpm) * totalSweep;
  const launchAngle = startAngle + (launchRpm / maxDisplayRpm) * totalSweep;
  const endAngle = startAngle + totalSweep;

  // Major ticks every 2000 RPM (0, 2, 4, 6, 8, 10, 12, 14)
  const ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  return (
    <div className="relative flex flex-col items-center justify-center bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md">
      {/* Shift Light Banner at top */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-mono tracking-wider text-zinc-400 uppercase">
            TACHOMETER SENSOR (PULSER IN)
          </span>
        </div>

        {/* Shift light beacon */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Shift Light</span>
          <div
            className={`w-6 h-6 rounded-full border-2 transition-all duration-100 flex items-center justify-center ${
              shiftLightOn
                ? 'bg-amber-400 border-yellow-200 shadow-[0_0_20px_#f59e0b] scale-110'
                : 'bg-zinc-900 border-zinc-700 opacity-60'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${shiftLightOn ? 'bg-white' : 'bg-transparent'}`} />
          </div>
        </div>
      </div>

      {/* SVG Analog Gauge */}
      <div className="relative w-[300px] h-[300px]">
        <svg viewBox="0 0 300 300" className="w-full h-full">
          <defs>
            <radialGradient id="gaugeBg" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#18181b" />
              <stop offset="95%" stopColor="#09090b" />
              <stop offset="100%" stopColor="#27272a" />
            </radialGradient>
            <linearGradient id="softCutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Outer Ring */}
          <circle cx={cx} cy={cy} r="140" fill="url(#gaugeBg)" stroke="#27272a" strokeWidth="3" />
          <circle cx={cx} cy={cy} r="132" fill="none" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />

          {/* Normal Range Track (gray) */}
          <path
            d={describeArc(cx, cy, r, startAngle, softCutAngle)}
            fill="none"
            stroke="#3f3f46"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Soft Cut Range Track (Amber) */}
          <path
            d={describeArc(cx, cy, r, softCutAngle, maxCutAngle)}
            fill="none"
            stroke="url(#softCutGrad)"
            strokeWidth="9"
          />

          {/* Hard Cut Range Track (Red) */}
          <path
            d={describeArc(cx, cy, r, maxCutAngle, endAngle)}
            fill="none"
            stroke="#dc2626"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Launch Control Marker (Cyan tick) */}
          {enableLaunchControl && (
            <line
              x1={polarToCartesian(cx, cy, r - 12, launchAngle).x}
              y1={polarToCartesian(cx, cy, r - 12, launchAngle).y}
              x2={polarToCartesian(cx, cy, r + 12, launchAngle).x}
              y2={polarToCartesian(cx, cy, r + 12, launchAngle).y}
              stroke="#06b6d4"
              strokeWidth="4"
              filter="url(#glow)"
            />
          )}

          {/* Ticks and Labels */}
          {ticks.map((t) => {
            const angle = startAngle + (t / 14) * totalSweep;
            const isMajor = t % 2 === 0;
            const innerR = isMajor ? r - 15 : r - 8;
            const outerR = r - 2;
            const p1 = polarToCartesian(cx, cy, innerR, angle);
            const p2 = polarToCartesian(cx, cy, outerR, angle);
            const labelPos = polarToCartesian(cx, cy, r - 28, angle);

            const isRedZone = t * 1000 >= maxRpm;
            const isSoftZone = t * 1000 >= softCutStart && !isRedZone;

            return (
              <g key={t}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isRedZone ? '#ef4444' : isSoftZone ? '#f59e0b' : '#a1a1aa'}
                  strokeWidth={isMajor ? 2.5 : 1.5}
                />
                {isMajor && (
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 4}
                    textAnchor="middle"
                    className="text-[12px] font-mono font-bold select-none"
                    fill={isRedZone ? '#f87171' : isSoftZone ? '#fbbf24' : '#e4e4e7'}
                  >
                    {t}
                  </text>
                )}
              </g>
            );
          })}

          {/* Gauge Center Info */}
          <text x={cx} y={cy - 28} textAnchor="middle" className="text-[10px] font-mono tracking-widest" fill="#71717a">
            RPM × 1000
          </text>
          <text x={cx} y={cy - 12} textAnchor="middle" className="text-[9px] font-mono tracking-wider" fill="#a1a1aa">
            WEMOS D1 PULSER
          </text>

          {/* Needle Shadow & Needle Line */}
          <g transform={`rotate(${needleAngle} ${cx} ${cy})`} className="transition-transform duration-75">
            {/* Pointer blade */}
            <polygon
              points={`${cx - 3.5},${cy} ${cx + 3.5},${cy} ${cx + 0.8},${cy - r + 8} ${cx - 0.8},${cy - r + 8}`}
              fill={isHardCut ? '#ef4444' : isSoftCut ? '#f59e0b' : '#38bdf8'}
              filter={isHardCut || isSoftCut ? 'url(#glow)' : undefined}
            />
            {/* Needle tip accent */}
            <line
              x1={cx}
              y1={cy - r + 8}
              x2={cx}
              y2={cy - r + 2}
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>

          {/* Needle Hub Center Cap */}
          <circle cx={cx} cy={cy} r="18" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="8" fill={isHardCut ? '#dc2626' : '#27272a'} />
        </svg>

        {/* Digital Speedometer Overlay */}
        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-3xl font-black font-mono tracking-tight transition-colors ${
                isHardCut
                  ? 'text-red-500 animate-pulse'
                  : isSoftCut
                  ? 'text-amber-400'
                  : 'text-zinc-100'
              }`}
            >
              {Math.round(rpm).toLocaleString()}
            </span>
            <span className="text-xs font-mono text-zinc-500">RPM</span>
          </div>

          {/* Active status pill */}
          <div className="mt-1">
            {isHardCut ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950/90 text-red-400 border border-red-700/60 shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                HARD CUT 100% PULSER GROUNDED
              </span>
            ) : isSoftCut ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                PWM SOFT CUT (DUTY: {Math.round(pwmDuty)}%)
              </span>
            ) : isLaunchActive && enableLaunchControl ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-600/60">
                2-STEP LAUNCH CONTROL ({launchRpm} RPM)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-900 text-emerald-400 border border-zinc-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                IGNITION NORMAL (CUT: 0%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Threshold Information Badges */}
      <div className="w-full grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800/80 text-center">
        <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/50">
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Soft Cut Window</div>
          <div className="text-xs font-mono font-bold text-amber-400">
            {softCutStart} - {maxRpm}
          </div>
        </div>
        <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/50">
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Hard Cut Max</div>
          <div className="text-xs font-mono font-bold text-red-400">
            {maxRpm} RPM
          </div>
        </div>
        <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/50">
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Effective Limit</div>
          <div className="text-xs font-mono font-bold text-cyan-400">
            {effectiveLimit} RPM
          </div>
        </div>
      </div>
    </div>
  );
};
