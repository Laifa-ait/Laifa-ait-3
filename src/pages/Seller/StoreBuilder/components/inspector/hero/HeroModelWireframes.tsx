import React from "react";
import { HeroLayoutModelId } from "../../../../../../domains/seller/customPage.types";

interface HeroModelWireframeProps {
  modelId: HeroLayoutModelId;
  active: boolean;
}

export const HeroModelWireframe: React.FC<HeroModelWireframeProps> = ({ modelId, active }) => {
  const frameStroke = active ? "#38BDF8" : "#CBD5E1";
  const surfaceBg = "#FFFFFF";
  const photoSky = "#DBEAFE";
  const photoHill = "#60A5FA";
  const photoSun = "#F59E0B";
  const textStrong = "#0F172A";
  const textMuted = "#64748B";
  const ctaFill = "#0F172A";

  return (
    <svg
      viewBox="0 0 88 48"
      data-testid={`hero-wireframe-${modelId}`}
      className="w-full h-11 rounded-md bg-white border shrink-0 overflow-hidden shadow-2xs"
      style={{ borderColor: frameStroke }}
      aria-hidden="true"
    >
      {modelId === "cinema-full" && (
        <>
          <rect x="2" y="2" width="84" height="44" rx="3.5" fill="#1E293B" />
          <circle cx="68" cy="13" r="4.5" fill={photoSun} opacity="0.9" />
          <path d="M2 36 L28 21 L50 32 L68 23 L86 34 L86 46 L2 46 Z" fill="#334155" />
          <rect x="2" y="2" width="84" height="44" rx="3.5" fill="#0F172A" opacity="0.3" />
          <rect x="8" y="16" width="40" height="4" rx="1.5" fill="#FFFFFF" />
          <rect x="8" y="22.5" width="28" height="2.5" rx="1" fill="#CBD5E1" />
          <rect x="8" y="29.5" width="20" height="6.5" rx="3.2" fill="#FFFFFF" />
          <rect x="12.5" y="32" width="11" height="1.8" rx="0.9" fill="#0F172A" />
        </>
      )}

      {modelId === "editorial-split" && (
        <>
          <rect x="2" y="2" width="84" height="44" rx="3.5" fill={surfaceBg} />
          <rect x="7" y="9" width="12" height="3" rx="1.5" fill="#E2E8F0" />
          <rect x="7" y="15" width="29" height="4" rx="1.5" fill={textStrong} />
          <rect x="7" y="21.5" width="23" height="2.5" rx="1" fill={textMuted} />
          <rect x="7" y="29" width="19" height="6.5" rx="3.2" fill={ctaFill} />
          <rect x="11.5" y="31.3" width="10" height="1.8" rx="0.9" fill="#FFFFFF" />
          <rect x="45" y="4" width="39" height="40" rx="2.5" fill={photoSky} />
          <circle cx="74" cy="13" r="3.8" fill={photoSun} />
          <path d="M45 37 L59 24 L71 33 L84 26 L84 44 L45 44 Z" fill={photoHill} />
        </>
      )}

      {modelId === "arch-palace" && (
        <>
          <rect x="2" y="2" width="84" height="44" rx="3.5" fill={surfaceBg} />
          <rect x="7" y="10" width="12" height="3" rx="1.5" fill="#E2E8F0" />
          <rect x="7" y="16" width="28" height="4" rx="1.5" fill={textStrong} />
          <rect x="7" y="22.5" width="22" height="2.5" rx="1" fill={textMuted} />
          <rect x="7" y="30" width="19" height="6.5" rx="3.2" fill={ctaFill} />
          <rect x="11.5" y="32.3" width="10" height="1.8" rx="0.9" fill="#FFFFFF" />
          <path d="M51 43 V19 A13 13 0 0 1 77 19 V43 Z" fill={photoSky} stroke="#93C5FD" strokeWidth="1" />
          <circle cx="69" cy="17" r="3" fill={photoSun} />
          <path d="M51 43 L61 30 L70 37 L77 32 L77 43 Z" fill={photoHill} />
        </>
      )}

      {modelId === "atelier-collage" && (
        <>
          <rect x="2" y="2" width="84" height="44" rx="3.5" fill="#F1F5F9" />
          <rect x="7" y="6" width="74" height="36" rx="2.5" fill={photoSky} stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="69" cy="14" r="3.5" fill={photoSun} />
          <path d="M7 36 L27 22 L47 33 L64 24 L81 35 L81 42 L7 42 Z" fill={photoHill} />
          <rect x="21" y="19" width="46" height="18" rx="3" fill="#FFFFFF" opacity="0.95" />
          <rect x="27" y="22.5" width="34" height="3.2" rx="1.5" fill={textStrong} />
          <rect x="34" y="28.5" width="20" height="5.5" rx="2.7" fill={ctaFill} />
        </>
      )}

      {modelId === "bento-hero" && (
        <>
          <rect x="2" y="2" width="84" height="44" rx="3.5" fill={surfaceBg} />
          <rect x="6" y="12" width="24" height="3.5" rx="1.5" fill={textStrong} />
          <rect x="6" y="18" width="19" height="2.5" rx="1" fill={textMuted} />
          <rect x="6" y="27" width="17" height="6" rx="3" fill={ctaFill} />
          <rect x="36" y="5" width="22" height="38" rx="2.5" fill={photoSky} />
          <circle cx="51" cy="13" r="2.8" fill={photoSun} />
          <path d="M36 37 L47 26 L58 35 L58 43 L36 43 Z" fill={photoHill} />
          <rect x="61" y="5" width="21" height="38" rx="2.5" fill="#E0E7FF" />
          <circle cx="75" cy="13" r="2.8" fill="#F59E0B" />
          <path d="M61 38 L71 27 L82 36 L82 43 L61 43 Z" fill="#818CF8" opacity="0.8" />
        </>
      )}
    </svg>
  );
};

