import { PRODUCT_HIERARCHY } from "../constants";

const normalizeKey = (val: string): string =>
  val
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

/**
 * Maps all historical, seeded, or synonym category names to their single
 * canonical Olmart Marketplace category key so duplicates never appear.
 */
const LEGACY_CATEGORY_ALIASES: Record<string, string> = {
  // Maison & Déco
  maisondeco: "Maison & Déco",
  maisondecoration: "Maison & Déco",
  maisonetdeco: "Maison & Déco",
  maisonetdecoration: "Maison & Déco",
  maison: "Maison & Déco",
  ameublementdeco: "Maison & Déco",
  luminaires: "Maison & Déco",
  tapis: "Maison & Déco",

  // Électronique
  electronique: "Électronique",
  techperformance: "Électronique",
  techetperformance: "Électronique",
  highTech: "Électronique",
  hightech: "Électronique",
  informatique: "Électronique",
  telephonie: "Électronique",
  tech: "Électronique",

  // Électroménager
  electromenager: "Électroménager",
  homeappliances: "Électroménager",
  electroniqueelectromenager: "Électroménager",
  electroniqueetelectromenager: "Électroménager",

  // Mode
  mode: "Mode",
  modeelegance: "Mode",
  modeetelegance: "Mode",
  modevetements: "Mode",
  modeetvetements: "Mode",
  modestyle: "Mode",
  vetements: "Mode",
  fashion: "Mode",

  // Artisanat & Tradition
  artisanattradition: "Artisanat & Tradition",
  artisanatettradition: "Artisanat & Tradition",
  artisanatalgerien: "Artisanat & Tradition",
  artisanatpur: "Artisanat & Tradition",
  artisanat: "Artisanat & Tradition",

  // Beauté & Santé
  beautesante: "Beauté & Santé",
  beauteetsante: "Beauté & Santé",
  beautesoins: "Beauté & Santé",
  beauteetsoins: "Beauté & Santé",
  beautepurete: "Beauté & Santé",
  cosmetiques: "Beauté & Santé",

  // Auto & Moto
  automoto: "Auto & Moto",
  autoetmoto: "Auto & Moto",
  automotoaccessoires: "Auto & Moto",
  autoequipement: "Auto & Moto",
  vehiculespieces: "Auto & Moto",
  vehiculesetpieces: "Auto & Moto",
  auto: "Auto & Moto",

  // Sport & Loisirs
  sportloisirs: "Sport & Loisirs",
  sportetloisirs: "Sport & Loisirs",
  sportfitness: "Sport & Loisirs",
  sportetfitness: "Sport & Loisirs",
  sportperformance: "Sport & Loisirs",
  sport: "Sport & Loisirs",

  // Bébé & Puériculture
  bebepuericulture: "Bébé & Puériculture",
  bebeetpuericulture: "Bébé & Puériculture",
  bebeenfants: "Bébé & Puériculture",
  bebeetenfants: "Bébé & Puériculture",
  bebe: "Bébé & Puériculture",

  // Bricolage & Outillage
  bricolageoutillage: "Bricolage & Outillage",
  bricolageetoutillage: "Bricolage & Outillage",
  outillagetravaux: "Bricolage & Outillage",
  outillageettravaux: "Bricolage & Outillage",
  bricolagejardin: "Bricolage & Outillage",
  bricolagepro: "Bricolage & Outillage",
  bricolage: "Bricolage & Outillage",

  // Jeux & Jouets
  jeuxjouets: "Jeux & Jouets",
  jeuxetjouets: "Jeux & Jouets",
  jouets: "Jeux & Jouets",

  // Supermarché
  supermarche: "Supermarché",
  supermarcheterroir: "Supermarché",
  supermarcheetterroir: "Supermarché",
  epicerieterroir: "Supermarché",
  epicerieetterroir: "Supermarché",
  alimentation: "Supermarché",

  // Scolaire & Bureau
  scolairebureau: "Scolaire & Bureau",
  scolaireetbureau: "Scolaire & Bureau",
  papeteriebureau: "Scolaire & Bureau",
  scolaire: "Scolaire & Bureau",
};

const CANONICAL_BY_NORMALIZED: Record<string, string> = {};
Object.keys(PRODUCT_HIERARCHY).forEach((canonicalKey) => {
  CANONICAL_BY_NORMALIZED[normalizeKey(canonicalKey)] = canonicalKey;
});

/**
 * Resolves any category key or synonym to its canonical name.
 * If it is a genuinely new custom category created by the Admin, returns the trimmed name.
 */
