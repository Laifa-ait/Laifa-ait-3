import React from "react";
import { HeroArchitecturalStyleProps } from "./HeroMinimalTextAndGuides";
import { CinematicBannerRenderer } from "../CinematicBanner/CinematicBannerRenderer";

/**
 * STYLE 1 : "PLEIN CADRE CINÉMA — FULL-BLEED IMMERSIVE" (HeroFullBleed)
 * Délègue le rendu au moteur spécialisé CinematicBannerRenderer.
 */
export const HeroFullBleed: React.FC<HeroArchitecturalStyleProps> = (props) => {
  return <CinematicBannerRenderer {...props} />;
};
