import React from "react";
import { BrandLogoProps } from "./olmaAutoEmblem";

// 1. HYUNDAI
export const HyundaiLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Hyundai"
  >
    <ellipse cx="50" cy="50" rx="45" ry="32" fill="none" stroke="currentColor" strokeWidth="6" transform="rotate(-12 50 50)" />
    <path d="M36 32 C36 32 38 68 40 70 M64 30 C64 30 60 66 58 68 M37 51 C45 47 55 53 62 50" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
  </svg>
);

// 2. TOYOTA
export const ToyotaLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Toyota"
  >
    <ellipse cx="50" cy="50" rx="45" ry="34" fill="none" stroke="currentColor" strokeWidth="5.5" />
    <ellipse cx="50" cy="38" rx="28" ry="15" fill="none" stroke="currentColor" strokeWidth="5.5" />
    <ellipse cx="50" cy="52" rx="14" ry="29" fill="none" stroke="currentColor" strokeWidth="5.5" />
  </svg>
);

// 3. KIA
export const KiaLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Kia"
  >
    <path
      d="M15 68 L15 32 M15 50 L35 32 M25 43 L36 68 M48 68 L48 32 M62 68 L72 32 L85 68 M66 56 L81 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 4. CHERY
export const CheryLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Chery"
  >
    <ellipse cx="50" cy="50" rx="44" ry="28" fill="none" stroke="currentColor" strokeWidth="5.5" />
    <path d="M26 42 L50 62 L74 42 M50 26 L50 62" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 5. GEELY
export const GeelyLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Geely"
  >
    <rect x="16" y="28" width="68" height="44" rx="8" fill="none" stroke="currentColor" strokeWidth="5" />
    <path d="M38 28 L38 72 M62 28 L62 72 M16 50 L84 50" stroke="currentColor" strokeWidth="3" />
  </svg>
);

// 6. SUZUKI
export const SuzukiLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Suzuki"
  >
    <path d="M74 24 L26 44 L54 52 L26 76 L74 56 L46 48 Z" fill="currentColor" />
  </svg>
);

// 7. NISSAN
export const NissanLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Nissan"
  >
    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="5" />
    <path d="M12 44 L88 44 M12 56 L88 56" stroke="currentColor" strokeWidth="4" />
    <text x="50" y="54" fontSize="12" fontWeight="bold" textAnchor="middle" fill="currentColor">
      NISSAN
    </text>
  </svg>
);
