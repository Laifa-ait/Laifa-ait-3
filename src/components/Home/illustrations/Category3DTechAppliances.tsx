import React from "react";

export const Category3DTech: React.FC<{ className?: string }> = ({ className = "w-36 h-28" }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="phoneScreen" x1="50" y1="20" x2="90" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.5" stopColor="#6366F1" />
        <stop offset="1" stopColor="#4338CA" />
      </linearGradient>
      <linearGradient id="headphoneGrad" x1="25" y1="20" x2="115" y2="85" gradientUnits="userSpaceOnUse">
        <stop stopColor="#94A3B8" />
        <stop offset="0.5" stopColor="#475569" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
      <filter id="shadowTech" x="-10%" y="-10%" width="125%" height="135%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <ellipse cx="80" cy="104" rx="44" ry="8" fill="#1E3A8A" opacity="0.14" />
    {/* Over-ear Wireless Headphones arching over */}
    <g filter="url(#shadowTech)">
      <path d="M42 62C42 34 58 20 80 20C102 20 118 34 118 62" stroke="url(#headphoneGrad)" strokeWidth="7" strokeLinecap="round" />
      <rect x="36" y="58" width="12" height="26" rx="6" fill="#0F172A" />
      <rect x="112" y="58" width="12" height="26" rx="6" fill="#0F172A" />
    </g>
    {/* 3D Smartphone in front */}
    <g filter="url(#shadowTech)">
      <rect x="58" y="32" width="44" height="68" rx="8" fill="#0F172A" />
      <rect x="60" y="34" width="40" height="64" rx="6" fill="url(#phoneScreen)" />
      {/* Dynamic island notch */}
      <rect x="73" y="37" width="14" height="3.5" rx="1.75" fill="#0F172A" />
      {/* Gloss reflection */}
      <path d="M60 46L98 34V60L60 72Z" fill="#FFFFFF" opacity="0.15" />
    </g>
  </svg>
);

export const Category3DAppliances: React.FC<{ className?: string }> = ({ className = "w-36 h-28" }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="applianceTeal" x1="40" y1="25" x2="115" y2="95" gradientUnits="userSpaceOnUse">
        <stop stopColor="#CCFBF1" />
        <stop offset="0.4" stopColor="#5EEAD4" />
        <stop offset="1" stopColor="#0F766E" />
      </linearGradient>
      <filter id="shadowApp" x="-10%" y="-10%" width="125%" height="135%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#134E4A" floodOpacity="0.22" />
      </filter>
    </defs>
    <ellipse cx="80" cy="104" rx="44" ry="8" fill="#134E4A" opacity="0.14" />
    <g filter="url(#shadowApp)">
      {/* 3D Espresso Machine Shell */}
      <rect x="48" y="30" width="60" height="68" rx="10" fill="url(#applianceTeal)" />
      {/* Metallic top heater tray */}
      <rect x="52" y="26" width="52" height="6" rx="3" fill="#E2E8F0" />
      {/* Pressure gauge */}
      <circle cx="78" cy="46" r="8" fill="#FFFFFF" stroke="#0F766E" strokeWidth="2" />
      <line x1="78" y1="46" x2="82" y2="42" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
      {/* Grouphead dispenser */}
      <rect x="72" y="58" width="12" height="8" rx="2" fill="#0F172A" />
      <path d="M66 62H90" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      {/* Chrome drip tray */}
      <rect x="52" y="86" width="52" height="10" rx="3" fill="#CBD5E1" />
      {/* Small coffee cup */}
      <rect x="73" y="74" width="10" height="12" rx="2" fill="#FFFFFF" />
      <path d="M83 77C85 77 86 78 86 80C86 82 85 83 83 83" stroke="#CBD5E1" strokeWidth="1.5" />
    </g>
  </svg>
);
