import React from "react";

interface SectionShapeDividerProps {
  type?: "none" | "wave" | "slant" | "curve";
  color?: string;
  position?: "top" | "bottom";
}

export const SectionShapeDivider: React.FC<SectionShapeDividerProps> = ({
  type = "none",
  color = "#FFFFFF",
  position = "bottom",
}) => {
  if (!type || type === "none") return null;

  const isTop = position === "top";
  const transformClass = isTop ? "rotate-180 -top-1" : "-bottom-1";

  if (type === "wave") {
    return (
      <div className={`absolute left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none ${transformClass}`}>
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-8 sm:h-12"
          fill={color}
        >
          <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,20 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    );
  }

  if (type === "slant") {
    return (
      <div className={`absolute left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none ${transformClass}`}>
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-6 sm:h-10"
          fill={color}
        >
          <path d="M1200 0L0 120 1200 120z" />
        </svg>
      </div>
    );
  }

  if (type === "curve") {
    return (
      <div className={`absolute left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none ${transformClass}`}>
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-8 sm:h-12"
          fill={color}
        >
          <path d="M0,0 C300,90 900,90 1200,0 L1200,120 L0,120 Z" />
        </svg>
      </div>
    );
  }

  return null;
};
