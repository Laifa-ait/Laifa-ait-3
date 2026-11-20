import React from "react";

export const renderLayoutSvg = (id: string, isSelected: boolean): React.ReactNode => {
  const stroke = isSelected ? "var(--studio-primary)" : "#94A3B8";
  const fillPrimary = isSelected ? "var(--studio-primary)" : "#334155";
  const photoSky = isSelected ? "#DBEAFE" : "#E2E8F0";
  const photoHill = isSelected ? "#60A5FA" : "#CBD5E1";
  const photoSun = "#F59E0B";

  if (id === "bento") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0" data-testid={`layout-svg-${id}`}>
        <rect x="2" y="2" width="27" height="32" rx="4" fill={photoSky} stroke={stroke} strokeWidth="1.3" />
        <circle cx="22" cy="8" r="2.2" fill={photoSun} />
        <path d="M2 24 L13 15 L23 22 L29 18 L29 34 L2 34 Z" fill={photoHill} />
        <rect x="5" y="25" width="21" height="6" rx="2" fill={fillPrimary} />
        <rect x="32" y="2" width="22" height="14.5" rx="3.5" fill={photoSky} stroke={stroke} strokeWidth="1.3" />
        <circle cx="48" cy="6.5" r="1.8" fill={photoSun} />
        <rect x="32" y="19.5" width="22" height="14.5" rx="3.5" fill={photoSky} stroke={stroke} strokeWidth="1.3" />
      </svg>
    );
  }
  if (id === "accordion") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0" data-testid={`layout-svg-${id}`}>
        <rect x="2" y="2" width="28" height="32" rx="4" fill={photoSky} stroke={stroke} strokeWidth="1.3" />
        <circle cx="23" cy="9" r="2.3" fill={photoSun} />
        <path d="M2 26 L14 16 L24 23 L30 19 L30 34 L2 34 Z" fill={photoHill} />
        <rect x="5" y="24" width="22" height="6.5" rx="2" fill="#FFFFFF" opacity="0.95" />
        <rect x="33" y="2" width="9" height="32" rx="3" fill={photoSky} stroke={stroke} strokeWidth="1.2" />
        <rect x="45" y="2" width="9" height="32" rx="3" fill={photoSky} stroke={stroke} strokeWidth="1.2" />
      </svg>
    );
  }
  if (id === "arch") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0" data-testid={`layout-svg-${id}`}>
        <path d="M4 32 V14 A10 10 0 0 1 24 14 V32 Z" fill={photoSky} stroke={stroke} strokeWidth="1.4" />
        <circle cx="18" cy="12" r="2" fill={photoSun} />
        <path d="M32 32 V14 A10 10 0 0 1 52 14 V32 Z" fill={photoSky} stroke={stroke} strokeWidth="1.4" />
        <circle cx="46" cy="12" r="2" fill={photoSun} />
        <rect x="8" y="26" width="12" height="2.8" rx="1" fill={fillPrimary} />
        <rect x="36" y="26" width="12" height="2.8" rx="1" fill={fillPrimary} />
      </svg>
    );
  }
  if (id === "polaroid") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0" data-testid={`layout-svg-${id}`}>
        <rect x="4" y="3" width="21" height="30" rx="2.5" fill="#FFFFFF" stroke={stroke} strokeWidth="1.4" />
        <rect x="7" y="6" width="15" height="18" rx="1.5" fill={photoSky} />
        <circle cx="18" cy="10" r="1.8" fill={photoSun} />
        <rect x="8" y="27" width="11" height="2.5" rx="1" fill={fillPrimary} />
        <rect x="31" y="3" width="21" height="30" rx="2.5" fill="#FFFFFF" stroke={stroke} strokeWidth="1.4" />
        <rect x="34" y="6" width="15" height="18" rx="1.5" fill={photoSky} />
        <circle cx="45" cy="10" r="1.8" fill={photoSun} />
        <rect x="35" y="27" width="11" height="2.5" rx="1" fill={fillPrimary} />
      </svg>
    );
  }
  if (id === "magazine") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0" data-testid={`layout-svg-${id}`}>
        <rect x="2" y="5" width="30" height="7" rx="2" fill="#F1F5F9" stroke={stroke} strokeWidth="1" />
        <rect x="5" y="7.5" width="18" height="2" rx="1" fill={fillPrimary} />
        <rect x="2" y="15" width="30" height="7" rx="2" fill="#F1F5F9" stroke={stroke} strokeWidth="1" />
        <rect x="5" y="17.5" width="21" height="2" rx="1" fill={fillPrimary} />
        <rect x="2" y="25" width="30" height="7" rx="2" fill="#F1F5F9" stroke={stroke} strokeWidth="1" />
        <rect x="36" y="4" width="18" height="28" rx="3.5" fill={photoSky} stroke={stroke} strokeWidth="1.3" />
        <circle cx="49" cy="10" r="2.2" fill={photoSun} />
      </svg>
    );
  }
  if (id === "bubbles") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0" data-testid={`layout-svg-${id}`}>
        {[12, 28, 44].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy="13.5" r="7" fill={photoSky} stroke={fillPrimary} strokeWidth="1.4" />
            <circle cx={cx + 2} cy="11" r="1.5" fill={photoSun} />
            <rect x={cx - 5} y="24.5" width="10" height="2.5" rx="1" fill={fillPrimary} />
          </g>
        ))}
      </svg>
    );
  }
  if (id === "overlay" || id === "glass-dock") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0" data-testid={`layout-svg-${id}`}>
        <rect x="2" y="2" width="24" height="32" rx="4" fill="#1E293B" />
        <circle cx="20" cy="8" r="2" fill={photoSun} />
        <rect x="5" y="22" width="18" height="8" rx="2.5" fill="#FFFFFF" opacity="0.94" />
        <rect x="30" y="2" width="24" height="32" rx="4" fill="#334155" />
        <circle cx="48" cy="8" r="2" fill={photoSun} />
        <rect x="33" y="22" width="18" height="8" rx="2.5" fill="#FFFFFF" opacity="0.94" />
      </svg>
    );
  }
  if (id === "pills" || id === "vertical" || id === "mesh-3d") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0" data-testid={`layout-svg-${id}`}>
        <rect x="2" y="4" width="52" height="12" rx="4" fill="#FFFFFF" stroke={stroke} strokeWidth="1.3" />
        <rect x="4.5" y="6" width="10" height="8" rx="2" fill={photoSky} />
        <rect x="18" y="8.5" width="22" height="3" rx="1.2" fill={fillPrimary} />
        <rect x="2" y="20" width="52" height="12" rx="4" fill="#FFFFFF" stroke={stroke} strokeWidth="1.3" />
        <rect x="4.5" y="22" width="10" height="8" rx="2" fill={photoSky} />
        <rect x="18" y="24.5" width="25" height="3" rx="1.2" fill={fillPrimary} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0" data-testid={`layout-svg-${id}`}>
      <rect x="2" y="2" width="24" height="21" rx="3.5" fill={photoSky} stroke={stroke} strokeWidth="1.4" />
      <circle cx="20" cy="7.5" r="2" fill={photoSun} />
      <path d="M2 19 L11 12 L19 17 L26 14 L26 23 L2 23 Z" fill={photoHill} />
      <rect x="3" y="26" width="16" height="2.8" rx="1" fill={fillPrimary} />
      <rect x="30" y="2" width="24" height="21" rx="3.5" fill={photoSky} stroke={stroke} strokeWidth="1.4" />
      <circle cx="48" cy="7.5" r="2" fill={photoSun} />
      <path d="M30 19 L39 12 L47 17 L54 14 L54 23 L30 23 Z" fill={photoHill} />
      <rect x="31" y="26" width="16" height="2.8" rx="1" fill={fillPrimary} />
    </svg>
  );
};

