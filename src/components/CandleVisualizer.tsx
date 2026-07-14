import React, { useState, useEffect, useRef } from "react";
import { Candle } from "../types";

interface CandleVisualizerProps {
  candle: Candle;
  isLit: boolean;
  onToggleLight: () => void;
  size?: "sm" | "md" | "lg";
}

export const CandleVisualizer: React.FC<CandleVisualizerProps> = ({
  candle,
  isLit,
  onToggleLight,
  size = "md",
}) => {
  const [resolution, setResolution] = useState<"sd" | "hd" | "qhd">("sd");
  const [isVisible, setIsVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waxBurnRef = useRef<HTMLDivElement>(null);
  const statusBadgeRef = useRef<HTMLSpanElement>(null);
  const sparksRef = useRef<any[]>([]);
  const smokeRef = useRef<any[]>([]);
  const wasLitRef = useRef<boolean>(isLit);

  // Performance-optimized Refs for fluid animation and zero layout-thrashing
  const burnProgressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());
  const lastStatusTextRef = useRef<string>("");

  // Setup Intersection Observer to disable canvas drawing when offscreen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: "50px" }
    );

    observer.observe(canvas);
    return () => {
      observer.unobserve(canvas);
    };
  }, []);

  const dimensions = {
    sm: { w: 160, h: 200 },
    md: { w: 240, h: 300 },
    lg: { w: 320, h: 400 }
  };
  const { w, h } = dimensions[size];

  const vesselWidth = w * 0.72;
  const vesselHeight = h * 0.62;
  const vesselX = (w - vesselWidth) / 2;
  const vesselY = h - vesselHeight - 16;

  const getVesselStyle = () => {
    switch (candle.vessel) {
      case "Amber Glass":
        return { labelBg: "bg-[#fcfaf5]/95 border-[#8b6537]/20 text-[#2a251e]" };
      case "Matte Ceramic Slate":
        return { labelBg: "bg-[#1d1f1f]/95 border-white/10 text-[#f3f4f3]" };
      case "Frosted Quartz":
      default:
        return { labelBg: "bg-[#ffffff]/95 border-black/5 text-[#111111]" };
    }
  };

  const vStyle = getVesselStyle();

  // Reset wax level progress whenever the active candle is swapped
  useEffect(() => {
    burnProgressRef.current = 0;
    lastTimeRef.current = Date.now();
    lastStatusTextRef.current = "";
  }, [candle.id]);

  useEffect(() => {
    if (!isVisible) return;

    let animId: number;
    lastTimeRef.current = Date.now();

    const tick = () => {
      draw();
      
      // Smart throttle: only run animation loop at 60fps if lit OR if particles are actively rendering/fading
      const needsAnimate = isLit || smokeRef.current.length > 0 || sparksRef.current.length > 0;
      if (needsAnimate) {
        animId = requestAnimationFrame(tick);
      }
    };
    tick();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [candle, isLit, resolution, size, isVisible]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // High performance time delta accumulation for smooth melting timing (0 layout thrashing)
    const now = Date.now();
    const dt = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    if (isLit) {
      // Linear melting simulation: advances to 100% melted in 120s of continuous burn time
      burnProgressRef.current = Math.min(1, burnProgressRef.current + dt / 120);
    }
    const burnProgress = burnProgressRef.current;

    let scale = 1;
    if (resolution === "hd") scale = 1080 / h;
    else if (resolution === "qhd") scale = 1440 / h;
    else scale = window.devicePixelRatio || 1;

    // Prevent floating-point rounding mismatches that trigger continuous backing-store reallocation/flickering
    const rw = Math.round(w * scale);
    const rh = Math.round(h * scale);
    if (canvas.width !== rw || canvas.height !== rh) {
      canvas.width = rw;
      canvas.height = rh;
    }

    ctx.clearRect(0, 0, rw, rh);
    ctx.save();
    
    // Scale coordinate mapping exactly matching the pixel rounded backing-store
    ctx.scale(rw / w, rh / h);

    const cx = w / 2;
    const ryTop = size === "lg" ? 14 : size === "md" ? 11 : 8;
    const ryBot = size === "lg" ? 18 : size === "md" ? 14 : 10;
    const rxTop = vesselWidth / 2;
    const rxBot = rxTop * 0.92;
    const yTop = vesselY;
    const yBot = vesselY + vesselHeight;

    // 1. Background glow
    if (isLit) {
      const g = ctx.createRadialGradient(cx, yTop - 25, 5, cx, yTop - 25, h * 0.6);
      g.addColorStop(0, `${candle.color}35`);
      g.addColorStop(0.3, `${candle.color}15`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, yTop - 25, h * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Base shadow
    const sG = ctx.createRadialGradient(cx, yBot + 4, 1, cx, yBot + 4, rxBot * 1.3);
    sG.addColorStop(0, "rgba(12, 6, 2, 0.4)");
    sG.addColorStop(0.5, "rgba(12, 6, 2, 0.15)");
    sG.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sG;
    ctx.beginPath();
    ctx.ellipse(cx, yBot + 4, rxBot * 1.3, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const traceVessel = (inset = 0) => {
      ctx.beginPath();
      ctx.ellipse(cx, yTop, rxTop - inset, ryTop, 0, Math.PI, 0, true);
      ctx.lineTo(cx + rxBot - inset, yBot);
      ctx.ellipse(cx, yBot, rxBot - inset, ryBot, 0, 0, Math.PI, false);
      ctx.lineTo(cx - rxTop + inset, yTop);
      ctx.closePath();
    };

    // Smoothly lower the wax base level from 0.22 to 0.65 as burnProgress advances
    const startingLevel = 0.22;
    const endingLevel = 0.65;
    const currentBaseLevel = startingLevel + burnProgress * (endingLevel - startingLevel);
    
    // Dynamic wax level - the lit candle recesses slightly further down when lit to simulate melting
    const wLevel = isLit ? currentBaseLevel + 0.04 : currentBaseLevel;

    // Direct DOM status text update cached to prevent redundant, slow DOM updates on every frame
    const statusText = isLit 
      ? `Burning (${Math.round((1 - burnProgress) * 100)}% Wax)` 
      : "Dormant";
    if (statusBadgeRef.current && lastStatusTextRef.current !== statusText) {
      statusBadgeRef.current.textContent = statusText;
      lastStatusTextRef.current = statusText;
    }

    const yWax = yTop + vesselHeight * wLevel;
    const rxWax = rxTop - (rxTop - rxBot) * wLevel;
    const ryWax = ryTop - (ryTop - ryBot) * wLevel;

    // 3. Draw Wax (If glass/frosted)
    if (candle.vessel !== "Matte Ceramic Slate") {
      ctx.save();
      traceVessel(1.5);
      ctx.clip();

      const wGrad = ctx.createLinearGradient(0, yWax, 0, yBot);
      wGrad.addColorStop(0, candle.color);
      wGrad.addColorStop(0.4, adjustColor(candle.color, -12));
      wGrad.addColorStop(1, adjustColor(candle.color, -30));
      ctx.fillStyle = wGrad;

      ctx.beginPath();
      ctx.ellipse(cx, yWax, rxWax, ryWax, 0, 0, Math.PI);
      ctx.lineTo(cx + rxBot - 3, yBot);
      ctx.ellipse(cx, yBot, rxBot - 3, ryBot - 3, 0, 0, Math.PI, false);
      ctx.lineTo(cx - rxWax, yWax);
      ctx.closePath();
      ctx.fill();

      // Wax surface
      ctx.beginPath();
      ctx.ellipse(cx, yWax, rxWax, ryWax, 0, 0, Math.PI * 2);
      const sGrad = ctx.createRadialGradient(cx, yWax, 2, cx, yWax, rxWax);
      if (isLit) {
        sGrad.addColorStop(0, "#fff5d9");
        sGrad.addColorStop(0.2, "#ffb94f");
        sGrad.addColorStop(0.6, candle.color);
        sGrad.addColorStop(1, adjustColor(candle.color, -20));
      } else {
        sGrad.addColorStop(0, adjustColor(candle.color, 10));
        sGrad.addColorStop(1, adjustColor(candle.color, -15));
      }
      ctx.fillStyle = sGrad;
      ctx.fill();
      ctx.restore();
    }

    // 4. Vessel styles
    if (candle.vessel === "Amber Glass") {
      traceVessel();
      const glG = ctx.createLinearGradient(cx - rxTop, 0, cx + rxTop, 0);
      glG.addColorStop(0, "rgba(80, 36, 10, 0.95)");
      glG.addColorStop(0.08, "rgba(130, 66, 20, 0.75)");
      glG.addColorStop(0.25, "rgba(180, 96, 26, 0.22)");
      glG.addColorStop(0.5, "rgba(200, 116, 36, 0.12)");
      glG.addColorStop(0.75, "rgba(180, 96, 26, 0.22)");
      glG.addColorStop(0.92, "rgba(130, 66, 20, 0.75)");
      glG.addColorStop(1, "rgba(80, 36, 10, 0.95)");
      ctx.fillStyle = glG;
      ctx.fill();

      ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Bottom base
      ctx.beginPath();
      ctx.ellipse(cx, yBot, rxBot, ryBot, 0, 0, Math.PI * 2);
      const bG = ctx.createLinearGradient(0, yBot - 8, 0, yBot + ryBot);
      bG.addColorStop(0, "rgba(70, 30, 6, 0.3)");
      bG.addColorStop(0.5, "rgba(45, 18, 2, 0.85)");
      bG.addColorStop(1, "rgba(20, 5, 0, 0.95)");
      ctx.fillStyle = bG;
      ctx.fill();
      ctx.stroke();

      // Top lip
      ctx.beginPath();
      ctx.ellipse(cx, yTop, rxTop, ryTop, 0, 0, Math.PI * 2);
      const rG = ctx.createLinearGradient(cx - rxTop, 0, cx + rxTop, 0);
      rG.addColorStop(0, "rgba(110, 45, 10, 0.9)");
      rG.addColorStop(0.5, "rgba(255, 225, 150, 0.7)");
      rG.addColorStop(1, "rgba(110, 45, 10, 0.9)");
      ctx.fillStyle = rG;
      ctx.fill();
      ctx.stroke();

    } else if (candle.vessel === "Matte Ceramic Slate") {
      traceVessel();
      const cG = ctx.createLinearGradient(cx - rxTop, 0, cx + rxTop, 0);
      cG.addColorStop(0, "#131414");
      cG.addColorStop(0.12, "#232424");
      cG.addColorStop(0.4, "#3a3b3c");
      cG.addColorStop(0.6, "#3a3b3c");
      cG.addColorStop(0.88, "#1f2020");
      cG.addColorStop(1, "#101111");
      ctx.fillStyle = cG;
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rim top cavity
      ctx.beginPath();
      ctx.ellipse(cx, yTop, rxTop, ryTop, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#151616";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.stroke();

      // Redraw wax inside ceramic jar cavity
      ctx.beginPath();
      ctx.ellipse(cx, yWax, rxWax, ryWax, 0, 0, Math.PI * 2);
      const cerWG = ctx.createRadialGradient(cx, yWax, 2, cx, yWax, rxWax);
      if (isLit) {
        cerWG.addColorStop(0, "#fff5d9");
        cerWG.addColorStop(0.2, "#ffb94f");
        cerWG.addColorStop(0.5, candle.color);
        cerWG.addColorStop(1, adjustColor(candle.color, -25));
      } else {
        cerWG.addColorStop(0, adjustColor(candle.color, 12));
        cerWG.addColorStop(1, adjustColor(candle.color, -18));
      }
      ctx.fillStyle = cerWG;
      ctx.fill();

    } else {
      // Frosted Quartz
      traceVessel();
      const qG = ctx.createLinearGradient(cx - rxTop, 0, cx + rxTop, 0);
      qG.addColorStop(0, "rgba(235, 240, 245, 0.9)");
      qG.addColorStop(0.12, "rgba(250, 252, 255, 0.65)");
      qG.addColorStop(0.35, "rgba(255, 255, 255, 0.42)");
      qG.addColorStop(0.5, "rgba(250, 250, 255, 0.32)");
      qG.addColorStop(0.65, "rgba(255, 255, 255, 0.42)");
      qG.addColorStop(0.88, "rgba(250, 252, 255, 0.65)");
      qG.addColorStop(1, "rgba(235, 240, 245, 0.9)");
      ctx.fillStyle = qG;
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Base bottom
      ctx.beginPath();
      ctx.ellipse(cx, yBot, rxBot, ryBot, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.stroke();

      // Top ring
      ctx.beginPath();
      ctx.ellipse(cx, yTop, rxTop, ryTop, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fill();
      ctx.stroke();
    }

    // Specular sheen reflections
    if (candle.vessel !== "Matte Ceramic Slate") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      ctx.beginPath();
      ctx.ellipse(cx - rxTop * 0.75, yTop + vesselHeight * 0.5, 3.5, vesselHeight * 0.4, 0.04, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.beginPath();
      ctx.ellipse(cx - rxTop * 0.65, yTop + vesselHeight * 0.5, 7, vesselHeight * 0.45, 0.04, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Wick Rendering
    const wickW = size === "lg" ? 4.5 : size === "md" ? 3.5 : 2.5;
    const wickH = size === "lg" ? 13 : size === "md" ? 10 : 7.5;
    const yWickBase = yWax;
    const yWickTop = yWax - wickH;

    if (candle.wick.includes("Wooden")) {
      ctx.fillStyle = "#8a5d3b";
      ctx.fillRect(cx - wickW, yWickTop, wickW * 2, wickH);
      ctx.fillStyle = "#252525";
      ctx.fillRect(cx - wickW, yWickTop, wickW * 2, wickH * 0.4);
    } else {
      ctx.strokeStyle = "#252525";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx, yWickBase);
      ctx.bezierCurveTo(cx - 1.5, yWickBase - wickH * 0.5, cx + 0.8, yWickBase - wickH * 0.8, cx - 0.8, yWickTop);
      ctx.stroke();

      ctx.fillStyle = "#0c0c0c";
      ctx.beginPath();
      ctx.arc(cx - 0.8, yWickTop, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isLit) {
      const eG = ctx.createRadialGradient(cx, yWickTop, 0.5, cx, yWickTop, 3.5);
      eG.addColorStop(0, "#ffffff");
      eG.addColorStop(0.3, "#ff5500");
      eG.addColorStop(1, "rgba(255, 0, 0, 0)");
      ctx.fillStyle = eG;
      ctx.beginPath();
      ctx.arc(cx, yWickTop, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Flame (Deformed Bézier curves + Particle emission)
    const baseFlameY = yWickTop - 1.5;
    const flameW = size === "lg" ? 22 : size === "md" ? 17 : 12;
    const flameH = size === "lg" ? 44 : size === "md" ? 34 : 24;

    if (isLit) {
      const t = Date.now() * 0.0036;
      const fY = Math.sin(t * 14) * 1.5 + Math.sin(t * 26) * 0.8;
      const sX = Math.sin(t * 6.5) * 1.4 + Math.sin(t * 12.5) * 0.6;
      const topFlameY = baseFlameY - flameH + fY;
      const peakX = cx + sX;

      // Blue flame base
      ctx.fillStyle = "rgba(41, 128, 185, 0.45)";
      ctx.beginPath();
      ctx.ellipse(cx, baseFlameY - 2, flameW * 0.4, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer Flame Teardrop
      ctx.beginPath();
      ctx.moveTo(cx - flameW/2, baseFlameY);
      ctx.bezierCurveTo(cx - flameW * 0.72, baseFlameY - flameH * 0.4, cx - flameW * 0.22, baseFlameY - flameH * 0.85, peakX, topFlameY);
      ctx.bezierCurveTo(cx + flameW * 0.22, baseFlameY - flameH * 0.85, cx + flameW * 0.72, baseFlameY - flameH * 0.4, cx + flameW/2, baseFlameY);
      ctx.closePath();

      const fG = ctx.createLinearGradient(cx, baseFlameY, peakX, topFlameY);
      fG.addColorStop(0, "rgba(10, 0, 40, 0.05)");
      fG.addColorStop(0.12, "#1d3557");
      fG.addColorStop(0.28, "#e63946");
      fG.addColorStop(0.48, "#f4a261");
      fG.addColorStop(0.72, "#e9c46a");
      fG.addColorStop(1, "rgba(255, 255, 255, 0.98)");
      ctx.fillStyle = fG;

      ctx.shadowColor = "#f4a261";
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner Hot Core
      const iw = flameW * 0.52;
      const ih = flameH * 0.62;
      const tIY = baseFlameY - ih + fY * 0.8;
      const pIX = cx + sX * 0.68;

      ctx.beginPath();
      ctx.moveTo(cx - iw/2, baseFlameY - 2);
      ctx.bezierCurveTo(cx - iw * 0.68, baseFlameY - ih * 0.4, cx - iw * 0.18, baseFlameY - ih * 0.85, pIX, tIY);
      ctx.bezierCurveTo(cx + iw * 0.18, baseFlameY - ih * 0.85, cx + iw * 0.68, baseFlameY - ih * 0.4, cx + iw/2, baseFlameY - 2);
      ctx.closePath();

      const iG = ctx.createLinearGradient(cx, baseFlameY, pIX, tIY);
      iG.addColorStop(0, "#ee9b00");
      iG.addColorStop(0.4, "#ffd166");
      iG.addColorStop(1, "#ffffff");
      ctx.fillStyle = iG;
      ctx.fill();

      // Sparks Emitter
      if (Math.random() < 0.1) {
        sparksRef.current.push({
          id: Math.random(),
          x: cx + sX * 0.4,
          y: baseFlameY - flameH * 0.4,
          vx: (Math.random() - 0.5) * 1.6,
          vy: -Math.random() * 1.6 - 0.6,
          life: 0,
          maxLife: 25 + Math.floor(Math.random() * 25),
          size: 0.9 + Math.random() * 1.3,
          color: Math.random() < 0.55 ? "#ffe7ad" : "#ffa62b"
        });
      }
    }

    // 7. Smoke Burst on Extinguish
    const wasLit = wasLitRef.current;
    if (wasLit && !isLit) {
      const smokeCount = 16 + Math.floor(Math.random() * 8);
      for (let i = 0; i < smokeCount; i++) {
        smokeRef.current.push({
          id: Math.random(),
          x: cx,
          y: yWickTop - 1,
          vx: (Math.random() - 0.5) * 1.6,
          vy: -Math.random() * 1.0 - 0.5,
          life: 0,
          maxLife: 55 + Math.floor(Math.random() * 55),
          size: 2.5 + Math.random() * 3.5,
          alpha: 0.5 + Math.random() * 0.4
        });
      }
    }
    wasLitRef.current = isLit;

    // Update & draw sparks
    sparksRef.current = sparksRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= 0.015;
      p.life++;
      const alpha = 1 - (p.life / p.maxLife);
      if (alpha <= 0) return false;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
    ctx.globalAlpha = 1.0;

    // Update & draw smoke
    smokeRef.current = smokeRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx += Math.sin(p.life * 0.12) * 0.1;
      p.vy -= 0.008;
      p.life++;

      const progress = p.life / p.maxLife;
      const currentAlpha = p.alpha * (1 - progress);
      const currentSize = p.size * (1 + progress * 2.8);
      if (currentAlpha <= 0) return false;

      ctx.fillStyle = `rgba(135, 135, 140, ${currentAlpha * 0.45})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });

    ctx.restore();
  };

  return (
    <div 
      className="relative select-none flex flex-col items-center justify-end group"
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      {/* Hidden DOM element animated by CSS keyframes to track wax burn progress */}
      <div 
        key={candle.id}
        ref={waxBurnRef}
        className="animate-wax-burn"
        style={{
          display: "none",
          animationPlayState: isLit ? "running" : "paused"
        }}
      />

      {/* 1440p Resolution Controller Widget */}
      <div className="absolute top-2 right-2 flex items-center space-x-1.5 bg-black/65 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full text-[8px] font-mono text-gray-300 z-30 transition-opacity opacity-0 group-hover:opacity-100 duration-300">
        <span className="opacity-60 uppercase font-bold tracking-widest hidden sm:inline">Render:</span>
        <button
          onClick={(e) => { e.stopPropagation(); setResolution("sd"); }}
          className={`px-1.5 py-0.5 rounded cursor-pointer font-bold transition-all ${resolution === "sd" ? "bg-white text-black" : "hover:text-white"}`}
        >
          SD
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setResolution("hd"); }}
          className={`px-1.5 py-0.5 rounded cursor-pointer font-bold transition-all ${resolution === "hd" ? "bg-amber-500 text-black" : "hover:text-white"}`}
        >
          1080p
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setResolution("qhd"); }}
          className={`px-1.5 py-0.5 rounded cursor-pointer font-bold transition-all ${resolution === "qhd" ? "bg-emerald-500 text-white" : "hover:text-white"}`}
        >
          1440p QHD
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onClick={onToggleLight}
        className="absolute inset-0 cursor-pointer z-10"
        style={{ width: `${w}px`, height: `${h}px`, display: "block" }}
      />

      {/* Apothecary Label Overlay */}
      <div 
        className="absolute pointer-events-none z-20 flex flex-col items-center justify-center text-center"
        style={{
          left: `${vesselX}px`,
          width: `${vesselWidth}px`,
          top: `${vesselY + (size === "lg" ? 22 : size === "md" ? 16 : 10)}px`,
          height: `${vesselHeight - (size === "lg" ? 48 : size === "md" ? 36 : 24)}px`,
        }}
      >
        <div className={`w-11/12 py-2 px-1.5 flex flex-col items-center justify-center text-center rounded-[2px] border ${vStyle.labelBg} shadow-md`}>
          <div className="text-[5px] sm:text-[6px] tracking-[0.22em] uppercase font-light opacity-60 mb-0.5 leading-none">
            Stage 9 Scent Studio
          </div>
          <div className="w-5 h-[0.5px] bg-current opacity-35 my-0.5" />
          <div className="font-serif font-extrabold tracking-wide text-[8px] sm:text-[10px] md:text-[11px] uppercase leading-tight my-0.5">
            {candle.name}
          </div>
          <div className="font-mono text-[5.5px] sm:text-[6px] opacity-75 mt-0.5 leading-none line-clamp-1">
            {candle.heartNotes[0]} &bull; {candle.baseNotes[0]}
          </div>
          <div className="text-[5px] opacity-50 mt-1 font-light leading-none">
            {candle.weight} &bull; {candle.burnTime}
          </div>
        </div>
      </div>

      {/* Lit status Badge */}
      <div className="absolute bottom-4 z-20 left-0 right-0 flex justify-center pointer-events-none">
        <span 
          ref={statusBadgeRef}
          className={`text-[7px] font-mono tracking-widest uppercase transition-all duration-500 px-2 py-0.5 rounded-full ${
            isLit 
              ? "bg-amber-400/20 text-amber-300 animate-pulse border border-amber-400/30 shadow-[0_0_10px_rgba(251,191,36,0.2)]" 
              : "bg-black/20 text-white/40 border border-transparent"
          }`}
        >
          {isLit ? "Burning" : "Dormant"}
        </span>
      </div>
    </div>
  );
};

function adjustColor(hex: string, percent: number): string {
  let color = hex.replace("#", "");
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  r = Math.max(0, Math.min(255, r + (percent / 100) * 255));
  g = Math.max(0, Math.min(255, g + (percent / 100) * 255));
  b = Math.max(0, Math.min(255, b + (percent / 100) * 255));

  const rHex = Math.round(r).toString(16).padStart(2, "0");
  const gHex = Math.round(g).toString(16).padStart(2, "0");
  const bHex = Math.round(b).toString(16).padStart(2, "0");
  return `#${rHex}${gHex}${bHex}`;
}
