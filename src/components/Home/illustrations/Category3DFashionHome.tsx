import React from "react";

export const Category3DFashion: React.FC<{ className?: string }> = ({ className = "w-36 h-28" }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="bagPink" x1="40" y1="30" x2="110" y2="105" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE8E8" />
        <stop offset="0.4" stopColor="#FBCFE8" />
        <stop offset="1" stopColor="#DB2777" />
      </linearGradient>
      <linearGradient id="heelRose" x1="80" y1="50" x2="135" y2="95" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDA4AF" />
        <stop offset="1" stopColor="#BE123C" />
      </linearGradient>
      <filter id="shadowFashion" x="-10%" y="-10%" width="125%" height="135%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#831843" floodOpacity="0.22" />
      </filter>
    </defs>
    <ellipse cx="80" cy="104" rx="44" ry="8" fill="#831843" opacity="0.14" />
    <g filter="url(#shadowFashion)">
      {/* 3D Shopping Bag */}
      <path d="M42 42C42 28 54 20 66 20C78 20 88 28 88 42" stroke="#DB2777" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M42 42C42 28 54 20 66 20C78 20 88 28 88 42" stroke="#FFF1F2" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 44L40 98H92L98 44H32Z" fill="url(#bagPink)" />
      <path d="M32 44L40 98H48L42 44H32Z" fill="#BE185D" opacity="0.3" />
      <path d="M38 58H92" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Golden Olmart Logo Seal on Bag */}
      <circle cx="65" cy="72" r="7" fill="#FBBF24" />
      <circle cx="65" cy="72" r="5" fill="#B45309" />
    </g>
    {/* Chic High Heel shoe */}
    <g filter="url(#shadowFashion)">
      <path d="M85 78C95 72 108 68 118 74L132 86C134 88 132 92 128 92H102L96 74" fill="url(#heelRose)" />
      <path d="M96 74L98 94" stroke="#9F1239" strokeWidth="3" strokeLinecap="round" />
    </g>
    <circle cx="114" cy="40" r="2" fill="#F43F5E" />
    <circle cx="125" cy="50" r="1.5" fill="#FBBF24" />
  </svg>
);

export const Category3DHome: React.FC<{ className?: string }> = ({ className = "w-36 h-28" }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="chairGreen" x1="45" y1="35" x2="110" y2="95" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A7F3D0" />
        <stop offset="0.4" stopColor="#34D399" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="plantPot" x1="100" y1="65" x2="125" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FED7AA" />
        <stop offset="1" stopColor="#C2410C" />
      </linearGradient>
      <filter id="shadowHome" x="-10%" y="-10%" width="125%" height="135%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#064E3B" floodOpacity="0.22" />
      </filter>
    </defs>
    <ellipse cx="80" cy="104" rx="46" ry="8" fill="#064E3B" opacity="0.14" />
    {/* Potted Monstera Plant on Right */}
    <g filter="url(#shadowHome)">
      <path d="M102 74L105 98H122L125 74H102Z" fill="url(#plantPot)" />
      <path d="M113 74C113 54 125 46 130 52C132 58 126 68 114 74Z" fill="#10B981" />
      <path d="M110 74C102 52 90 48 94 42C100 40 108 55 112 74Z" fill="#059669" />
    </g>
    {/* 3D Modern Velvet Armchair */}
    <g filter="url(#shadowHome)">
      {/* Cushioned Backrest */}
      <path d="M48 38C48 26 58 18 74 18C90 18 100 26 100 38V66H48V38Z" fill="url(#chairGreen)" />
      {/* Fluted stitching */}
      <line x1="65" y1="22" x2="65" y2="62" stroke="#ECFDF5" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      <line x1="83" y1="22" x2="83" y2="62" stroke="#ECFDF5" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      {/* Armrests */}
      <rect x="38" y="50" width="16" height="28" rx="8" fill="#10B981" />
      <rect x="94" y="50" width="16" height="28" rx="8" fill="#047857" />
      {/* Thick Seat Cushion */}
      <rect x="46" y="60" width="56" height="20" rx="8" fill="#059669" />
      {/* Angled Golden / Wooden Legs */}
      <line x1="52" y1="80" x2="44" y2="98" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="96" y1="80" x2="104" y2="98" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  </svg>
);
