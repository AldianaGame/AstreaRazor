import React, { useEffect, useRef } from 'react';
import { EngineTelemetry, LimiterConfig } from '../types';
import { Flame, Sparkles } from 'lucide-react';

interface ExhaustVisualizerProps {
  telemetry: EngineTelemetry;
  config: LimiterConfig;
  onManualBackfire: () => void;
}

export const ExhaustVisualizer: React.FC<ExhaustVisualizerProps> = ({
  telemetry,
  config,
  onManualBackfire,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { rpm, isHardCut, isBackfiring, isRumbleActive, exhaustFlame } = telemetry;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;
      color: string;
    }
    const particles: Particle[] = [];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const pipeEndX = width * 0.35;
      const pipeCenterY = height * 0.5;

      // 1. Draw Racing Exhaust Pipe (Muffler)
      // Pipe body
      const gradient = ctx.createLinearGradient(0, pipeCenterY - 26, 0, pipeCenterY + 26);
      gradient.addColorStop(0, '#27272a');
      gradient.addColorStop(0.3, '#71717a');
      gradient.addColorStop(0.5, '#e4e4e7');
      gradient.addColorStop(0.7, '#71717a');
      gradient.addColorStop(1, '#18181b');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(10, pipeCenterY - 24, pipeEndX - 20, 48, [10, 0, 0, 10]);
      ctx.fill();

      // Titanium burnt blue/purple heat gradient on tip
      const tipGrad = ctx.createLinearGradient(pipeEndX - 35, 0, pipeEndX, 0);
      tipGrad.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      tipGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.7)');
      tipGrad.addColorStop(0.8, 'rgba(236, 72, 153, 0.8)');
      tipGrad.addColorStop(1, 'rgba(245, 158, 11, 0.9)');
      ctx.fillStyle = tipGrad;
      ctx.fillRect(pipeEndX - 35, pipeCenterY - 24, 35, 48);

      // Muffler tip outlet lip
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.ellipse(pipeEndX, pipeCenterY, 8, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner glowing core if hot
      const isHot = isBackfiring || isHardCut || exhaustFlame > 10;
      if (isHot) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(pipeEndX - 3, pipeCenterY, 5, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Spawn Flame & Exhaust Particles
      const spawnCount = isBackfiring ? 8 : isHardCut ? 5 : isRumbleActive ? 2 : rpm > 3000 ? 1 : 0;
      for (let i = 0; i < spawnCount; i++) {
        const speed = isBackfiring ? 7 + Math.random() * 8 : isHardCut ? 5 + Math.random() * 6 : 2 + Math.random() * 3;
        const spread = isBackfiring ? (Math.random() - 0.5) * 4.5 : (Math.random() - 0.5) * 2;
        const colorPalette = isBackfiring
          ? ['#60a5fa', '#38bdf8', '#f59e0b', '#ef4444', '#fbbf24', '#ffffff']
          : isHardCut
          ? ['#f59e0b', '#ef4444', '#f97316', '#fbbf24']
          : ['#71717a', '#a1a1aa', '#52525b'];

        particles.push({
          x: pipeEndX + (Math.random() * 6 - 3),
          y: pipeCenterY + (Math.random() * 16 - 8),
          vx: speed,
          vy: spread,
          size: isBackfiring ? 14 + Math.random() * 18 : isHardCut ? 10 + Math.random() * 12 : 5 + Math.random() * 8,
          life: 1.0,
          maxLife: isBackfiring ? 0.045 + Math.random() * 0.05 : 0.03 + Math.random() * 0.04,
          color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        });
      }

      // 3. Draw Flame Cone when Backfire / High flame is active
      if (isBackfiring || (isHardCut && Math.random() < 0.6)) {
        const flameLength = isBackfiring ? 90 + Math.random() * 60 : 60 + Math.random() * 40;
        const flameHeight = isBackfiring ? 28 + Math.random() * 12 : 18 + Math.random() * 10;

        // Outer Orange/Red Flame
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pipeEndX, pipeCenterY - flameHeight);
        ctx.quadraticCurveTo(pipeEndX + flameLength * 0.6, pipeCenterY - flameHeight * 1.3, pipeEndX + flameLength, pipeCenterY);
        ctx.quadraticCurveTo(pipeEndX + flameLength * 0.6, pipeCenterY + flameHeight * 1.3, pipeEndX, pipeCenterY + flameHeight);
        ctx.closePath();
        const outerGrad = ctx.createRadialGradient(pipeEndX + flameLength * 0.4, pipeCenterY, 5, pipeEndX + flameLength * 0.5, pipeCenterY, flameLength * 0.8);
        outerGrad.addColorStop(0, 'rgba(251, 191, 36, 0.95)');
        outerGrad.addColorStop(0.4, 'rgba(239, 68, 68, 0.85)');
        outerGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
        ctx.fillStyle = outerGrad;
        ctx.fill();

        // Inner Blue Core (Supersonic shock diamond)
        ctx.beginPath();
        ctx.moveTo(pipeEndX, pipeCenterY - 10);
        ctx.lineTo(pipeEndX + flameLength * 0.35, pipeCenterY);
        ctx.lineTo(pipeEndX, pipeCenterY + 10);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.fill();
        ctx.restore();
      }

      // 4. Update and Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.maxLife;

        if (p.life <= 0 || p.x > width) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.life * 0.2), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [rpm, isHardCut, isBackfiring, isRumbleActive, exhaustFlame]);

  return (
    <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left Info & Status Badges */}
      <div className="flex flex-col gap-1.5 min-w-[220px]">
        <div className="flex items-center gap-2">
          <Flame className={`w-4 h-4 ${isBackfiring ? 'text-orange-500 animate-bounce' : 'text-zinc-500'}`} />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            SIMULATOR KNALPOT RACING
          </span>
        </div>

        {/* Dynamic status pill */}
        <div>
          {isBackfiring ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-950 text-orange-300 border border-orange-500 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
              BACKFIRE FLAME EXPLOSION!
            </span>
          ) : isRumbleActive ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-600">
              <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
              RUMBLE CHOP IDLE ({config.rumblePattern.replace('_', ' ').toUpperCase()})
            </span>
          ) : isHardCut ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-950 text-red-300 border border-red-600">
              REV LIMITER SPARK CUT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
              GAS BUANG NORMAL
            </span>
          )}
        </div>
      </div>

      {/* Middle Animated Canvas Exhaust */}
      <div className="relative flex-1 w-full h-[90px] rounded-xl overflow-hidden bg-black/90 border border-zinc-800 flex items-center">
        <canvas
          ref={canvasRef}
          width={450}
          height={90}
          className="w-full h-full block"
        />
        {/* Exhaust label watermark */}
        <div className="absolute bottom-1 right-2 pointer-events-none text-[9px] font-mono text-zinc-600">
          EXHAUST FLAME FX
        </div>
      </div>

      {/* Right Action: Manual Backfire trigger */}
      <div className="shrink-0">
        <button
          onClick={onManualBackfire}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)] transition-all active:scale-95 select-none"
        >
          <Flame className="w-4 h-4 text-yellow-300" />
          Tembak Backfire!
        </button>
      </div>
    </div>
  );
};