export function resolveCanonicalCategoryKey(rawKey: string): string {
  if (!rawKey || typeof rawKey !== "string") return "";
  const trimmed = rawKey.trim();
  if (PRODUCT_HIERARCHY[trimmed]) return trimmed;

  const norm = normalizeKey(trimmed);
  if (CANONICAL_BY_NORMALIZED[norm]) {
    return CANONICAL_BY_NORMALIZED[norm];
  }
  if (LEGACY_CATEGORY_ALIASES[norm]) {
    return LEGACY_CATEGORY_ALIASES[norm];
  }
  return trimmed;
}

/**
 * Deduplicates a category hierarchy map by merging any legacy/synonym keys
 * into their canonical category key.
 */
export function deduplicateCategoryHierarchy(
  inputHierarchy: Record<string, Record<string, string[]>>
): Record<string, Record<string, string[]>> {
  const result: Record<string, Record<string, string[]>> = {};

  Object.entries(inputHierarchy || {}).forEach(([rawKey, subMap]) => {
    const canonicalKey = resolveCanonicalCategoryKey(rawKey);
    if (!canonicalKey) return;

    if (!result[canonicalKey]) {
      result[canonicalKey] = {};
    }

    if (subMap && typeof subMap === "object") {
      Object.entries(subMap).forEach(([subKey, subSubList]) => {
        if (rawKey === "Mode" && (subKey === "Homme" || subKey === "Femme" || subKey === "Enfant")) {
          return;
        }
        const existing = result[canonicalKey][subKey] || [];
        const incoming = Array.isArray(subSubList) ? subSubList : [];
        result[canonicalKey][subKey] = Array.from(new Set([...existing, ...incoming]));
      });
    }
  });

  return result;
}

/**
 * Deduplicates an ordered array of category keys using canonical resolution.
 */
export function deduplicateCategoryOrder(orderList: string[], availableKeys: string[]): string[] {
  const seen = new Set<string>();
  const finalOrder: string[] = [];

  for (const rawKey of [...orderList, ...availableKeys]) {
    const canonical = resolveCanonicalCategoryKey(rawKey);
    if (canonical && availableKeys.includes(canonical) && !seen.has(canonical)) {
      seen.add(canonical);
      finalOrder.push(canonical);
    }
  }

  return finalOrder;
}

const CANONICAL_QUERY_ALIASES: Record<string, string[]> = {
  "Maison & Déco": ["Maison & Déco", "Maison & Décoration", "Maison", "Ameublement & Déco"],
  "Électronique": ["Électronique", "Tech & Performance", "High-Tech", "Informatique", "Téléphonie"],
  "Électroménager": ["Électroménager", "Home Appliances", "Électronique & Électroménager"],
  "Mode": ["Mode", "Mode & Vêtements", "Mode & Élégance", "Mode & Style", "Vêtements"],
  "Artisanat & Tradition": ["Artisanat & Tradition", "Artisanat Algérien", "Artisanat Pur", "Artisanat"],
  "Beauté & Santé": ["Beauté & Santé", "Beauté & Soins", "Beauté & Pureté", "Cosmétiques"],
  "Auto & Moto": ["Auto & Moto", "Auto & Moto - Accessoires", "Auto & Équipement", "Véhicules & Pièces"],
  "Sport & Loisirs": ["Sport & Loisirs", "Sport & Fitness", "Sport & Performance", "Sport"],
  "Bébé & Puériculture": ["Bébé & Puériculture", "Bébé & Enfants", "Bébé"],
  "Bricolage & Outillage": ["Bricolage & Outillage", "Outillage & Travaux", "Bricolage & Jardin", "Bricolage Pro"],
  "Jeux & Jouets": ["Jeux & Jouets", "Jouets"],
  "Supermarché": ["Supermarché", "Supermarché & Terroir", "Épicerie & Terroir", "Alimentation"],
  "Scolaire & Bureau": ["Scolaire & Bureau", "Papeterie & Bureau", "Scolaire"],
};

/**
 * Returns up to 10 category name variants (canonical + historical aliases)
 * for Firestore `where("category", "in", ...)` queries.
 */
export function getCategoryQueryAliases(rawKey: string): string[] {
  const canonical = resolveCanonicalCategoryKey(rawKey);
  if (!canonical) return [];
  const aliases = CANONICAL_QUERY_ALIASES[canonical] || [canonical];
  return Array.from(new Set([canonical, rawKey.trim(), ...aliases])).filter(Boolean).slice(0, 10);
}

