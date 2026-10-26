import React from "react";

// High-fidelity 3D illustration matching reference screenshot:
// 3D Lilac Game Controller + Pastel Building Blocks + Floating Dice + Sparkles
export const Category3DToys: React.FC<{ className?: string }> = ({ className = "w-36 h-28" }) => (
  <svg
    viewBox="0 0 160 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* Controller Gradients */}
      <linearGradient id="ctrlBody" x1="20" y1="25" x2="105" y2="85" gradientUnits="userSpaceOnUse">
        <stop stopColor="#DDD6FE" />
        <stop offset="0.45" stopColor="#C4B5FD" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id="ctrlHighlight" x1="30" y1="28" x2="80" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" stopOpacity="0.8" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="ctrlGripLeft" x1="22" y1="50" x2="40" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA" />
        <stop offset="1" stopColor="#6D28D9" />
      </linearGradient>
      <linearGradient id="ctrlGripRight" x1="85" y1="50" x2="103" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA" />
        <stop offset="1" stopColor="#6D28D9" />
      </linearGradient>

      {/* Building Blocks Gradients */}
      <linearGradient id="blockBlueTop" x1="50" y1="10" x2="85" y2="25" gradientUnits="userSpaceOnUse">
        <stop stopColor="#BAE6FD" />
        <stop offset="1" stopColor="#7DD3FC" />
      </linearGradient>
      <linearGradient id="blockBlueSide" x1="50" y1="20" x2="85" y2="35" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="blockPinkTop" x1="90" y1="12" x2="135" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBCFE8" />
        <stop offset="1" stopColor="#F472B6" />
      </linearGradient>
      <linearGradient id="blockPinkSide" x1="90" y1="25" x2="135" y2="45" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EC4899" />
        <stop offset="1" stopColor="#BE185D" />
      </linearGradient>

      {/* Dice Gradients */}
      <linearGradient id="dieGreenTop" x1="0" y1="65" x2="25" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#86EFAC" />
        <stop offset="1" stopColor="#4ADE80" />
      </linearGradient>
      <linearGradient id="dieGreenSide" x1="0" y1="78" x2="25" y2="98" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22C55E" />
        <stop offset="1" stopColor="#15803D" />
      </linearGradient>
      <linearGradient id="dieCyanTop" x1="110" y1="65" x2="135" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A5F3FC" />
        <stop offset="1" stopColor="#67E8F9" />
      </linearGradient>
      <linearGradient id="dieCyanSide" x1="110" y1="78" x2="135" y2="98" gradientUnits="userSpaceOnUse">
        <stop stopColor="#06B6D4" />
        <stop offset="1" stopColor="#0E7490" />
      </linearGradient>

      {/* Ambient Soft Drop Shadow */}
      <filter id="shadowToys" x="-10%" y="-10%" width="125%" height="130%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#4C1D95" floodOpacity="0.25" />
      </filter>
    </defs>

    {/* Background Pink Brick */}
    <g filter="url(#shadowToys)">
      {/* 3D Pink Lego Brick */}
      <path d="M96 22L124 12L142 20L114 30Z" fill="url(#blockPinkTop)" />
      <path d="M96 22L114 30V44L96 36Z" fill="url(#blockPinkSide)" />
      <path d="M114 30L142 20V34L114 44Z" fill="#DB2777" />
      {/* Studs */}
      <ellipse cx="110" cy="19" rx="4" ry="2" fill="#F472B6" />
      <ellipse cx="128" cy="18" rx="4" ry="2" fill="#F472B6" />
    </g>

    {/* Background Sky Blue Brick */}
    <g filter="url(#shadowToys)">
      <path d="M52 18L76 8L92 16L68 26Z" fill="url(#blockBlueTop)" />
      <path d="M52 18L68 26V38L52 30Z" fill="url(#blockBlueSide)" />
      <path d="M68 26L92 16V28L68 38Z" fill="#0284C7" />
      {/* Studs */}
      <ellipse cx="64" cy="15" rx="3.5" ry="1.8" fill="#7DD3FC" />
      <ellipse cx="80" cy="14" rx="3.5" ry="1.8" fill="#7DD3FC" />
    </g>

    {/* Floating Green Die on Left */}
    <g filter="url(#shadowToys)">
      <path d="M8 72L22 64L34 70L20 78Z" fill="url(#dieGreenTop)" />
      <path d="M8 72L20 78V92L8 86Z" fill="url(#dieGreenSide)" />
      <path d="M20 78L34 70V84L20 92Z" fill="#16A34A" />
      {/* Die pips */}
      <circle cx="21" cy="71" r="1.5" fill="#FFFFFF" />
      <circle cx="14" cy="81" r="1.5" fill="#FFFFFF" />
      <circle cx="14" cy="87" r="1.5" fill="#FFFFFF" />
      <circle cx="27" cy="77" r="1.5" fill="#FFFFFF" />
    </g>

    {/* Floating Cyan Die on Right */}
    <g filter="url(#shadowToys)">
      <path d="M116 74L130 66L142 72L128 80Z" fill="url(#dieCyanTop)" />
      <path d="M116 74L128 80V94L116 88Z" fill="url(#dieCyanSide)" />
      <path d="M128 80L142 72V86L128 94Z" fill="#0891B2" />
      {/* Pips */}
      <circle cx="129" cy="73" r="1.5" fill="#FFFFFF" />
      <circle cx="122" cy="83" r="1.5" fill="#FFFFFF" />
      <circle cx="135" cy="79" r="1.5" fill="#FFFFFF" />
    </g>

    {/* Central 3D Console Controller */}
    <g filter="url(#shadowToys)">
      {/* Main ergonomic controller shell */}
      <path
        d="M32 40C36 34 50 32 63 32C76 32 90 34 94 40C98 46 106 68 103 86C101 94 92 96 85 88L74 76C68 74 58 74 52 76L41 88C34 96 25 94 23 86C20 68 28 46 32 40Z"
        fill="url(#ctrlBody)"
      />
      {/* Left Grip shading */}
      <path
        d="M23 86C20 68 28 46 32 40C33.5 37.5 39 35 46 34C37 42 32 60 38 82L41 88C34 96 25 94 23 86Z"
        fill="url(#ctrlGripLeft)"
        opacity="0.65"
      />
      {/* Right Grip shading */}
      <path
        d="M103 86C106 68 98 46 94 40C92.5 37.5 87 35 80 34C89 42 94 60 88 82L85 88C92 96 101 94 103 86Z"
        fill="url(#ctrlGripRight)"
        opacity="0.65"
      />
      {/* Top Gloss Highlight */}
      <ellipse cx="63" cy="38" rx="26" ry="4" fill="url(#ctrlHighlight)" />

      {/* D-Pad (Left) */}
      <rect x="38" y="50" width="14" height="5" rx="1.5" fill="#4C1D95" />
      <rect x="42.5" y="45.5" width="5" height="14" rx="1.5" fill="#4C1D95" />
      <circle cx="45" cy="52.5" r="1.5" fill="#6D28D9" />

      {/* Action Buttons (Right) - Colorful like Nintendo / PlayStation */}
      <circle cx="78" cy="52" r="2.6" fill="#F43F5E" /> {/* Pink/Red Button */}
      <circle cx="84" cy="46" r="2.6" fill="#3B82F6" /> {/* Blue Button */}
      <circle cx="84" cy="58" r="2.6" fill="#10B981" /> {/* Green Button */}
      <circle cx="90" cy="52" r="2.6" fill="#FBBF24" /> {/* Yellow Button */}

      {/* Dual Thumbsticks */}
      <circle cx="52" cy="64" r="5.5" fill="#312E81" />
      <circle cx="52" cy="63" r="4.2" fill="#4C1D95" />
      <circle cx="52" cy="62.5" r="2.5" fill="#6366F1" />

      <circle cx="74" cy="64" r="5.5" fill="#312E81" />
      <circle cx="74" cy="63" r="4.2" fill="#4C1D95" />
      <circle cx="74" cy="62.5" r="2.5" fill="#6366F1" />

      {/* Center Home / Select buttons */}
      <circle cx="63" cy="51" r="2.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="54" y="44" width="4" height="2" rx="1" fill="#4C1D95" />
      <rect x="68" y="44" width="4" height="2" rx="1" fill="#4C1D95" />
    </g>

    {/* Sparkles / Magic Stars */}
    <path
      d="M58 20L60 14L62 20L68 22L62 24L60 30L58 24L52 22L58 20Z"
      fill="#FBBF24"
      opacity="0.95"
    />
    <path
      d="M102 36L103 32L104 36L108 37L104 38L103 42L102 38L98 37L102 36Z"
      fill="#FCD34D"
      opacity="0.9"
    />
    <circle cx="34" cy="28" r="1.5" fill="#FFFFFF" />
    <circle cx="118" cy="52" r="1.5" fill="#FFFFFF" />
  </svg>
);
