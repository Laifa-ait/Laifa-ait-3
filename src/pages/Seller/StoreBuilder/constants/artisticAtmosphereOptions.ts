import type {
  ArtisticAmbientLighting,
  ArtisticCardMaterial,
  ArtisticFrameShape,
  ArtisticOptionMeta,
  ArtisticSurfaceTexture,
} from "../../../../types/studio.types";

export interface ScenographicPreset {
  id: string;
  nameFr: string;
  nameAr: string;
  subtitleFr: string;
  subtitleAr: string;
  surfaceTexture: ArtisticSurfaceTexture;
  ambientLighting: ArtisticAmbientLighting;
  cardMaterial: ArtisticCardMaterial;
  frameShape: ArtisticFrameShape;
  suggestedCanvasColor?: string;
  suggestedSurfaceColor?: string;
  suggestedAccentColor?: string;
}

export const SURFACE_TEXTURE_OPTIONS: ArtisticOptionMeta<ArtisticSurfaceTexture>[] = [
  {
    id: "none",
    labelFr: "Lisse Galerie",
    labelAr: "أملس كالمعرض",
    sublabelFr: "Surface pure sans grain",
    sublabelAr: "سطح نقي بدون حبيبات",
    badgeFr: "Minimal",
  },
  {
    id: "film-grain",
    labelFr: "Grain Argentique 35mm",
    labelAr: "حبيبات سينمائية",
    sublabelFr: "Texture photographique subtile",
    sublabelAr: "ملمس سينمائي لطيف",
    badgeFr: "Cinéma",
  },
  {
    id: "cotton-paper",
    labelFr: "Papier Galerie Mat",
    labelAr: "ورق معرض فاخر",
    sublabelFr: "Grain léger pour mode & joaillerie",
    sublabelAr: "مثالي للأزياء والمجوهرات والعطور",
    badgeFr: "Éditorial",
  },
  {
    id: "silk-mesh",
    labelFr: "Soie Nacrée Organique",
    labelAr: "حرير لؤلؤي ناعم",
    sublabelFr: "Voile multi-points irisé très doux",
    sublabelAr: "تدرج حريري متعدد النقاط",
    badgeFr: "Couture",
  },
  {
    id: "architectural-grid",
    labelFr: "Grille d'Architecte 1px",
    labelAr: "شبكة معمارية دقيقة",
    sublabelFr: "Trame millimétrée contemporaine",
    sublabelAr: "شبكة هندسية معاصرة",
    badgeFr: "Studio",
  },
];

export const AMBIENT_LIGHTING_OPTIONS: ArtisticOptionMeta<ArtisticAmbientLighting>[] = [
  {
    id: "natural",
    labelFr: "Éclairage Naturel",
    labelAr: "إضاءة طبيعية متوازنة",
    sublabelFr: "Lumière de jour neutre et fidèle",
    sublabelAr: "إضاءة نهارية محايدة",
    badgeFr: "Standard",
  },
  {
    id: "golden-hour",
    labelFr: "Halos Studio Ambrés",
    labelAr: "وهج استوديو دافئ",
    sublabelFr: "Halo directionnel chaud en haut de scène",
    sublabelAr: "إضاءة علوية ناعمة",
    badgeFr: "Studio",
  },
  {
    id: "spotlight-atelier",
    labelFr: "Spotlight Galerie",
    labelAr: "إضاءة المعرض المركزة",
    sublabelFr: "Halo directionnel central & vignettage doux",
    sublabelAr: "تركيز ضوئي على القطع الرئيسية",
    badgeFr: "Musée",
  },
  {
    id: "neon-aura",
    labelFr: "Aura Chromatique 10%",
    labelAr: "هالة لونية متوهجة",
    sublabelFr: "Lueur diffuse teintée avec votre accent",
    sublabelAr: "توهج ناعم بلون الهوية البصرية",
    badgeFr: "Avant-Garde",
  },
];

export const CARD_MATERIAL_OPTIONS: ArtisticOptionMeta<ArtisticCardMaterial>[] = [
  {
    id: "solid-matte",
    labelFr: "Mat Éditorial",
    labelAr: "سطح غير لامع كلاسيكي",
    sublabelFr: "Surface pleine haute lisibilité",
    sublabelAr: "بطاقات واضحة وعصرية",
    badgeFr: "Éditorial",
  },
  {
    id: "frosted-crystal",
    labelFr: "Cristal Dépoli (Glass)",
    labelAr: "كريستال مصنفر شفاف",
    sublabelFr: "Réfraction backdrop-blur & bordure lumineuse",
    sublabelAr: "تأثير زجاجي فاخر مع انعكاس ضوئي",
    badgeFr: "Glass",
  },
  {
    id: "velvet-shadow",
    labelFr: "Profondeur Galerie",
    labelAr: "ظلال عميقة فاخرة",
    sublabelFr: "Ombres multicouches & liseré fin",
    sublabelAr: "ظلال عميقة مع حافة رفيعة",
    badgeFr: "Prestige",
  },
];

