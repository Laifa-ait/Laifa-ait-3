import { CategoryPreset } from "./categoryPresetTypes";

function makeCatSvg(label: string, bg1: string, bg2: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="600" height="450" fill="url(#g)"/><circle cx="460" cy="135" r="115" fill="${accent}" fill-opacity="0.24"/><rect x="335" y="175" width="185" height="195" rx="22" fill="#FFFFFF" fill-opacity="0.12" stroke="#FFFFFF" stroke-opacity="0.22"/><text x="42" y="385" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="26" font-weight="800" opacity="0.32">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const CATEGORY_PRESETS_PART2: CategoryPreset[] = [
  {
    id: "artisanat_zellige",
    name: "Arche Boutique Palace & Artisanat",
    description: "Dômes architecturaux méditerranéens mettant en valeur la noblesse des créations",
    icon: "Palette",
    tag: "Arche Palace",
    sector: "artisanat",
    settings: {
      title: "Savoir-Faire & Artisanat d'Algérie",
      subtitle: "Des pièces uniques façonnées à la main par nos maîtres artisans",
      layout: "arch", aspectRatio: "4/5", borderRadius: "md", hoverEffect: "lift",
      textPosition: "below", textTransform: "none", overlayOpacity: 0,
      glassmorphism: false, showBadge: true, showItemCount: true, showIcon: true, gapSize: "normal",
      categories: [
        { id: "cat_a1", name: "Poterie & Céramique de Kabylie", subtitle: "Terre cuite peinte à la main", slug: "poterie-kabyle", imageUrl: makeCatSvg("CÉRAMIQUE", "#7C2D12", "#9A3412", "#D4AF37"), iconName: "Palette", badge: "Fait Main", badgeColor: "#B45309", itemCount: 34 },
        { id: "cat_a2", name: "Tapis Berbères & Tissages", subtitle: "Laine pure de Ghardaïa & Babar", slug: "tapis-berberes", imageUrl: makeCatSvg("TISSAGES", "#431407", "#78350F", "#F59E0B"), iconName: "Layers", badge: "Traditionnel", badgeColor: "#9A3412", itemCount: 18 },
        { id: "cat_a3", name: "Cuivre Ciselé de Constantine", subtitle: "Plateaux, théières & luminaires", slug: "cuivre-constantine", imageUrl: makeCatSvg("CUIVRE", "#1C2A39", "#334155", "#B85B35"), iconName: "Sparkles", badge: "Noble", badgeColor: "#D97706", itemCount: 22 },
        { id: "cat_a4", name: "Bijoux en Argent d'Ath Yenni", subtitle: "Émaux colorés & corail rouge", slug: "bijoux-argent", imageUrl: makeCatSvg("ATH YENNI", "#0F172A", "#1E3A8A", "#38BDF8"), iconName: "Gem", badge: "Pur Argent", badgeColor: "#2563EB", itemCount: 45 },
      ],
    },
  },
  {
    id: "accordion_flagship",
    name: "Galerie Accordéon Interactive",
    description: "Panneaux panoramiques qui s'ouvrent fluidement au survol style Nike & Farfetch",
    icon: "Sparkles",
    tag: "Accordéon Pro",
    sector: "mode",
    settings: {
      title: "Univers & Collections Exclusives",
      subtitle: "Survolez un rayon pour déployer sa vitrine complète",
      layout: "accordion", aspectRatio: "4/5", borderRadius: "lg", hoverEffect: "zoom",
      textPosition: "overlay-bottom", textTransform: "none", overlayOpacity: 40,
      glassmorphism: true, showBadge: true, showItemCount: true, showIcon: false, gapSize: "normal",
      categories: [
        { id: "cat_ac1", name: "Prêt-à-Porter & Couture", subtitle: "Silhouettes contemporaines", slug: "pret-a-porter", imageUrl: makeCatSvg("COUTURE", "#011C40", "#023859", "#54ACBF"), badge: "Nouvelle Saison", badgeColor: "#023859", itemCount: 48 },
        { id: "cat_ac2", name: "Haute Parfumerie & Soins", subtitle: "Fragrances rares & élixirs", slug: "haute-parfumerie", imageUrl: makeCatSvg("PARFUMERIE", "#4A1525", "#881337", "#FDA4AF"), badge: "Exclusif", badgeColor: "#D97706", itemCount: 32 },
        { id: "cat_ac3", name: "Design & Maison Contemporaine", subtitle: "Mobilier & décoration", slug: "design-maison", imageUrl: makeCatSvg("MAISON", "#292524", "#57534E", "#D97706"), badge: "Tendance", badgeColor: "#059669", itemCount: 64 },
        { id: "cat_ac4", name: "Électroménager & High-Tech", subtitle: "Performance & innovation", slug: "high-tech", imageUrl: makeCatSvg("HIGH-TECH", "#090D16", "#0F172A", "#38BDF8"), badge: "Garantie Pro", badgeColor: "#2563EB", itemCount: 55 },
      ],
    },
  },
  {
    id: "magazine_ssense",
    name: "Index Magazine Luxe (SSENSE)",
    description: "Répertoire éditorial numéroté avec aperçu photo interactif grand format",
    icon: "Award",
    tag: "Index Magazine",
    sector: "accessoires",
    settings: {
      title: "Index des Collections",
      subtitle: "Navigation éditoriale inspirée des maisons de mode",
      layout: "magazine", aspectRatio: "4/5", borderRadius: "md", hoverEffect: "lift",
      textPosition: "below", textTransform: "none", overlayOpacity: 30,
      glassmorphism: true, showBadge: true, showItemCount: true, showIcon: false, gapSize: "normal",
      categories: [
        { id: "cat_m1", name: "Vestiaire Masculin & Tailoring", subtitle: "Coupes architecturales", slug: "vestiaire-masculin", imageUrl: makeCatSvg("TAILORING", "#0F172A", "#1E293B", "#94A3B8"), badge: "Édition 01", badgeColor: "#0F172A", itemCount: 40 },
        { id: "cat_m2", name: "Maroquinerie & Accessoires", subtitle: "Cuirs pleine fleur", slug: "maroquinerie", imageUrl: makeCatSvg("MAROQUINERIE", "#292524", "#44403C", "#D4AF37"), badge: "Atelier", badgeColor: "#B45309", itemCount: 26 },
        { id: "cat_m3", name: "Horlogerie & Bijoux Précieux", subtitle: "Pièces numérotées", slug: "horlogerie", imageUrl: makeCatSvg("HORLOGERIE", "#141413", "#292524", "#D4AF37"), badge: "Prestige", badgeColor: "#023859", itemCount: 19 },
      ],
    },
  },
  {
    id: "supermarket_terroir",
    name: "Épicerie, Terroir & Dock Capsules",
    description: "Grille de capsules panoramiques avec miniature photo et badge d'index",
    icon: "Apple",
    tag: "Dock Capsules",
    sector: "alimentation",
    settings: {
      title: "Marché & Terroir d'Algérie",
      subtitle: "Produits authentiques du terroir algérien et alimentation saine",
      layout: "pills", aspectRatio: "1/1", borderRadius: "lg", hoverEffect: "lift",
      textPosition: "below", textTransform: "none", overlayOpacity: 0,
      glassmorphism: false, showBadge: true, showItemCount: true, showIcon: true, gapSize: "normal",
      categories: [
        { id: "cat_s1", name: "Huile d'Olive Vierge Extra", subtitle: "Pressée à froid en Kabylie", slug: "huile-olive", imageUrl: makeCatSvg("HUILE D'OLIVE", "#14532D", "#166534", "#CA8A04"), iconName: "Apple", badge: "AOP Terroir", badgeColor: "#15803D", itemCount: 16 },
        { id: "cat_s2", name: "Dattes Deglet Nour de Biskra", subtitle: "Moelleuses & dorées de saison", slug: "dattes-biskra", imageUrl: makeCatSvg("DEGLET NOUR", "#78350F", "#92400E", "#F59E0B"), iconName: "Sparkles", badge: "Récolte 2026", badgeColor: "#B45309", itemCount: 22 },
        { id: "cat_s3", name: "Miels Purs & Plantes Médicinales", subtitle: "Miel d'oranger, thym & cèdre", slug: "miel-pur", imageUrl: makeCatSvg("MIELS PURS", "#9A3412", "#B45309", "#FBBF24"), iconName: "Award", badge: "100% Naturel", badgeColor: "#D97706", itemCount: 14 },
      ],
    },
  },
];
