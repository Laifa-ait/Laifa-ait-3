import React from "react";

export interface BrandLogoProps {
  className?: string;
  size?: number;
}

/**
 * 🌟 LOGO OFFICIEL OLMA AUTO V2 (Emblème Aérodynamique & Élite Automobile)
 * Blason de vitesse, double chevron propulseur, accents Navy & Lime 400
 */
export const OlmaAutoEmblem: React.FC<BrandLogoProps> = ({
  className = "w-9 h-9",
  size,
}) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Emblème Officiel Olma Auto"
  >
    <defs>
      <linearGradient id="olmaShieldGrad" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
        <stop stopColor="#172B4D" />
        <stop offset="0.5" stopColor="#0B1730" />
        <stop offset="1" stopColor="#101E3D" />
      </linearGradient>
      <linearGradient id="olmaLimeGrad" x1="30" y1="20" x2="90" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E2FB7D" />
        <stop offset="0.6" stopColor="#D9F66F" />
        <stop offset="1" stopColor="#C5E94F" />
      </linearGradient>
      <linearGradient id="olmaBorderGlow" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#D9F66F" stopOpacity="0.8" />
        <stop offset="0.5" stopColor="#23416A" stopOpacity="0.4" />
        <stop offset="1" stopColor="#D9F66F" stopOpacity="0.2" />
      </linearGradient>
    </defs>

    {/* Blason Aérodynamique Fond */}
    <rect
      x="6"
      y="6"
      width="108"
      height="108"
      rx="28"
      fill="url(#olmaShieldGrad)"
      stroke="url(#olmaBorderGlow)"
      strokeWidth="2.5"
    />

    {/* Calandre Aérodynamique */}
    <path
      d="M26 36 L60 22 L94 36 L94 72 C94 92 60 106 60 106 C60 106 26 92 26 72 Z"
      fill="#0B1730"
      fillOpacity="0.6"
      stroke="#23416A"
      strokeWidth="1.5"
    />

    {/* Double Chevron Turbo Lime */}
    <path
      d="M38 52 L60 38 L82 52"
      stroke="url(#olmaLimeGrad)"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M42 70 L60 56 L78 70"
      stroke="url(#olmaLimeGrad)"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Point d'Impact Vitesse Central */}
    <circle cx="60" cy="84" r="3.5" fill="#D9F66F" />
  </svg>
);
