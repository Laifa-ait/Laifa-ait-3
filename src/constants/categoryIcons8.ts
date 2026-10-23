/**
 * Configuration des logos officiels Icons8 (https://icones8.fr)
 * pour toutes les catégories du marketplace Olmart.
 * 
 * Les icônes sont hébergées localement dans /icons/categories/
 * avec fallback direct sur le CDN officiel Icons8 (https://img.icons8.com).
 */

export interface CategoryIcon8Item {
  key: string;
  iconName: string;
  label: string;
  labelEn?: string;
  localPath: string;
  localWhitePath: string;
  cdnUrl: string;
  cdnWhiteUrl: string;
}

export const CATEGORY_ICONES8_DATA: Record<string, CategoryIcon8Item> = {
  "Maison & Déco": {
    key: "maison",
    iconName: "sofa",
    label: "Maison & Déco",
    localPath: "/icons/categories/maison.png",
    localWhitePath: "/icons/categories/maison-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/sofa.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/sofa.png",
  },
  "Électronique": {
    key: "electronique",
    iconName: "smartphone",
    label: "Électronique",
    localPath: "/icons/categories/electronique.png",
    localWhitePath: "/icons/categories/electronique-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/smartphone.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/smartphone.png",
  },
  "Électroménager": {
    key: "electromenager",
    iconName: "fridge",
    label: "Home Appliances",
    labelEn: "Home Appliances",
    localPath: "/icons/categories/electromenager.png",
    localWhitePath: "/icons/categories/electromenager-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/fridge.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/fridge.png",
  },
  "Home Appliances": {
    key: "home-appliances",
    iconName: "fridge",
    label: "Home Appliances",
    labelEn: "Home Appliances",
    localPath: "/icons/categories/home-appliances.png",
    localWhitePath: "/icons/categories/home-appliances-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/fridge.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/fridge.png",
  },
  "Mode": {
    key: "mode",
    iconName: "t-shirt",
    label: "Mode",
    localPath: "/icons/categories/mode.png",
    localWhitePath: "/icons/categories/mode-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/t-shirt.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/t-shirt.png",
  },
  "Artisanat & Tradition": {
    key: "artisanat",
    iconName: "sparkling",
    label: "Artisanat & Tradition",
    localPath: "/icons/categories/artisanat.png",
    localWhitePath: "/icons/categories/artisanat-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/sparkling.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/sparkling.png",
  },
  "Beauté & Santé": {
    key: "beaute",
    iconName: "perfume-bottle",
    label: "Beauté & Santé",
    localPath: "/icons/categories/beaute.png",
    localWhitePath: "/icons/categories/beaute-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/perfume-bottle.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/perfume-bottle.png",
  },
  "Auto & Moto": {
    key: "auto",
    iconName: "car",
    label: "Auto & Moto",
    localPath: "/icons/categories/auto.png",
    localWhitePath: "/icons/categories/auto-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/car.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/car.png",
  },
  "Sport & Loisirs": {
    key: "sport",
    iconName: "dumbbell",
    label: "Sport & Loisirs",
    localPath: "/icons/categories/sport.png",
    localWhitePath: "/icons/categories/sport-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/dumbbell.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/dumbbell.png",
  },
  "Bébé & Puériculture": {
    key: "bebe",
    iconName: "baby",
    label: "Bébé & Puériculture",
    localPath: "/icons/categories/bebe.png",
    localWhitePath: "/icons/categories/bebe-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/baby.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/baby.png",
  },
  "Bricolage & Outillage": {
    key: "bricolage",
    iconName: "hammer",
    label: "Bricolage & Outillage",
    localPath: "/icons/categories/bricolage.png",
    localWhitePath: "/icons/categories/bricolage-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/hammer.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/hammer.png",
  },
  "Jeux & Jouets": {
    key: "jouets",
    iconName: "puzzle",
    label: "Jeux & Jouets",
    localPath: "/icons/categories/jouets.png",
    localWhitePath: "/icons/categories/jouets-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/puzzle.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/puzzle.png",
  },
  "Supermarché": {
    key: "supermarche",
    iconName: "shopping-cart",
    label: "Supermarché",
    localPath: "/icons/categories/supermarche.png",
    localWhitePath: "/icons/categories/supermarche-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/shopping-cart.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/shopping-cart.png",
  },
  "Scolaire & Bureau": {
    key: "scolaire",
    iconName: "book",
    label: "Scolaire & Bureau",
    localPath: "/icons/categories/scolaire.png",
    localWhitePath: "/icons/categories/scolaire-white.png",
    cdnUrl: "https://img.icons8.com/ios/100/1e293b/book.png",
    cdnWhiteUrl: "https://img.icons8.com/ios/100/ffffff/book.png",
  },
};

/**
 * Récupère l'élément Icons8 par nom ou ID normalisé
 */
export function getCategoryIcon8Info(nameOrId: string): CategoryIcon8Item | undefined {
  if (CATEGORY_ICONES8_DATA[nameOrId]) {
    return CATEGORY_ICONES8_DATA[nameOrId];
  }

  const normalized = nameOrId.toLowerCase().trim();
  const entry = Object.values(CATEGORY_ICONES8_DATA).find(
    (item) =>
      item.key === normalized ||
      item.label.toLowerCase() === normalized ||
      (item.labelEn && item.labelEn.toLowerCase() === normalized)
  );

  return entry;
}

/**
 * Récupère l'URL d'icône Icons8 (local ou CDN)
 */
export function getCategoryIcon8Url(nameOrId: string, isActive: boolean = false): string {
  const info = getCategoryIcon8Info(nameOrId);
  if (!info) {
    return isActive
      ? "https://img.icons8.com/ios/100/ffffff/bulleted-list.png"
      : "https://img.icons8.com/ios/100/1e293b/bulleted-list.png";
  }
  return isActive ? info.localWhitePath : info.localPath;
}
