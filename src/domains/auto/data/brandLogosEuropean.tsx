import React from "react";
import { BrandLogoProps } from "./olmaAutoEmblem";

// 1. RENAULT
export const RenaultLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Renault"
  >
    <path d="M50 5 L82 50 L50 95 L18 50 Z M50 20 L31 50 L50 80 L69 50 Z" fill="currentColor" />
    <path d="M50 28 L37 50 L50 72 L63 50 Z" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
  </svg>
);

// 2. PEUGEOT
export const PeugeotLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Peugeot"
  >
    <path d="M20 12 L80 12 L88 48 C88 74 50 92 50 92 C50 92 12 74 12 48 Z" fill="none" stroke="currentColor" strokeWidth="6" />
    <path d="M50 24 C55 24 64 28 66 34 C67 38 65 42 62 44 C67 45 72 49 71 55 C70 60 65 64 60 65 C64 69 66 75 62 78 C58 80 52 76 50 72 C48 76 42 80 38 78 C34 75 36 69 40 65 C35 64 30 60 29 55 C28 49 33 45 38 44 C35 42 33 38 34 34 C36 28 45 24 50 24 Z" fill="currentColor" />
  </svg>
);

// 3. VOLKSWAGEN
export const VolkswagenLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Volkswagen"
  >
    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" />
    <path
      d="M32 26 L43 56 L50 38 L57 56 L68 26 M23 50 L38 82 L50 60 L62 82 L77 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 4. DACIA
export const DaciaLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Dacia"
  >
    <path d="M18 32 L40 32 L50 48 L40 68 L18 68 L28 50 Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
    <path d="M82 32 L60 32 L50 48 L60 68 L82 68 L72 50 Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
  </svg>
);

// 5. SEAT
export const SeatLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Seat"
  >
    <path d="M26 36 L68 36 L40 50 L74 50 L32 64 L74 64" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="bevel" />
  </svg>
);

// 6. AUDI
export const AudiLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 120 60"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size / 2 } : undefined}
    aria-label="Logo Audi"
  >
    <circle cx="24" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="4.5" />
    <circle cx="48" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="4.5" />
    <circle cx="72" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="4.5" />
    <circle cx="96" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="4.5" />
  </svg>
);

// 7. BMW
export const BmwLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo BMW"
  >
    <circle cx="50" cy="50" r="46" fill="#0B1730" stroke="#CBD5E1" strokeWidth="3" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M50 20 A30 30 0 0 1 80 50 L50 50 Z" fill="#0284C7" />
    <path d="M50 50 L80 50 A30 30 0 0 1 50 80 Z" fill="#FFFFFF" />
    <path d="M20 50 A30 30 0 0 1 50 20 L50 50 Z" fill="#FFFFFF" />
    <path d="M50 50 L50 80 A30 30 0 0 1 20 50 Z" fill="#0284C7" />
  </svg>
);

// 8. MERCEDES-BENZ
export const MercedesLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Mercedes-Benz"
  >
    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="5" />
    <path d="M50 10 L50 50 L20 74 M50 50 L80 74" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
  </svg>
);

// 9. FIAT
export const FiatLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Fiat"
  >
    <rect x="8" y="24" width="84" height="52" rx="14" fill="none" stroke="currentColor" strokeWidth="5" />
    <text x="50" y="58" fontSize="24" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="currentColor" letterSpacing="2">
      FIAT
    </text>
  </svg>
);

// 10. SKODA
export const SkodaLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Skoda"
  >
    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="5" />
    <path d="M32 58 L54 30 L68 50 L46 54 Z M54 30 L76 38 L68 50 Z" fill="currentColor" />
  </svg>
);

// 11. CITROEN
export const CitroenLogo: React.FC<BrandLogoProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Logo Citroën"
  >
    <path d="M24 40 L50 20 L76 40 M24 64 L50 44 L76 64" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
