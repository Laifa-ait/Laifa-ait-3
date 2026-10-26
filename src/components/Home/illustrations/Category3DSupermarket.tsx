import React from "react";

// High-fidelity 3D illustration matching reference screenshot:
// 3D Wicker Grocery Basket + Baguette Bread + Red Tomatoes + Fresh Greens + Carrot
export const Category3DSupermarket: React.FC<{ className?: string }> = ({
  className = "w-36 h-28",
}) => (
  <svg
    viewBox="0 0 160 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* Basket Wicker Gradients */}
      <linearGradient id="wickerBase" x1="40" y1="50" x2="110" y2="105" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="0.5" stopColor="#D97706" />
        <stop offset="1" stopColor="#92400E" />
      </linearGradient>
      <linearGradient id="wickerRim" x1="30" y1="45" x2="120" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="0.5" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="basketHandle" x1="45" y1="18" x2="105" y2="55" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="0.6" stopColor="#D97706" />
        <stop offset="1" stopColor="#78350F" />
      </linearGradient>

      {/* Baguette Gradients */}
      <linearGradient id="baguetteGrad" x1="35" y1="20" x2="65" y2="65" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="0.4" stopColor="#D97706" />
        <stop offset="1" stopColor="#92400E" />
      </linearGradient>

      {/* Tomato Gradients */}
      <radialGradient id="tomato1" cx="68" cy="46" r="16" fx="64" fy="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDA4AF" />
        <stop offset="0.25" stopColor="#F43F5E" />
        <stop offset="0.8" stopColor="#E11D48" />
        <stop offset="1" stopColor="#9F1239" />
      </radialGradient>
      <radialGradient id="tomato2" cx="88" cy="48" r="14" fx="85" fy="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FECDD3" />
        <stop offset="0.3" stopColor="#FB7185" />
        <stop offset="0.85" stopColor="#E11D48" />
        <stop offset="1" stopColor="#881337" />
      </radialGradient>

      {/* Carrot Gradient */}
      <linearGradient id="carrotGrad" x1="90" y1="28" x2="112" y2="55" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDBA74" />
        <stop offset="0.5" stopColor="#EA580C" />
        <stop offset="1" stopColor="#9A3412" />
      </linearGradient>

      {/* Lettuce / Greens Gradient */}
      <linearGradient id="leafGrad" x1="60" y1="30" x2="95" y2="50" gradientUnits="userSpaceOnUse">
        <stop stopColor="#86EFAC" />
        <stop offset="0.6" stopColor="#22C55E" />
        <stop offset="1" stopColor="#15803D" />
      </linearGradient>

      {/* Drop Shadow */}
      <filter id="shadowBasket" x="-10%" y="-10%" width="125%" height="135%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#78350F" floodOpacity="0.28" />
      </filter>
    </defs>

    {/* Ground Ambient Glow & Shadow */}
    <ellipse cx="76" cy="104" rx="42" ry="10" fill="#78350F" opacity="0.18" />

    {/* Arch Handle behind food */}
    <path
      d="M48 55C48 30 60 16 76 16C92 16 104 30 104 55"
      stroke="url(#basketHandle)"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <path
      d="M48 55C48 30 60 16 76 16C92 16 104 30 104 55"
      stroke="#FDE68A"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.85"
    />

    {/* Fresh Baguette sticking out on left */}
    <g filter="url(#shadowBasket)">
      <path
        d="M34 26C37 20 44 24 47 30L60 62C56 64 50 63 46 59L34 26Z"
        fill="url(#baguetteGrad)"
      />
      {/* Baguette baker cuts */}
      <path d="M38 28C40 30 42 32 44 33" stroke="#FFFBEB" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M42 38C44 40 46 42 48 43" stroke="#FFFBEB" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M47 48C49 50 51 52 53 53" stroke="#FFFBEB" strokeWidth="1.8" strokeLinecap="round" />
    </g>

    {/* Fresh Carrot sticking out on right */}
    <g filter="url(#shadowBasket)">
      <path d="M96 24L110 54C108 56 102 56 98 52L88 28C90 25 94 23 96 24Z" fill="url(#carrotGrad)" />
      {/* Carrot green fronds */}
      <path d="M96 24L99 12M94 24L92 14M98 25L104 16" stroke="#22C55E" strokeWidth="2.4" strokeLinecap="round" />
    </g>

    {/* Crisp Green Lettuce / Celery Leaves */}
    <g filter="url(#shadowBasket)">
      <path
        d="M58 46C56 36 64 30 72 32C80 34 84 40 82 48C76 44 66 42 58 46Z"
        fill="url(#leafGrad)"
      />
      <path
        d="M74 44C78 35 88 32 94 36C100 40 98 48 92 52C88 47 80 45 74 44Z"
        fill="#16A34A"
      />
    </g>

    {/* Ripe Red Tomatoes */}
    <g filter="url(#shadowBasket)">
      <circle cx="68" cy="50" r="13" fill="url(#tomato1)" />
      {/* Tomato Green Calyx Star */}
      <path
        d="M68 40L70 43L73 41L71 44L74 46L70 46L68 49L66 46L62 46L65 44L63 41L66 43L68 40Z"
        fill="#22C55E"
      />

      <circle cx="86" cy="52" r="11" fill="url(#tomato2)" />
      <path
        d="M86 44L87 46L89 45L88 47L90 48L87 48L86 50L85 48L82 48L84 47L83 45L85 46L86 44Z"
        fill="#22C55E"
      />
    </g>

    {/* 3D Woven Grocery Basket Body */}
    <g filter="url(#shadowBasket)">
      {/* Basket Oval Top Rim */}
      <ellipse cx="76" cy="56" rx="40" ry="12" fill="url(#wickerRim)" />
      <ellipse cx="76" cy="56" rx="36" ry="9" fill="#78350F" opacity="0.4" />

      {/* Basket Tapered Base Shell */}
      <path
        d="M36 56L44 94C45 99 50 102 56 102H96C102 102 107 99 108 94L116 56C116 64 100 70 76 70C52 70 36 64 36 56Z"
        fill="url(#wickerBase)"
      />

      {/* 3D Woven Weave Texture Ribs */}
      <path d="M42 66C52 74 100 74 110 66" stroke="#FDE68A" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
      <path d="M44 76C54 84 98 84 108 76" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
      <path d="M47 86C56 93 96 93 105 86" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      <path d="M51 95C60 100 92 100 101 95" stroke="#78350F" strokeWidth="2" strokeLinecap="round" opacity="0.85" />

      {/* Vertical wicker struts */}
      <path d="M52 58L57 101" stroke="#FDE68A" strokeWidth="1.8" opacity="0.6" />
      <path d="M68 60L70 102" stroke="#FDE68A" strokeWidth="1.8" opacity="0.6" />
      <path d="M84 60L82 102" stroke="#FDE68A" strokeWidth="1.8" opacity="0.6" />
      <path d="M100 58L95 101" stroke="#FDE68A" strokeWidth="1.8" opacity="0.6" />
    </g>
  </svg>
);
