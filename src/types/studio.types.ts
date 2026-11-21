export type ArtisticSurfaceTexture =
  | "none"
  | "film-grain"
  | "cotton-paper"
  | "silk-mesh"
  | "architectural-grid"
  /** @deprecated Legacy alias silently mapped to architectural-grid */
  | "zellige-watermark";

export type ArtisticAmbientLighting =
  | "natural"
  | "golden-hour"
  | "spotlight-atelier"
  | "neon-aura";

export type ArtisticCardMaterial =
  | "solid-matte"
  | "frosted-crystal"
  | "velvet-shadow";

export type ArtisticFrameShape =
  | "sharp-couture"
  | "architectural-sharp"
  | "soft-modern"
  | "arch-minimal"
  /** @deprecated Legacy alias mapped to arch-minimal */
  | "casbah-arch"
  | "medallion-oval"
  | "polaroid-atelier"
  | "chamfered-tech"
  | "pill"
  | "cut-corners"
  | "diamond";

export type EditorialHeadingAccentStyle =
  | "accent-color"
  | "metallic-gold"
  | "copper-bronze";

export type EditorialUnderlineStyle =
  | "hairline"
  | "brush-stroke"
  | "golden-wave";

export type KineticMarqueeSpeed = "slow" | "normal" | "fast";

export type KineticMarqueeTextStyle =
  | "solid"
  | "hollow-stroke"
  | "alternating";

export type KineticMarqueeSeparator =
  | "star"
  | "diamond"
  | "crescent"
  | "dot";

export interface KineticMarqueeSettings {
  textFr: string;
  textAr?: string;
  showBilingual?: boolean;
  speed?: KineticMarqueeSpeed;
  textStyle?: KineticMarqueeTextStyle;
  separator?: KineticMarqueeSeparator;
  direction?: "ltr" | "rtl";
  tiltDeg?: -2 | 0 | 2;
  uppercase?: boolean;
}

export interface ArtisticAtmosphereConfig {
  surfaceTexture?: ArtisticSurfaceTexture;
  ambientLighting?: ArtisticAmbientLighting;
  cardMaterial?: ArtisticCardMaterial;
  frameShape?: ArtisticFrameShape;
  letterSpacingEm?: number;
  lineHeight?: number;
  headingAccentStyle?: EditorialHeadingAccentStyle;
  headingUnderlineStyle?: EditorialUnderlineStyle;
}

export interface ArtisticOptionMeta<T extends string> {
  id: T;
  labelFr: string;
  labelAr: string;
  sublabelFr: string;
  sublabelAr: string;
  badgeFr: string;
}
