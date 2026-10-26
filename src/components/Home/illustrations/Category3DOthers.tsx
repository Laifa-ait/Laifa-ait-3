import React from "react";

export const Category3DBeauty: React.FC<{ className?: string }> = ({ className = "w-36 h-28" }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="perfumeGrad" x1="45" y1="35" x2="105" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDF2F8" />
        <stop offset="0.4" stopColor="#F472B6" />
        <stop offset="1" stopColor="#BE185D" />
      </linearGradient>
      <filter id="shadowBeauty" x="-10%" y="-10%" width="125%" height="135%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#831843" floodOpacity="0.22" />
      </filter>
    </defs>
    <ellipse cx="80" cy="104" rx="42" ry="8" fill="#831843" opacity="0.14" />
    <g filter="url(#shadowBeauty)">
      {/* 3D Luxury Perfume Flacon */}
      <rect x="52" y="44" width="52" height="54" rx="14" fill="url(#perfumeGrad)" />
      <rect x="66" y="32" width="24" height="12" rx="4" fill="#FBBF24" />
      <rect x="72" y="22" width="12" height="10" rx="3" fill="#D97706" />
      {/* Glass bevel line */}
      <rect x="60" y="52" width="36" height="38" rx="8" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.6" />
    </g>
    {/* Sparkles */}
    <path d="M112 36L114 30L116 36L122 38L116 40L114 46L112 40L106 38L112 36Z" fill="#FBBF24" />
  </svg>
);

export const Category3DAuto: React.FC<{ className?: string }> = ({ className = "w-36 h-28" }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="wheelRim" x1="40" y1="25" x2="115" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#64748B" />
        <stop offset="0.5" stopColor="#334155" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
      <filter id="shadowAuto" x="-10%" y="-10%" width="125%" height="135%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.25" />
      </filter>
    </defs>
    <ellipse cx="80" cy="104" rx="44" ry="8" fill="#0F172A" opacity="0.16" />
    <g filter="url(#shadowAuto)">
      {/* 3D Sports Steering Wheel */}
      <circle cx="78" cy="60" r="38" stroke="url(#wheelRim)" strokeWidth="12" />
      <rect x="75" y="22" width="6" height="12" fill="#EF4444" rx="1.5" /> {/* Red 12 o'clock stripe */}
      {/* Hub & 3 Spokes */}
      <circle cx="78" cy="60" r="14" fill="#1E293B" stroke="#94A3B8" strokeWidth="2" />
      <line x1="78" y1="46" x2="78" y2="28" stroke="#64748B" strokeWidth="8" strokeLinecap="round" />
      <line x1="66" y1="68" x2="48" y2="82" stroke="#64748B" strokeWidth="8" strokeLinecap="round" />
      <line x1="90" y1="68" x2="108" y2="82" stroke="#64748B" strokeWidth="8" strokeLinecap="round" />
    </g>
  </svg>
);

export const Category3DTools: React.FC<{ className?: string }> = ({ className = "w-36 h-28" }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="drillYellow" x1="45" y1="30" x2="115" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047" />
        <stop offset="0.5" stopColor="#EAB308" />
        <stop offset="1" stopColor="#CA8A04" />
      </linearGradient>
      <filter id="shadowTools" x="-10%" y="-10%" width="125%" height="135%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#713F12" floodOpacity="0.22" />
      </filter>
    </defs>
    <ellipse cx="80" cy="104" rx="44" ry="8" fill="#713F12" opacity="0.14" />
    <g filter="url(#shadowTools)">
      {/* 3D Cordless Drill */}
      <rect x="52" y="38" width="56" height="26" rx="8" fill="url(#drillYellow)" />
      {/* Drill Chuck & Bit */}
      <rect x="108" y="44" width="14" height="14" rx="3" fill="#1E293B" />
      <line x1="122" y1="51" x2="136" y2="51" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
      {/* Ergonomic Handle */}
      <path d="M64 64L58 96H76L82 64" fill="#0F172A" />
      {/* Battery Pack */}
      <rect x="50" y="94" width="34" height="12" rx="4" fill="#CA8A04" />
    </g>
  </svg>
);