export const FRAME_SHAPE_OPTIONS: ArtisticOptionMeta<ArtisticFrameShape>[] = [
  {
    id: "soft-modern",
    labelFr: "Arrondi Modulable",
    labelAr: "زوايا ناعمة عصرية",
    sublabelFr: "Rayon doux paramétrable selon la boutique",
    sublabelAr: "انحناء متوازن وقابل للتعديل",
    badgeFr: "Moderne",
  },
  {
    id: "sharp-couture",
    labelFr: "Angle Droit & Double Filet",
    labelAr: "إطار معرض حاد مزدوج",
    sublabelFr: "Coupe 0px & encadrement fin de galerie d'art",
    sublabelAr: "زوايا حادة مع إطار مزدوج فاخر",
    badgeFr: "Galerie",
  },
  {
    id: "arch-minimal",
    labelFr: "Voûte Architecturale",
    labelAr: "قوس معماري عصري",
    sublabelFr: "Courbe haute épurée & base droite contemporaine",
    sublabelAr: "قوس معماري نقي للأزياء والعطور",
    badgeFr: "Architecture",
  },
  {
    id: "medallion-oval",
    labelFr: "Médaillon Elliptique",
    labelAr: "ميدالية بيضاوية فاخرة",
    sublabelFr: "Silhouette ovale 3:4 haute couture & joaillerie",
    sublabelAr: "إطار بيضاوي للقطع الفاخرة والمجوهرات",
    badgeFr: "Couture",
  },
  {
    id: "polaroid-atelier",
    labelFr: "Cadre Galerie Marge",
    labelAr: "إطار معرض بحاشية",
    sublabelFr: "Passe-partout blanc épuré & légende typographique",
    sublabelAr: "إطار أبيض نقي مع توقيع عصري",
    badgeFr: "Lookbook",
  },
  {
    id: "chamfered-tech",
    labelFr: "Biseauté Avant-Garde",
    labelAr: "زوايا مشطوفة هندسية",
    sublabelFr: "Coupe polygonale biseautée Néo-Tech",
    sublabelAr: "قطع هندسي عصري للتقنية",
    badgeFr: "Tech",
  },
];

export const SCENOGRAPHIC_ATMOSPHERE_PRESETS: ScenographicPreset[] = [
  {
    id: "minimal_galerie",
    nameFr: "Minimal Galerie Contemporaine",
    nameAr: "معرض عصري بسيط",
    subtitleFr: "Surface Lisse + Lumière Naturelle + Voûte Pure",
    subtitleAr: "سطح أملس + إضاءة طبيعية + قوس معماري",
    surfaceTexture: "none",
    ambientLighting: "natural",
    cardMaterial: "solid-matte",
    frameShape: "arch-minimal",
    suggestedCanvasColor: "#F8FAFC",
    suggestedSurfaceColor: "#FFFFFF",
    suggestedAccentColor: "#0F172A",
  },
  {
    id: "monochrome_editorial",
    nameFr: "Monochrome Haute Couture",
    nameAr: "أزياء أحادية اللون",
    subtitleFr: "Grain 35mm + Spotlight + Angle Droit Galerie",
    subtitleAr: "حبيبات سينمائية + إضاءة مركزة + إطار حاد",
    surfaceTexture: "film-grain",
    ambientLighting: "spotlight-atelier",
    cardMaterial: "velvet-shadow",
    frameShape: "sharp-couture",
    suggestedCanvasColor: "#F4F4F5",
    suggestedSurfaceColor: "#FFFFFF",
    suggestedAccentColor: "#18181B",
  },
  {
    id: "studio_cristal",
    nameFr: "Studio Soie & Cristal",
    nameAr: "استوديو حرير وكريستال",
    subtitleFr: "Soie Nacrée + Cristal Dépoli + Arrondi Doux",
    subtitleAr: "حرير لؤلؤي + زجاج مصنفر + زوايا ناعمة",
    surfaceTexture: "silk-mesh",
    ambientLighting: "natural",
    cardMaterial: "frosted-crystal",
    frameShape: "soft-modern",
    suggestedCanvasColor: "#FDF8F6",
    suggestedSurfaceColor: "#FFFFFF",
    suggestedAccentColor: "#9D174D",
  },
  {
    id: "framer_architect_cyber",
    nameFr: "Studio Architecte & Néo-Tech",
    nameAr: "استوديو هندسي عصري",
    subtitleFr: "Grille 1px + Aura 10% + Biseauté Tech + Cristal",
    subtitleAr: "شبكة هندسية + زوايا مشطوفة + زجاج شفاف",
    surfaceTexture: "architectural-grid",
    ambientLighting: "neon-aura",
    cardMaterial: "frosted-crystal",
    frameShape: "chamfered-tech",
    suggestedCanvasColor: "#EEF2F7",
    suggestedSurfaceColor: "#FFFFFF",
    suggestedAccentColor: "#1D4ED8",
  },
];
