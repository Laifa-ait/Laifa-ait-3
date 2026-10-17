import React, { useState } from "react";
import { getCategoryIcon8Info } from "../../constants/categoryIcons8";
import { Box } from "lucide-react";

export interface CategoryIcons8LogoProps {
  categoryName: string;
  categoryId?: string;
  isActive?: boolean;
  className?: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
}

export const CategoryIcons8Logo: React.FC<CategoryIcons8LogoProps> = ({
  categoryName,
  categoryId,
  isActive = false,
  className = "w-5 h-5 object-contain",
  fallbackIcon: Fallback = Box,
}) => {
  const [useCdnFallback, setUseCdnFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  const info = getCategoryIcon8Info(categoryName) || (categoryId ? getCategoryIcon8Info(categoryId) : undefined);

  if (!info || hasError) {
    return <Fallback className={`${className} ${isActive ? "text-white" : "text-slate-800"}`} />;
  }

  const primarySrc = isActive ? info.localWhitePath : info.localPath;
  const cdnFallbackSrc = isActive ? info.cdnWhiteUrl : info.cdnUrl;
  const currentSrc = useCdnFallback ? cdnFallbackSrc : primarySrc;

  return (
    <img
      src={currentSrc}
      alt={info.label}
      loading="eager"
      decoding="async"
      className={className}
      onError={() => {
        if (!useCdnFallback) {
          setUseCdnFallback(true);
        } else {
          setHasError(true);
        }
      }}
    />
  );
};
