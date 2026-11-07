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
    sublabelFr: "Filtre SVG feTurbulence subtil (15%)",
    sublabelAr: "ملمس سينمائي لطيف",
    badgeFr: "Cinéma",
  },
  {
    id: "cotton-paper",
    labelFr: "Papier d'Art Coton",
    labelAr: "ورق قطني فاخر",
    sublabelFr: "Trame chaude pour bijoutiers & parfumeurs",
    sublabelAr: "مثالي للمجوهرات والعطور والحرفيين",
    badgeFr: "Artisanat",
  },
  {
    id: "zellige-watermark",
    labelFr: "Filigrane Zellige Algérien",
    labelAr: "زليج جزائري مائي",
    sublabelFr: "Rosace géométrique mauresque teintée (5%)",
    sublabelAr: "نقش هندسي جزائري أصيل",
    badgeFr: "Patrimoine",
  },
  {
    id: "silk-mesh",
    labelFr: "Soie Nacrée Organique",
    labelAr: "حرير لؤلؤي ناعم",
    sublabelFr: "Voile multi-points irisé très doux",
    sublabelAr: "تدرج حريري متعدد النقاط",
    badgeFr: "Haute Couture",
  },
  {
    id: "architectural-grid",
    labelFr: "Grille d'Architecte 1px",
    labelAr: "شبكة معمارية دقيقة",
    sublabelFr: "Trame millimétrée avec croix de repère (+)",
    sublabelAr: "شبكة هندسية مع علامات تقاطع",
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
    labelFr: "Golden Hour Ambré",
    labelAr: "وهج الساعة الذهبية",
    sublabelFr: "Halo doré radial en haut & ombres chaudes",
    sublabelAr: "هالة ذهبية دافئة في أعلى الصفحة",
    badgeFr: "Solaire",
  },
  {
    id: "spotlight-atelier",
    labelFr: "Spotlight d'Atelier",
    labelAr: "إضاءة الأتيليه المركزة",
    sublabelFr: "Halo directionnel central & vignettage doux",
    sublabelAr: "تركيز ضوئي على القطع الرئيسية",
    badgeFr: "Musée",
  },
  {
    id: "neon-aura",
    labelFr: "Aura Chromatique 10%",
    labelAr: "هالة لونية متوهجة",
    sublabelFr: "Lueur diffuse teintée avec votre accent (blur-3xl)",
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
    sublabelFr: "Réfraction backdrop-blur-xl & bordure lumineuse",
    sublabelAr: "تأثير زجاجي فاخر مع انعكاس ضوئي",
    badgeFr: "Luxe Glass",
  },
  {
    id: "velvet-shadow",
    labelFr: "Velours & Filet Or",
    labelAr: "مخمل مع إطار ذهبي",
    sublabelFr: "Ombres profondes multicouches & liseré doré 15%",
    sublabelAr: "ظلال عميقة مع حافة ذهبية رفيعة",
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
    id: "casbah-arch",
    labelFr: "Arche de la Casbah",
    labelAr: "قوس القصبة الجزائري",
    sublabelFr: "Voûte architecturale (rounded-t-full) & base douce",
    sublabelAr: "قوس معماري أصيل للحرف والأزياء والعطور",
    badgeFr: "Casbah",
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
    labelFr: "Polaroid d'Atelier",
    labelAr: "بولارويد الأتيليه الفني",
    sublabelFr: "Cadre blanc épais incliné (-1°) & légende manuscrite",
    sublabelAr: "إطار أبيض غير متماثل مع توقيع فني",
    badgeFr: "Carnet",
  },
  {
    id: "chamfered-tech",
    labelFr: "Biseauté Avant-Garde",
    labelAr: "زوايا مشطوفة هندسية",
    sublabelFr: "Coupe polygonale biseautée style Néo-Tech / Cyber",
    sublabelAr: "قطع هندسي عصري للتقنية والستريت وير",
    badgeFr: "Cyber",
  },
];

export const SCENOGRAPHIC_ATMOSPHERE_PRESETS: ScenographicPreset[] = [
  {
    id: "casbah_haute_couture",
    nameFr: "Maison de Couture & Zellige",
    nameAr: "دار الأزياء والزليج الجزائري",
    subtitleFr: "Zellige + Golden Hour + Arche Casbah + Velours Or",
    subtitleAr: "زليج مائي + قوس القصبة + بطاقات مخملية",
    surfaceTexture: "zellige-watermark",
    ambientLighting: "golden-hour",
    cardMaterial: "velvet-shadow",
    frameShape: "casbah-arch",
    suggestedCanvasColor: "#FAF7F2",
    suggestedSurfaceColor: "#FFFFFF",
    suggestedAccentColor: "#C59B27",
  },
  {
    id: "sahara_parfumerie",
    nameFr: "Atelier Parfumerie & Joaillerie",
    nameAr: "أتيليه العطور والمجوهرات",
    subtitleFr: "Papier Coton + Spotlight + Médaillon + Filet Or",
    subtitleAr: "ورق قطني + ميدالية بيضاوية + حافة ذهبية",
    surfaceTexture: "cotton-paper",
    ambientLighting: "spotlight-atelier",
    cardMaterial: "velvet-shadow",
    frameShape: "medallion-oval",
    suggestedCanvasColor: "#FBF9F5",
    suggestedSurfaceColor: "#FFFFFF",
    suggestedAccentColor: "#B45309",
  },
  {
    id: "jacquemus_silk_crystal",
    nameFr: "Carnet d'Artiste Méditerranée",
    nameAr: "دفتر الفنان المتوسطي",
    subtitleFr: "Soie Nacrée + Golden Hour + Polaroid d'Atelier",
    subtitleAr: "حرير لؤلؤي + بولارويد فني + إضاءة دافئة",
    surfaceTexture: "silk-mesh",
    ambientLighting: "golden-hour",
    cardMaterial: "frosted-crystal",
    frameShape: "polaroid-atelier",
  },
  {
    id: "framer_architect_cyber",
    nameFr: "Studio Architecte & Néo-Tech",
    nameAr: "استوديو هندسي عصري",
    subtitleFr: "Grille 1px + Aura 10% + Biseauté Cyber + Cristal",
    subtitleAr: "شبكة هندسية + زوايا مشطوفة + زجاج شفاف",
    surfaceTexture: "architectural-grid",
    ambientLighting: "neon-aura",
    cardMaterial: "frosted-crystal",
    frameShape: "chamfered-tech",
  },
];
