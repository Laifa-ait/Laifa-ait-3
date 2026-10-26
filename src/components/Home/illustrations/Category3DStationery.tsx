import React from "react";

// High-fidelity 3D illustration matching reference screenshot:
// 3D Celestial Blue Spiral Notebook + Pencils + Ruler + Paperclips
export const Category3DStationery: React.FC<{ className?: string }> = ({
  className = "w-36 h-28",
}) => (
  <svg
    viewBox="0 0 160 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* Notebook Gradients */}
      <linearGradient id="bookCover" x1="30" y1="20" x2="105" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E0F2FE" />
        <stop offset="0.3" stopColor="#BAE6FD" />
        <stop offset="0.8" stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="bookPage" x1="45" y1="25" x2="100" y2="95" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#F8FAFC" />
      </linearGradient>

      {/* Pencil Gradients */}
      <linearGradient id="pencilPink" x1="85" y1="15" x2="135" y2="75" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F472B6" />
        <stop offset="0.6" stopColor="#EC4899" />
        <stop offset="1" stopColor="#9D174D" />
      </linearGradient>
      <linearGradient id="pencilBlue" x1="75" y1="30" x2="120" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.6" stopColor="#0284C7" />
        <stop offset="1" stopColor="#075985" />
      </linearGradient>

      {/* Wooden Ruler Gradient */}
      <linearGradient id="rulerGrad" x1="80" y1="10" x2="135" y2="85" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF3C7" />
        <stop offset="0.5" stopColor="#FDE68A" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>

      {/* Drop Shadow */}
      <filter id="shadowStationery" x="-10%" y="-10%" width="125%" height="135%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#0369A1" floodOpacity="0.25" />
      </filter>
    </defs>

    {/* Ambient Floor Shadow */}
    <ellipse cx="78" cy="102" rx="44" ry="9" fill="#0C4A6E" opacity="0.16" />

    {/* Wooden Drafting Ruler in background */}
    <g filter="url(#shadowStationery)">
      <path
        d="M86 16L134 76L122 86L74 26L86 16Z"
        fill="url(#rulerGrad)"
      />
      {/* Ruler inch marks */}
      <line x1="83" y1="23" x2="88" y2="27" stroke="#92400E" strokeWidth="1.2" />
      <line x1="91" y1="33" x2="96" y2="37" stroke="#92400E" strokeWidth="1.2" />
      <line x1="99" y1="43" x2="104" y2="47" stroke="#92400E" strokeWidth="1.2" />
      <line x1="107" y1="53" x2="112" y2="57" stroke="#92400E" strokeWidth="1.2" />
      <line x1="115" y1="63" x2="120" y2="67" stroke="#92400E" strokeWidth="1.2" />
      <line x1="123" y1="73" x2="128" y2="77" stroke="#92400E" strokeWidth="1.2" />
    </g>

    {/* 3D Spiral Notebook */}
    <g filter="url(#shadowStationery)">
      {/* Back Cover Depth */}
      <rect x="25" y="24" width="62" height="78" rx="6" fill="#0369A1" />
      {/* Pages Layer */}
      <rect x="28" y="22" width="60" height="78" rx="5" fill="url(#bookPage)" />
      {/* Front Cover */}
      <rect x="30" y="20" width="60" height="78" rx="5" fill="url(#bookCover)" />

      {/* Embossed Notebook Pattern Lines */}
      <line x1="42" y1="36" x2="80" y2="36" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
      <line x1="42" y1="44" x2="72" y2="44" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      <line x1="42" y1="52" x2="76" y2="52" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      <line x1="42" y1="60" x2="68" y2="60" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />

      {/* Spiral Wire Coils (Left edge) */}
      {[26, 34, 42, 50, 58, 66, 74, 82, 90].map((y) => (
        <g key={y}>
          <ellipse cx="29" cy={y} rx="3.5" ry="2.2" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.2" />
          <path d={`M26 ${y} C24 ${y - 2} 24 ${y + 2} 26 ${y + 1}`} stroke="#075985" strokeWidth="1.5" />
        </g>
      ))}
    </g>

    {/* Pencils floating diagonally across */}
    {/* Pink Colored Pencil */}
    <g filter="url(#shadowStationery)">
      <path d="M102 18L130 68L122 72L94 22L102 18Z" fill="url(#pencilPink)" />
      {/* Pencil wood tip & lead */}
      <path d="M94 22L88 12L102 18L94 22Z" fill="#FDE68A" />
      <path d="M90 15L88 12L93 14Z" fill="#9D174D" />
      {/* Pencil Eraser metal band */}
      <rect x="122" y="68" width="10" height="5" rx="1" transform="rotate(-30 122 68)" fill="#E2E8F0" />
      <rect x="125" y="73" width="7" height="4" rx="1.5" transform="rotate(-30 125 73)" fill="#F43F5E" />
    </g>

    {/* Cyan Pencil */}
    <g filter="url(#shadowStationery)">
      <path d="M90 32L116 80L110 83L84 35L90 32Z" fill="url(#pencilBlue)" />
      <path d="M84 35L79 26L90 32L84 35Z" fill="#FDE68A" />
      <path d="M81 29L79 26L83 28Z" fill="#0C4A6E" />
    </g>

    {/* Silver Curved Paperclips */}
    <g filter="url(#shadowStationery)">
      <path
        d="M128 78C132 82 134 88 130 92C126 96 120 95 116 90L108 78C105 74 107 70 110 68C114 66 117 68 120 72L127 82"
        stroke="#94A3B8"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M128 78C132 82 134 88 130 92C126 96 120 95 116 90L108 78C105 74 107 70 110 68C114 66 117 68 120 72L127 82"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
      />
    </g>
  </svg>
);
