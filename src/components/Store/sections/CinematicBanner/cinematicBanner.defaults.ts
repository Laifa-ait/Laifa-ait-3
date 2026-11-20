import { HeroTextPosition9 } from "../../../../domains/seller/customPage.types";
import { StudioViewportDevice } from "../responsiveInheritanceHelper";
import {
  CinematicBannerConfig,
  CinematicButtonShape,
  CinematicCornerPreset,
  CinematicHeightPreset,
  CinematicOverlayDirection,
  CinematicOverlayPreset,
  CinematicOverlayZone,
} from "./cinematicBanner.types";

export const CINEMATIC_DESKTOP_HEIGHT_PRESETS: Array<{
  id: Exclude<CinematicHeightPreset, "custom">;
  label: string;
  px: number;
  desc: string;
}> = [
  { id: "fine", label: "Petite", px: 320, desc: "Bandeau fin" },
  { id: "balanced", label: "Moyenne", px: 420, desc: "Hauteur idéale" },
  { id: "large", label: "Grande", px: 520, desc: "Grande mise en avant" },
  { id: "immersive", label: "Très grande", px: 640, desc: "Plein écran" },
];

export const CINEMATIC_TABLET_HEIGHT_PRESETS: Array<{
  id: Exclude<CinematicHeightPreset, "custom">;
  label: string;
  px: number;
  desc: string;
}> = [
  { id: "fine", label: "Petite", px: 280, desc: "Compacte" },
  { id: "balanced", label: "Moyenne", px: 360, desc: "Équilibrée" },
  { id: "large", label: "Grande", px: 440, desc: "Grande" },
  { id: "immersive", label: "Très grande", px: 520, desc: "Plein cadre" },
];

export const CINEMATIC_MOBILE_HEIGHT_PRESETS: Array<{
  id: Exclude<CinematicHeightPreset, "custom">;
  label: string;
  px: number;
  desc: string;
}> = [
  { id: "fine", label: "Petite", px: 260, desc: "Rapide à lire" },
  { id: "balanced", label: "Moyenne", px: 320, desc: "Confortable" },
  { id: "large", label: "Grande", px: 380, desc: "Haute" },
  { id: "immersive", label: "Très grande", px: 440, desc: "Plein cadre" },
];

export const CINEMATIC_DEVICE_HEIGHT_PRESETS: Record<
  StudioViewportDevice,
  Record<Exclude<CinematicHeightPreset, "custom">, number>
> = {
  desktop: { fine: 320, balanced: 420, large: 520, immersive: 640 },
  tablet: { fine: 280, balanced: 360, large: 440, immersive: 520 },
  mobile: { fine: 260, balanced: 320, large: 380, immersive: 440 },
};

export const CINEMATIC_CORNER_PRESETS: Array<{
  id: Exclude<CinematicCornerPreset, "custom">;
  label: string;
  px: 0 | 12 | 24 | 40;
  desc: string;
}> = [
  { id: 0, label: "Carrés", px: 0, desc: "0 px" },
  { id: 12, label: "Légers", px: 12, desc: "12 px" },
  { id: 24, label: "Arrondis", px: 24, desc: "24 px" },
  { id: 40, label: "Très arrondis", px: 40, desc: "40 px" },
];

export const CINEMATIC_POSITION_9_GRID: Array<{
  id: HeroTextPosition9;
  label: string;
  shortLabel: string;
  align: "left" | "center" | "right";
}> = [
  { id: "top-left", label: "Haut gauche", shortLabel: "Haut G", align: "left" },
  { id: "top-center", label: "Haut centre", shortLabel: "Haut C", align: "center" },
  { id: "top-right", label: "Haut droite", shortLabel: "Haut D", align: "right" },
  { id: "center-left", label: "Milieu gauche", shortLabel: "Milieu G", align: "left" },
  { id: "center", label: "Centre", shortLabel: "Centre", align: "center" },
  { id: "center-right", label: "Milieu droite", shortLabel: "Milieu D", align: "right" },
  { id: "bottom-left", label: "Bas gauche", shortLabel: "Bas G", align: "left" },
  { id: "bottom-center", label: "Bas centre", shortLabel: "Bas C", align: "center" },
  { id: "bottom-right", label: "Bas droite", shortLabel: "Bas D", align: "right" },
];

export const CINEMATIC_POSITION_9_OPTIONS = CINEMATIC_POSITION_9_GRID;

export const FOCAL_PRESETS: Array<{ id: string; label: string; x: number; y: number }> = [
  { id: "center", label: "Centre", x: 50, y: 50 },
  { id: "top", label: "Haut", x: 50, y: 20 },
  { id: "bottom", label: "Bas", x: 50, y: 80 },
  { id: "left", label: "Gauche", x: 25, y: 50 },
  { id: "right", label: "Droite", x: 75, y: 50 },
];

