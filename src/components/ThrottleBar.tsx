import React from 'react';
import { Gauge, Flame, Flag, RefreshCw } from 'lucide-react';

interface ThrottleBarProps {
  throttle: number;
  onThrottleChange: (val: number) => void;
  isLaunchPressed: boolean;
  onLaunchToggle: (pressed: boolean) => void;
  onQuickRev: (targetRpmPercent: number) => void;
  onIdle: () => void;
}

export const ThrottleBar: React.FC<ThrottleBarProps> = ({
  throttle,
  onThrottleChange,
  isLaunchPressed,
  onLaunchToggle,
  onQuickRev,
  onIdle,
}) => {
  return (
    <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center gap-4">
      {/* Throttle slider */}
      <div className="flex-1 w-full space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-300">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">GAS MOTOR (VIRTUAL THROTTLE / TPS):</span>
          </div>
          <span className="font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
            {Math.round(throttle)}%
          </span>
        </div>
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={throttle}
            onChange={(e) => onThrottleChange(Number(e.target.value))}
            className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-zinc-500">
          <span>0% (Idle ~1,400 RPM)</span>
          <span>50% (Cruising)</span>
          <span>100% (Gas Pol / Redline)</span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onIdle}
          className="flex items-center gap-1 px-3 py-2 text-xs font-mono font-medium rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Lepas Gas
        </button>

        <button
          onMouseDown={() => onQuickRev(90)}
          onMouseUp={onIdle}
          onTouchStart={() => onQuickRev(90)}
          onTouchEnd={onIdle}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all active:scale-95 select-none"
        >
          <Flame className="w-4 h-4" />
          Geber Gas! (Hold)
        </button>

        <button
          onMouseDown={() => onLaunchToggle(true)}
          onMouseUp={() => onLaunchToggle(false)}
          onTouchStart={() => onLaunchToggle(true)}
          onTouchEnd={() => onLaunchToggle(false)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-xl border transition-all active:scale-95 select-none ${
            isLaunchPressed
              ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_20px_#06b6d4]'
              : 'bg-zinc-900 text-cyan-300 border-cyan-800/80 hover:bg-zinc-800'
          }`}
        >
          <Flag className="w-4 h-4" />
          2-Step Launch (Hold)
        </button>
      </div>
    </div>
  );
};
