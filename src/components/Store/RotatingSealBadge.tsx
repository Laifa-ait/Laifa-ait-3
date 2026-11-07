import React, { useId } from "react";
import { Sparkles } from "lucide-react";

interface RotatingSealBadgeProps {
  text?: string;
  accentColor?: string;
  surfaceColor?: string;
  textColor?: string;
  className?: string;
}

/**
 * Sceau Rotatif d'Atelier (RotatingSealBadge)
 * Badge circulaire SVG tournant lentement à 360° ("FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE •")
 */
export const RotatingSealBadge: React.FC<RotatingSealBadgeProps> = ({
  text = "FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE •",
  accentColor = "#B45309",
  surfaceColor = "#FFFFFF",
  textColor = "#18181B",
  className = "",
}) => {
  const uid = useId().replace(/:/g, "");
  const pathId = `seal-circle-${uid}`;
  const cleanText = text.endsWith(" ") ? text : `${text} `;

  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: surfaceColor,
        borderColor: `${accentColor}35`,
      }}
      className={`pointer-events-none select-none w-24 h-24 @sm:w-28 @sm:h-28 rounded-full border shadow-[0_14px_34px_rgba(15,23,42,0.14)] flex items-center justify-center p-1.5 backdrop-blur-md ${className}`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-[spin_20s_linear_infinite]"
        >
          <defs>
            <path
              id={pathId}
              d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            />
          </defs>
          <text
            fill={textColor}
            fontSize="8.3"
            fontWeight="700"
            letterSpacing="2.1"
          >
            <textPath href={`#${pathId}`} startOffset="0%">
              {cleanText}
            </textPath>
          </text>
        </svg>

        <div
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
            borderColor: `${accentColor}35`,
          }}
          className="absolute w-9 h-9 rounded-full border flex items-center justify-center"
        >
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
