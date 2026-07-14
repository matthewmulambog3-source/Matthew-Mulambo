import React, { useState, useRef, useEffect } from "react";
import { Flame } from "lucide-react";

interface InteractiveCandle3DProps {
  color: string;
  vessel?: string;
  isLit?: boolean;
  name?: string;
  intensity?: number;
  className?: string;
}

export const InteractiveCandle3D: React.FC<InteractiveCandle3DProps> = ({
  color,
  vessel = "Amber Glass",
  isLit = false,
  name = "Prestige Candle",
  intensity = 1.0,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0); // rotation in radians
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const rotationStartX = useRef(0);
  const velocityRef = useRef(0.01); // natural idle spin velocity
  const lastTimeRef = useRef(Date.now());

  // Handle Drag / Rotate Gestures
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    rotationStartX.current = rotation;
    velocityRef.current = 0;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;
    // Rotate 1 radian per 100px dragged
    const newRotation = rotationStartX.current + deltaX * 0.01;
    setRotation(newRotation);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Give a slight residual velocity based on drag direction
      velocityRef.current = 0.003;
    }
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    rotationStartX.current = rotation;
    velocityRef.current = 0;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - dragStartX.current;
    const newRotation = rotationStartX.current + deltaX * 0.01;
    setRotation(newRotation);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    velocityRef.current = 0.003;
  };

  // Bind document listeners to handle dragging outside element
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, rotation]);

  // Render/Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const tick = () => {
      const now = Date.now();
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Update idle spin if not dragging
      if (!isDragging) {
        setRotation((prev) => prev + velocityRef.current);
      }

      // Draw routine
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2 + 15;
      const r = Math.min(w, h) * 0.32; // radius of cylinder
      const cylinderH = h * 0.45; // height of cylinder

      // Vessel styling variables
      let vesselPrimary = "#d4a373";
      let vesselSecondary = "#8b5a2b";
      let isGlossy = false;
      let isCeramic = false;

      if (vessel.includes("Amber")) {
        vesselPrimary = "#b0703c";
        vesselSecondary = "#4a2505";
        isGlossy = true;
      } else if (vessel.includes("Ceramic") || vessel.includes("Slate")) {
        vesselPrimary = "#4f545c";
        vesselSecondary = "#1e2124";
        isCeramic = true;
      } else if (vessel.includes("Quartz") || vessel.includes("Frosted")) {
        vesselPrimary = "#eceff1";
        vesselSecondary = "#90a4ae";
        isGlossy = true;
      }

      // 1. Draw BACK RIM & INSIDE WAX (before cylinder body)
      const ry = r * 0.22; // ellipse vertical radius
      
      // Wax Surface
      ctx.beginPath();
      ctx.ellipse(cx, cy - cylinderH, r - 3, ry - 1, 0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Wax Shimmer / Depth
      const waxGrad = ctx.createRadialGradient(cx, cy - cylinderH, 1, cx, cy - cylinderH, r);
      waxGrad.addColorStop(0, "rgba(255,255,255,0.45)");
      waxGrad.addColorStop(0.3, "rgba(0,0,0,0)");
      waxGrad.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = waxGrad;
      ctx.fill();

      // Wick base
      ctx.fillStyle = "#5c4033";
      ctx.fillRect(cx - 3, cy - cylinderH - 6, 6, 6);

      // Flame Glow & Flicker if lit
      if (isLit) {
        const flicker = Math.sin(now * 0.015) * 2;
        const flameH = 22 + Math.sin(now * 0.02) * 4;
        
        ctx.save();
        ctx.shadowBlur = 24;
        ctx.shadowColor = "#ffa502";
        
        // Halo Glow
        const rGrad = ctx.createRadialGradient(cx + flicker*0.5, cy - cylinderH - 15, 2, cx, cy - cylinderH - 15, 35);
        rGrad.addColorStop(0, "rgba(255,165,2,0.6)");
        rGrad.addColorStop(0.4, "rgba(255,69,0,0.25)");
        rGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy - cylinderH - 15, 35, 0, Math.PI * 2);
        ctx.fillStyle = rGrad;
        ctx.fill();

        // Core Candle Flame
        ctx.beginPath();
        ctx.moveTo(cx, cy - cylinderH - 6);
        ctx.quadraticCurveTo(cx - 6 + flicker*0.4, cy - cylinderH - 18, cx - 4, cy - cylinderH - 24);
        ctx.quadraticCurveTo(cx + flicker*0.8, cy - cylinderH - flameH - 8, cx, cy - cylinderH - flameH - 14);
        ctx.quadraticCurveTo(cx + 4 + flicker*0.4, cy - cylinderH - 24, cx + 4, cy - cylinderH - 18);
        ctx.closePath();
        
        const fGrad = ctx.createLinearGradient(cx, cy - cylinderH - 6, cx, cy - cylinderH - 28);
        fGrad.addColorStop(0, "#2f3542"); // blue base
        fGrad.addColorStop(0.2, "#ff4757"); // orange center
        fGrad.addColorStop(0.7, "#ffa502"); // gold
        fGrad.addColorStop(1, "#ffffff"); // white tip
        ctx.fillStyle = fGrad;
        ctx.fill();
        ctx.restore();
      }

      // 2. Draw CYLINDER BASE SHADOW (Ground Contact)
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, ry * 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.filter = "blur(6px)";
      ctx.fill();
      ctx.filter = "none";

      // 3. Draw CYLINDER WALL (Vessel Body)
      const bodyGrad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      bodyGrad.addColorStop(0, vesselSecondary);
      bodyGrad.addColorStop(0.12, vesselPrimary);
      bodyGrad.addColorStop(0.45, vesselPrimary);
      bodyGrad.addColorStop(0.75, vesselSecondary);
      bodyGrad.addColorStop(1, "rgba(0,0,0,0.92)");

      ctx.beginPath();
      ctx.moveTo(cx - r, cy - cylinderH);
      ctx.lineTo(cx + r, cy - cylinderH);
      ctx.lineTo(cx + r, cy);
      ctx.ellipse(cx, cy, r, ry, 0, 0, Math.PI, false);
      ctx.lineTo(cx - r, cy - cylinderH);
      ctx.closePath();
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Highlight Overlay (Specular glare)
      if (isGlossy) {
        const specGrad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
        specGrad.addColorStop(0, "rgba(255,255,255,0)");
        specGrad.addColorStop(0.28, "rgba(255,255,255,0.18)");
        specGrad.addColorStop(0.35, "rgba(255,255,255,0.32)");
        specGrad.addColorStop(0.42, "rgba(255,255,255,0.06)");
        specGrad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = specGrad;
        ctx.beginPath();
        ctx.moveTo(cx - r, cy - cylinderH);
        ctx.lineTo(cx + r, cy - cylinderH);
        ctx.lineTo(cx + r, cy);
        ctx.ellipse(cx, cy, r, ry, 0, 0, Math.PI, false);
        ctx.lineTo(cx - r, cy - cylinderH);
        ctx.closePath();
        ctx.fill();
      }

      // 4. Draw FRONT VESSEL LIP/RIM
      ctx.beginPath();
      ctx.ellipse(cx, cy - cylinderH, r, ry, 0, 0, Math.PI, false);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glass layer shadow
      ctx.beginPath();
      ctx.ellipse(cx, cy - cylinderH, r - 2, ry - 1, 0, 0, Math.PI, false);
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 5. Draw ROTATING EMBLEM WRAPPED ON THE CYLINDER SURFACE
      // We project the Prestige Emblem based on current rotation angle.
      // Let's compute local X and visibility.
      // The emblem faces forward when rotation = 0.
      const emblemY = cy - cylinderH * 0.5;
      const logoAngle = rotation % (Math.PI * 2);

      // We can draw 1 or 2 logos to handle wrapping seamlessly
      for (let offset = -1; offset <= 1; offset++) {
        const angle = logoAngle + offset * Math.PI * 2;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        // Visible only on the front side (facing towards us, z > 0)
        if (cosAngle > 0) {
          ctx.save();
          
          // Project width & center of emblem on cylinder surface
          const projX = cx + r * sinAngle;
          const projW = 44 * cosAngle; // width scale squished due to perspective
          
          // If the width squishes, we draw an elegant golden crest medallion
          ctx.translate(projX, emblemY);
          
          // Draw circular gold seal
          ctx.beginPath();
          ctx.arc(0, 0, 18 * cosAngle, 0, Math.PI * 2);
          const goldGrad = ctx.createLinearGradient(-15, -15, 15, 15);
          goldGrad.addColorStop(0, "#fff2b2");
          goldGrad.addColorStop(0.5, "#d4af37");
          goldGrad.addColorStop(1, "#8c6600");
          ctx.fillStyle = goldGrad;
          ctx.fill();
          ctx.strokeStyle = "#4a2505";
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Draw a small shining crown inside
          ctx.beginPath();
          ctx.moveTo(-10 * cosAngle, 5);
          ctx.lineTo(-12 * cosAngle, -5);
          ctx.lineTo(-5 * cosAngle, 0);
          ctx.lineTo(0, -9);
          ctx.lineTo(5 * cosAngle, 0);
          ctx.lineTo(12 * cosAngle, -5);
          ctx.lineTo(10 * cosAngle, 5);
          ctx.closePath();
          ctx.fillStyle = "#8c6600";
          ctx.fill();

          // Tiny jewel on crest
          ctx.beginPath();
          ctx.arc(0, 5, 2 * cosAngle, 0, Math.PI * 2);
          ctx.fillStyle = color; // matches wax color!
          ctx.fill();

          ctx.restore();
        }
      }

      // Render 3D tag
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("3D ACTIVE • DRAG TO SPIN", cx, cy + r * 0.45 + 15);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [color, vessel, isLit, rotation]);

  return (
    <div 
      className="relative select-none cursor-grab active:cursor-grabbing w-full flex flex-col items-center justify-center p-2 bg-gradient-to-b from-[#FAF8F5]/80 to-[#FAF8F5] border border-brand-cream shadow-sm rounded-none group hover:shadow-md transition-shadow"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <canvas 
        ref={canvasRef} 
        width={240} 
        height={260} 
        className="w-[240px] h-[260px] drop-shadow-lg"
      />
      
      {/* Dynamic vessel rim tag & label */}
      <div className="absolute top-3 left-3 flex items-center gap-1 bg-brand-plum text-white text-[8px] uppercase tracking-widest px-2 py-0.5 font-bold shadow-sm">
        <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-ping" />
        <span>Live 3D Renderer</span>
      </div>
    </div>
  );
};
