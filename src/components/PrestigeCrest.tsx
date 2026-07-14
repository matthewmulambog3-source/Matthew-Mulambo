import React from "react";

interface PrestigeCrestProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const PrestigeCrest: React.FC<PrestigeCrestProps> = ({ 
  className = "", 
  size = "md" 
}) => {
  const dimensions = {
    sm: "h-20 w-20",
    md: "h-40 w-40",
    lg: "h-72 w-72 md:h-80 md:w-80",
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* SVG Shield & Crest */}
      <svg
        className={`${dimensions[size]} filter drop-shadow-xl`}
        viewBox="0 0 450 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Premium 3D Metallic Gold Gradient for stars, crown, and wreath */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFEAA7" />
            <stop offset="30%" stopColor="#F5CD79" />
            <stop offset="60%" stopColor="#ECCC68" />
            <stop offset="90%" stopColor="#FFA502" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>

          {/* Reusable Golden Star Template */}
          <g id="star-icon">
            <polygon
              points="0,-11 3.2,-3.5 11,-3.5 5,1.5 7.5,9 0,4.5 -7.5,9 -5,1.5 -11,-3.5 -3.2,-3.5"
              fill="url(#goldGradient)"
              stroke="#AA820A"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </g>
        </defs>

        {/* --- SHIELD BASE --- */}
        {/* Precise Gothic Shield with curved top dips, bowed sides, and pointy base */}
        <path
          d="M 225 35 Q 312.5 15 400 65 C 400 175 390 325 225 450 C 60 325 50 175 50 65 Q 137.5 15 225 35 Z"
          fill="white"
          stroke="#8A1540"
          strokeWidth="12"
          strokeLinejoin="round"
        />

        {/* --- CHAMBER DIVIDERS --- */}
        {/* Elegant Inverted-Y Dividers in Deep Plum */}
        <path
          d="M 225 35 L 225 210"
          stroke="#8A1540"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 225 210 L 53 250"
          stroke="#8A1540"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 225 210 L 397 250"
          stroke="#8A1540"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* --- CHAMBER 1: TOP LEFT (7 GOLDEN STARS MATCHING LOGO ARCH) --- */}
        <use href="#star-icon" x="115" y="70" transform="scale(1.2)" />
        <use href="#star-icon" x="180" y="60" transform="scale(0.95)" />
        <use href="#star-icon" x="95" y="115" transform="scale(1.15)" />
        <use href="#star-icon" x="145" y="110" transform="scale(1.35)" />
        <use href="#star-icon" x="195" y="140" transform="scale(0.85)" />
        <use href="#star-icon" x="110" y="175" transform="scale(1.05)" />
        <use href="#star-icon" x="160" y="170" transform="scale(1.15)" />


        {/* --- CHAMBER 2: TOP RIGHT (CROWN & LAUREL WREATH) --- */}
        {/* Laurel Wreath */}
        <g transform="translate(325, 135)">
          {/* Left Branch */}
          <path d="M -50,30 C -55,-15 -20,-35 -5,-32" stroke="url(#goldGradient)" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Right Branch */}
          <path d="M 50,30 C 55,-15 20,-35 5,-32" stroke="url(#goldGradient)" strokeWidth="3" fill="none" strokeLinecap="round" />
          
          {/* Laurel Leaves left side */}
          <path d="M -50,20 C -62,18 -60,8 -50,14 C -40,20 -42,24 -50,20 Z" fill="url(#goldGradient)" stroke="#AA820A" strokeWidth="0.8" />
          <path d="M -48,0 C -60,-4 -56,-14 -46,-8 C -36,-2 -38,2 -48,0 Z" fill="url(#goldGradient)" stroke="#AA820A" strokeWidth="0.8" />
          <path d="M -40,-16 C -50,-22 -44,-30 -36,-22 C -28,-14 -32,-10 -40,-16 Z" fill="url(#goldGradient)" stroke="#AA820A" strokeWidth="0.8" />
          <path d="M -24,-28 C -32,-36 -24,-42 -18,-32 C -12,-22 -16,-20 -24,-28 Z" fill="url(#goldGradient)" stroke="#AA820A" strokeWidth="0.8" />
          <path d="M -5,-32 C -10,-42 2,-44 4,-34 C 6,-24 0,-24 -5,-32 Z" fill="url(#goldGradient)" stroke="#AA820A" strokeWidth="0.8" />

          {/* Laurel Leaves right side */}
          <path d="M 50,20 C 62,18 60,8 50,14 C 40,20 42,24 50,20 Z" fill="url(#goldGradient)" stroke="#AA820A" strokeWidth="0.8" />
          <path d="M 48,0 C 60,-4 56,-14 46,-8 C 36,-2 38,2 48,0 Z" fill="url(#goldGradient)" stroke="#AA820A" strokeWidth="0.8" />
          <path d="M 40,-16 C 50,-22 44,-30 36,-22 C 28,-14 32,-10 40,-16 Z" fill="url(#goldGradient)" stroke="#AA820A" strokeWidth="0.8" />
          <path d="M 24,-28 C 32,-36 24,-42 18,-32 C 12,-22 16,-20 24,-28 Z" fill="url(#goldGradient)" stroke="#AA820A" strokeWidth="0.8" />
        </g>

        {/* Crown */}
        <g transform="translate(325, 130)">
          {/* Base outer shadow */}
          <path d="M -34,22 Q 0,27 34,22 L 34,12 Q 0,17 -34,12 Z" fill="#6A0E30" opacity="0.4" />
          
          {/* Base curve (thick gold rim) */}
          <path d="M -32,21 Q 0,26 32,21 L 34,13 Q 0,18 -34,13 Z" fill="url(#goldGradient)" stroke="#AA820A" strokeWidth="1" />
          
          {/* Crown cap inside (velvet/burgundy red) with a beautiful dome structure */}
          <path d="M -30,14 C -30,-5 -15,-18 0,-18 C 15,-18 30,-5 30,14 Z" fill="#8A1540" opacity="0.9" stroke="#AA820A" strokeWidth="0.5" />
          <path d="M -15,14 C -15,-2 -8,-10 0,-10 C 8,-10 15,-2 15,14 Z" fill="#AA1E52" opacity="0.4" />

          {/* Crown Spikes/Points (5 majestic flared peaks using elegant Bezier curves) */}
          <path 
            d="M -32,14 
               C -32,7 -30,-8 -28,-12 
               C -26,-8 -22,-2 -20,2 
               C -18,-5 -16,-18 -14,-22 
               C -12,-15 -8,-5 -7,0 
               C -5,-12 -2,-28 0,-32 
               C 2,-28 5,-12 7,0 
               C 8,-5 12,-15 14,-22 
               C 16,-18 18,-5 20,2 
               C 22,-2 26,-8 28,-12 
               C 30,-8 32,7 32,14 
               Z" 
            fill="url(#goldGradient)" 
            stroke="#AA820A" 
            strokeWidth="1.5" 
            strokeLinejoin="round" 
          />
          
          {/* Spheres/Beads on top of the 5 main peaks */}
          <circle cx="-28" cy="-12" r="3.2" fill="url(#goldGradient)" stroke="#8C6600" strokeWidth="0.8" />
          <circle cx="-14" cy="-22" r="3.2" fill="url(#goldGradient)" stroke="#8C6600" strokeWidth="0.8" />
          <circle cx="0" cy="-32" r="4.2" fill="url(#goldGradient)" stroke="#8C6600" strokeWidth="0.8" />
          <circle cx="14" cy="-22" r="3.2" fill="url(#goldGradient)" stroke="#8C6600" strokeWidth="0.8" />
          <circle cx="28" cy="-12" r="3.2" fill="url(#goldGradient)" stroke="#8C6600" strokeWidth="0.8" />

          {/* Inner Valleys tiny spheres for additional detail */}
          <circle cx="-20" cy="2" r="1.5" fill="url(#goldGradient)" stroke="#8C6600" strokeWidth="0.5" />
          <circle cx="-7" cy="0" r="1.5" fill="url(#goldGradient)" stroke="#8C6600" strokeWidth="0.5" />
          <circle cx="7" cy="0" r="1.5" fill="url(#goldGradient)" stroke="#8C6600" strokeWidth="0.5" />
          <circle cx="20" cy="2" r="1.5" fill="url(#goldGradient)" stroke="#8C6600" strokeWidth="0.5" />

          {/* Detailed crown base trim overlay (horizontal bands and jewels) */}
          <rect x="-26" y="15.5" width="52" height="2" fill="#8C6600" opacity="0.3" />
          
          {/* Alternating Royal Jewels on the base rim (Emerald, Ruby, Sapphire, Topaz) */}
          <circle cx="-22" cy="17" r="2" fill="#2ED573" stroke="#10AC84" strokeWidth="0.3" /> {/* Emerald */}
          <circle cx="-11" cy="18" r="2" fill="#FF4757" stroke="#EE5253" strokeWidth="0.3" /> {/* Ruby */}
          <circle cx="0" cy="18.5" r="2.2" fill="#2E86DE" stroke="#54A0FF" strokeWidth="0.4" /> {/* Royal Sapphire */}
          <circle cx="11" cy="18" r="2" fill="#FF9F43" stroke="#EE5253" strokeWidth="0.3" /> {/* Amber */}
          <circle cx="22" cy="17" r="2" fill="#10AC84" stroke="#01A3A4" strokeWidth="0.3" /> {/* Teal Emerald */}
        </g>


        {/* --- CHAMBER 3: BOTTOM CENTER (CHILDREN WORLD RING & BOOK ARCHIVES) --- */}
        <g transform="translate(225, 335)">
          {/* Books stack */}
          {/* Bottom Book: Blue/Cyan */}
          <g transform="translate(0, 10) rotate(-12)">
            {/* Cover shadow */}
            <rect x="-29" y="-9" width="58" height="18" fill="rgba(0,0,0,0.15)" rx="2" />
            {/* Cover back */}
            <rect x="-30" y="-10" width="60" height="20" fill="#1E3A8A" rx="2" />
            {/* Pages edge */}
            <rect x="-27" y="-8" width="55" height="16" fill="#FFFFFF" />
            <line x1="-25" y1="-5" x2="25" y2="-5" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="-25" y1="0" x2="25" y2="0" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="-25" y1="5" x2="25" y2="5" stroke="#E2E8F0" strokeWidth="1" />
            {/* Cover front */}
            <rect x="-30" y="-10" width="57" height="20" fill="#3B82F6" rx="2" />
            {/* Book spine line */}
            <line x1="-30" y1="-10" x2="-30" y2="10" stroke="#1D4ED8" strokeWidth="2.5" />
          </g>

          {/* Middle Book: Green */}
          <g transform="translate(2, -2) rotate(16)">
            {/* Cover shadow */}
            <rect x="-29" y="-9" width="58" height="18" fill="rgba(0,0,0,0.15)" rx="2" />
            {/* Cover back */}
            <rect x="-30" y="-10" width="60" height="20" fill="#04502E" rx="2" />
            {/* Pages edge */}
            <rect x="-27" y="-8" width="55" height="16" fill="#FFFFFF" />
            <line x1="-25" y1="-5" x2="25" y2="-5" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="-25" y1="0" x2="25" y2="0" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="-25" y1="5" x2="25" y2="5" stroke="#E2E8F0" strokeWidth="1" />
            {/* Cover front */}
            <rect x="-30" y="-10" width="57" height="20" fill="#10B981" rx="2" />
            {/* Book spine line */}
            <line x1="-30" y1="-10" x2="-30" y2="10" stroke="#047857" strokeWidth="2.5" />
          </g>

          {/* Top Book: Red */}
          <g transform="translate(-1, -14) rotate(-6)">
            {/* Cover shadow */}
            <rect x="-29" y="-9" width="58" height="18" fill="rgba(0,0,0,0.15)" rx="2" />
            {/* Cover back */}
            <rect x="-30" y="-10" width="60" height="20" fill="#7F1D1D" rx="2" />
            {/* Pages edge */}
            <rect x="-27" y="-8" width="55" height="16" fill="#FFFFFF" />
            <line x1="-25" y1="-5" x2="25" y2="-5" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="-25" y1="0" x2="25" y2="0" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="-25" y1="5" x2="25" y2="5" stroke="#E2E8F0" strokeWidth="1" />
            {/* Cover front */}
            <rect x="-30" y="-10" width="57" height="20" fill="#EF4444" rx="2" />
            {/* Book spine line */}
            <line x1="-30" y1="-10" x2="-30" y2="10" stroke="#B91C1C" strokeWidth="2.5" />
          </g>

          {/* Programmatically rendered Children Ring holding hands */}
          {Array.from({ length: 18 }).map((_, i) => {
            const angle = (i * 360) / 18;
            const colors = [
              "#EF4444", "#F59E0B", "#10B981", "#3B82F6", 
              "#8B5CF6", "#EC4899", "#14B8A6", "#6366F1",
              "#FF5A5F", "#05B85D", "#00A8E8", "#FFB400",
              "#8E2DE2", "#F000FF", "#00FFFF", "#7FFF00",
              "#FF007F", "#FF7F00"
            ];
            const color = colors[i % colors.length];
            return (
              <g key={i} transform={`rotate(${angle}) translate(0, -56)`}>
                {/* Head */}
                <circle cx="0" cy="-10" r="4.2" fill={color} />
                {/* Body */}
                <line x1="0" y1="-5" x2="0" y2="4" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                {/* Arms holding hands */}
                <path d="M -8,-2 Q 0,-4.5 8,-2" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
                {/* Legs */}
                <line x1="0" y1="4" x2="-4" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="4" x2="4" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round" />
              </g>
            );
          })}
        </g>

        {/* --- DOUBLE-TAILED RIBBON BANNER --- */}
        <g id="ribbon-banner">
          {/* Ribbon Shadow Connections to shield */}
          <path d="M 100 420 L 100 445 L 85 432 Z" fill="#6A0E30" />
          <path d="M 350 420 L 350 445 L 365 432 Z" fill="#6A0E30" />

          {/* Left Ribbon Tail */}
          <path 
            d="M 100 420 L 45 408 L 65 432 L 45 455 L 100 445 Z" 
            fill="white" 
            stroke="#8A1540" 
            strokeWidth="3.5" 
            strokeLinejoin="round" 
          />

          {/* Right Ribbon Tail */}
          <path 
            d="M 350 420 L 405 408 L 385 432 L 405 455 L 350 445 Z" 
            fill="white" 
            stroke="#8A1540" 
            strokeWidth="3.5" 
            strokeLinejoin="round" 
          />

          {/* Main Ribbon Center Plate */}
          <path 
            d="M 90 410 Q 225 432 360 410 L 360 452 Q 225 474 90 452 Z" 
            fill="white" 
            stroke="#8A1540" 
            strokeWidth="4" 
            strokeLinejoin="round" 
          />

          {/* TEXT - Centered perfectly along the ribbon curve */}
          <text 
            x="225" 
            y="442" 
            textAnchor="middle" 
            fill="#8A1540" 
            fontWeight="bold" 
            fontFamily="'Cinzel', 'Playfair Display', 'Georgia', serif" 
            fontSize="19" 
            letterSpacing="3"
            className="select-none font-extrabold"
          >
            PRESTIGE SCHOOL
          </text>
        </g>
      </svg>

      {/* Scent-branding contact metadata matching the picture, only visible when size="lg" */}
      {size === "lg" && (
        <div className="mt-8 text-center space-y-1.5 z-10 animate-fade-in bg-black/30 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-lg max-w-sm">
          <p className="text-white font-mono text-xs tracking-wider hover:text-brand-gold transition-colors duration-300">
            prestigeschoolbeira@gmail.com
          </p>
          <p className="text-white font-mono text-xs tracking-wider">
            (+258)-844443179 | 86-744-3179
          </p>
          <p className="text-brand-gold font-serif italic text-xs uppercase tracking-widest pt-1 border-t border-white/10 mt-1">
            Moçambique - Sofala - Beira - Macuti
          </p>
        </div>
      )}
    </div>
  );
};