export const CINEMATIC_OVERLAY_PRESETS: Array<{
  id: CinematicOverlayPreset;
  label: string;
  desc: string;
  description: string;
  intensity: number;
  defaultIntensity: number;
}> = [
  { id: "none", label: "Aucun", desc: "Photo d'origine", description: "Photo d'origine", intensity: 0, defaultIntensity: 0 },
  { id: "soft", label: "Léger", desc: "Voile doux (28%)", description: "Voile doux (28%)", intensity: 28, defaultIntensity: 28 },
  { id: "medium", label: "Moyen", desc: "Bon contraste (45%)", description: "Bon contraste (45%)", intensity: 45, defaultIntensity: 45 },
  { id: "strong", label: "Fort", desc: "Très lisible (62%)", description: "Très lisible (62%)", intensity: 62, defaultIntensity: 62 },
];

export const CINEMATIC_OVERLAY_DIRECTIONS: Array<{
  id: CinematicOverlayDirection;
  label: string;
}> = [
  { id: "radial", label: "Autour du texte" },
  { id: "bottom-up", label: "Du bas vers le haut" },
  { id: "left-right", label: "De gauche à droite" },
  { id: "right-left", label: "De droite à gauche" },
  { id: "top-down", label: "Du haut vers le bas" },
];

export const CINEMATIC_OVERLAY_ZONES: Array<{
  id: CinematicOverlayZone;
  label: string;
  desc: string;
  hint: string;
}> = [
  {
    id: "text-only",
    label: "Juste derrière le texte",
    desc: "Garde le reste de la photo claire",
    hint: "Garde le reste de la photo claire",
  },
  {
    id: "directional-edge",
    label: "Sur le côté du texte",
    desc: "Assombrit uniquement le bord du texte",
    hint: "Assombrit uniquement le bord du texte",
  },
  {
    id: "banner-soft",
    label: "Sur toute la bannière",
    desc: "Voile léger sur toute la largeur",
    hint: "Voile léger sur toute la largeur",
  },
];

export const CINEMATIC_BUTTON_SHAPES: Array<{
  id: CinematicButtonShape;
  label: string;
  desc: string;
  radiusPx: number;
  borderWidthPx: number;
  paddingX: number;
  paddingY: number;
}> = [
  { id: "rectangle", label: "Carré", desc: "Coins droits", radiusPx: 2, borderWidthPx: 0, paddingX: 28, paddingY: 13 },
  { id: "rounded", label: "Normal", desc: "Coins doux", radiusPx: 10, borderWidthPx: 0, paddingX: 26, paddingY: 12 },
  { id: "pill", label: "Arrondi", desc: "Bords ronds", radiusPx: 999, borderWidthPx: 0, paddingX: 30, paddingY: 13 },
  { id: "outline", label: "Contour", desc: "Fond transparent avec bordure", radiusPx: 8, borderWidthPx: 2, paddingX: 26, paddingY: 12 },
  { id: "minimal", label: "Souligné", desc: "Texte souligné d'un trait", radiusPx: 0, borderWidthPx: 2, paddingX: 4, paddingY: 6 },
];

export const DEFAULT_CINEMATIC_BANNER_CONFIG: CinematicBannerConfig = {
  styleId: "cinema-full",
  image: {
    src: "",
    alt: "Image principale de la bannière",
    fit: "cover",
    zoom: 1,
    focalX: 50,
    focalY: 50,
    panOffsetX: 0,
    panOffsetY: 0,
  },
  title: "Nouvelle collection",
  subtitle: "Découvrez notre sélection de pièces choisies avec soin.",
  button: {
    text: "Découvrir",
    shape: "pill",
    size: "md",
    paddingX: 28,
    paddingY: 13,
    borderRadiusPx: 999,
    borderWidthPx: 0,
    fontFamily: "sans",
    fontWeight: 700,
    letterSpacingEm: 0.02,
    showArrow: true,
    targetType: "catalog",
    targetCategory: "",
    targetProductId: "",
    href: "#catalog",
  },
  layout: {
    desktopHeightPreset: "balanced",
    heightPx: 420,
    widthMode: "full",
    cornerRadiusPreset: 0,
    borderRadiusPx: 0,
    marginHorizontalPx: 0,
    marginVerticalPx: 0,
    innerPaddingPx: 36,
    textPosition9: "bottom-left",
    textAlign: "left",
    textBlockMarginX: 0,
    textBlockMarginY: 0,
    showCompositionGuides: false,
  },
  typography: {
    titleFontFamily: "sans",
    titleSizePx: 42,
    titleSizeToken: "lg",
    titleWeight: 700,
    titleLineHeight: 1.08,
    titleLetterSpacingEm: -0.02,
    titleMaxWidthPx: 540,
    subtitleSizePx: 15,
    subtitleWeight: 500,
    subtitleLineHeight: 1.55,
    subtitleMaxWidthPx: 460,
    textVerticalGapPx: 16,
  },
  colors: {
    titleColor: "#FFFFFF",
    subtitleColor: "#F4F4F5",
    buttonBgColor: "#FFFFFF",
    buttonTextColor: "#111827",
    buttonBorderColor: "#FFFFFF",
    backdropColor: "#0F172A",
  },
  overlay: {
    preset: "soft",
    intensity: 28,
    direction: "radial",
    zone: "text-only",
  },
  responsive: {
    desktop: {},
    tablet: {},
    mobile: {},
  },
};
