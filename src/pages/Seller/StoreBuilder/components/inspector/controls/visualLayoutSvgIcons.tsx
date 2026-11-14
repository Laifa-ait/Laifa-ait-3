import React from "react";

export const renderLayoutSvg = (id: string, isSelected: boolean): React.ReactNode => {
  const stroke = isSelected ? "#023859" : "#64748B";
  const fillPrimary = isSelected ? "#023859" : "#94A3B8";
  const fillSoft = isSelected ? "#D8EBF5" : "#E2E8F0";
  const fillAccent = isSelected ? "#26658C" : "#CBD5E1";

  if (id === "bento") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="2" width="27" height="32" rx="4" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <rect x="5" y="24" width="21" height="7" rx="2" fill={fillPrimary} />
        <rect x="32" y="2" width="22" height="14.5" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <rect x="32" y="19.5" width="22" height="14.5" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
      </svg>
    );
  }
  if (id === "accordion") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="2" width="28" height="32" rx="4" fill={fillPrimary} />
        <rect x="5" y="23" width="22" height="7" rx="2" fill="#FFFFFF" opacity="0.9" />
        <rect x="33" y="2" width="9" height="32" rx="3" fill={fillSoft} stroke={stroke} strokeWidth="1.3" />
        <rect x="45" y="2" width="9" height="32" rx="3" fill={fillSoft} stroke={stroke} strokeWidth="1.3" />
      </svg>
    );
  }
  if (id === "arch") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <path d="M4 32 V14 A10 10 0 0 1 24 14 V32 Z" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <path d="M32 32 V14 A10 10 0 0 1 52 14 V32 Z" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
        <rect x="8" y="26" width="12" height="2.5" rx="1" fill={fillPrimary} />
        <rect x="36" y="26" width="12" height="2.5" rx="1" fill={fillPrimary} />
      </svg>
    );
  }
  if (id === "polaroid") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="4" y="3" width="21" height="30" rx="2.5" fill="#FFFFFF" stroke={stroke} strokeWidth="1.5" />
        <rect x="7" y="6" width="15" height="18" rx="1.5" fill={fillSoft} />
        <rect x="8" y="27" width="11" height="2.5" rx="1" fill={fillPrimary} />
        <rect x="31" y="3" width="21" height="30" rx="2.5" fill="#FFFFFF" stroke={stroke} strokeWidth="1.5" />
        <rect x="34" y="6" width="15" height="18" rx="1.5" fill={fillSoft} />
        <rect x="35" y="27" width="11" height="2.5" rx="1" fill={fillPrimary} />
      </svg>
    );
  }
  if (id === "magazine") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="5" width="30" height="7" rx="2" fill={fillSoft} />
        <rect x="2" y="15" width="30" height="7" rx="2" fill={fillSoft} />
        <rect x="2" y="25" width="30" height="7" rx="2" fill={fillSoft} />
        <rect x="36" y="4" width="18" height="28" rx="3.5" fill={fillPrimary} />
      </svg>
    );
  }
  if (id === "bubbles") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        {[12, 28, 44].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy="13.5" r="7" fill={fillSoft} stroke={fillPrimary} strokeWidth="1.5" />
            <rect x={cx - 5} y="24.5" width="10" height="2.5" rx="1" fill={stroke} />
          </g>
        ))}
      </svg>
    );
  }
  if (id === "overlay" || id === "glass-dock") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="2" width="24" height="32" rx="4" fill={fillPrimary} />
        <rect x="5" y="22" width="18" height="8.5" rx="2.5" fill="#FFFFFF" opacity="0.92" />
        <rect x="30" y="2" width="24" height="32" rx="4" fill={fillAccent} />
        <rect x="33" y="22" width="18" height="8.5" rx="2.5" fill="#FFFFFF" opacity="0.92" />
      </svg>
    );
  }
  if (id === "pills" || id === "vertical" || id === "mesh-3d") {
    return (
      <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
        <rect x="2" y="4" width="52" height="12" rx="4" fill={fillSoft} stroke={stroke} strokeWidth="1.4" />
        <rect x="15" y="8.5" width="20" height="3" rx="1.2" fill={fillPrimary} />
        <rect x="2" y="20" width="52" height="12" rx="4" fill={fillSoft} stroke={stroke} strokeWidth="1.4" />
        <rect x="15" y="24.5" width="24" height="3" rx="1.2" fill={fillPrimary} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 56 36" className="w-12 h-8 shrink-0">
      <rect x="2" y="2" width="24" height="21" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
      <rect x="3" y="26" width="15" height="2.8" rx="1" fill={fillPrimary} />
      <rect x="30" y="2" width="24" height="21" rx="3.5" fill={fillSoft} stroke={stroke} strokeWidth="1.5" />
      <rect x="31" y="26" width="15" height="2.8" rx="1" fill={fillPrimary} />
    </svg>
  );
};
