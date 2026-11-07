export interface CategoryPhotoConfig {
  key: string;
  title: string;
  subtitle: string;
  image: string;
  gradient?: string;
}

export interface CategoryKeyDefinition {
  key: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultImage: string;
}

export const CATEGORY_KEYS: CategoryKeyDefinition[] = [
  { key: "Maison & Déco", defaultTitle: "Maison & Décoration", defaultSubtitle: "Salons, Mobilier, Linge de maison...", defaultImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800" },
  { key: "Électronique", defaultTitle: "Tech & Performance", defaultSubtitle: "Gadgets connectés, Audio & PC...", defaultImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800" },
  { key: "Électroménager", defaultTitle: "Électroménager", defaultSubtitle: "Froid, Cuisson & Petit déjeuner...", defaultImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800" },
  { key: "Mode", defaultTitle: "Mode & Élégance", defaultSubtitle: "Prêt-à-porter, Chaussures & Sacs...", defaultImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800" },
  { key: "Artisanat & Tradition", defaultTitle: "Artisanat & Tradition", defaultSubtitle: "Céramique, Tissage, Cuir & Terroir...", defaultImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800" },
  { key: "Beauté & Santé", defaultTitle: "Beauté & Soins", defaultSubtitle: "Parfums, Cosmétiques & Bien-être...", defaultImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800" },
  { key: "Auto & Moto", defaultTitle: "Auto & Moto", defaultSubtitle: "Pièces détachées, Huiles & Entretien...", defaultImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800" },
  { key: "Sport & Loisirs", defaultTitle: "Sport & Fitness", defaultSubtitle: "Musculation, Running & Plein air...", defaultImage: "https://images.unsplash.com/photo-1517649763962-0c6232662000?auto=format&fit=crop&q=80&w=800" },
  { key: "Bébé & Puériculture", defaultTitle: "Bébé & Puériculture", defaultSubtitle: "Poussettes, Sommeil, Éveil & Jeux...", defaultImage: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800" },
  { key: "Bricolage & Outillage", defaultTitle: "Outillage & Travaux", defaultSubtitle: "Outillage pro, Jardin & Maison...", defaultImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800" },
  { key: "Jeux & Jouets", defaultTitle: "Jeux & Jouets", defaultSubtitle: "Découvrez notre collection", defaultImage: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=800" },
  { key: "Supermarché", defaultTitle: "Supermarché", defaultSubtitle: "Produits frais & quotidien", defaultImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" },
  { key: "Scolaire & Bureau", defaultTitle: "Scolaire & Bureau", defaultSubtitle: "Livres, fournitures & rentrée", defaultImage: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&q=80&w=800" },
];

export const PRESET_LIBRARY: Record<string, string[]> = {
  Électronique: [
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800",
  ],
  "Maison & Déco": [
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
  ],
  Mode: [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800",
  ],
  Électroménager: [
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1610557892470-76d74cd1228d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1571843439991-dd2b8e051966?auto=format&fit=crop&q=80&w=800",
  ],
  "Auto & Moto": [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
  ],
  "Artisanat & Tradition": [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&q=80&w=800",
  ],
  "Beauté & Santé": [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
  ],
  "Sport & Loisirs": [
    "https://images.unsplash.com/photo-1517649763962-0c6232662000?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
  ],
  "Bébé & Puériculture": [
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
  ],
  "Bricolage & Outillage": [
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800",
  ],
  "Jeux & Jouets": [
    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&q=80&w=800",
  ],
  Supermarché: [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800",
  ],
  "Scolaire & Bureau": [
    "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
  ],
};