export const Category3DSports: React.FC<{ className?: string }> = ({ className = "w-36 h-28" }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="ballOrange" x1="75" y1="40" x2="135" y2="95" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDBA74" />
        <stop offset="0.5" stopColor="#F97316" />
        <stop offset="1" stopColor="#C2410C" />
      </linearGradient>
      <filter id="shadowSports" x="-10%" y="-10%" width="125%" height="135%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#14532D" floodOpacity="0.22" />
      </filter>
    </defs>
    <ellipse cx="80" cy="104" rx="44" ry="8" fill="#14532D" opacity="0.14" />
    {/* Basketball in background */}
    <g filter="url(#shadowSports)">
      <circle cx="106" cy="62" r="26" fill="url(#ballOrange)" />
      <path d="M80 62H132" stroke="#431407" strokeWidth="2" />
      <path d="M106 36V88" stroke="#431407" strokeWidth="2" />
    </g>
    {/* 3D Neon Dumbbell in foreground */}
    <g filter="url(#shadowSports)">
      <rect x="36" y="44" width="12" height="34" rx="5" fill="#22C55E" />
      <rect x="76" y="44" width="12" height="34" rx="5" fill="#15803D" />
      <line x1="48" y1="61" x2="76" y2="61" stroke="#94A3B8" strokeWidth="7" strokeLinecap="round" />
    </g>
  </svg>
);

export const Category3DBaby: React.FC<{ className?: string }> = ({ className = "w-36 h-28" }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="teddyBrown" x1="45" y1="35" x2="105" y2="95" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FED7AA" />
        <stop offset="0.5" stopColor="#FB923C" />
        <stop offset="1" stopColor="#C2410C" />
      </linearGradient>
      <filter id="shadowBaby" x="-10%" y="-10%" width="125%" height="135%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#0369A1" floodOpacity="0.2" />
      </filter>
    </defs>
    <ellipse cx="80" cy="104" rx="42" ry="8" fill="#0369A1" opacity="0.12" />
    <g filter="url(#shadowBaby)">
      {/* 3D Teddy Head & Body */}
      <circle cx="76" cy="56" r="22" fill="url(#teddyBrown)" />
      {/* Ears */}
      <circle cx="58" cy="38" r="8" fill="#FB923C" />
      <circle cx="58" cy="38" r="4" fill="#FED7AA" />
      <circle cx="94" cy="38" r="8" fill="#EA580C" />
      <circle cx="94" cy="38" r="4" fill="#FED7AA" />
      {/* Snout & Eyes */}
      <ellipse cx="76" cy="62" rx="9" ry="7" fill="#FFF7ED" />
      <circle cx="76" cy="59" r="3.2" fill="#431407" />
      <circle cx="68" cy="52" r="2.5" fill="#431407" />
      <circle cx="84" cy="52" r="2.5" fill="#431407" />
    </g>
  </svg>
);

export const Category3DCraft: React.FC<{ className?: string }> = ({ className = "w-36 h-28" }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="potteryTerra" x1="45" y1="30" x2="110" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDBA74" />
        <stop offset="0.4" stopColor="#EA580C" />
        <stop offset="1" stopColor="#9A3412" />
      </linearGradient>
      <filter id="shadowCraft" x="-10%" y="-10%" width="125%" height="135%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#7C2D12" floodOpacity="0.24" />
      </filter>
    </defs>
    <ellipse cx="80" cy="104" rx="42" ry="8" fill="#7C2D12" opacity="0.14" />
    <g filter="url(#shadowCraft)">
      {/* Traditional Clay Amphora / Vase */}
      <ellipse cx="76" cy="32" rx="14" ry="4" fill="#FED7AA" stroke="#9A3412" strokeWidth="2" />
      <path d="M66 34L64 48C50 60 50 82 62 96H90C102 82 102 60 88 48L86 34H66Z" fill="url(#potteryTerra)" />
      {/* Traditional Berber geometric patterns */}
      <path d="M56 68L64 62L72 68L80 62L88 68L96 62" stroke="#FFF7ED" strokeWidth="2" strokeLinecap="round" />
      <path d="M58 76H94" stroke="#FFF7ED" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      {/* Vase handles */}
      <path d="M62 48C52 52 52 64 60 70" stroke="#C2410C" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M90 48C100 52 100 64 92 70" stroke="#7C2D12" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  </svg>
);
