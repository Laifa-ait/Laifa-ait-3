import { db } from "../src/config/firebase-admin";
import wilayasData from "../src/constants/wilayasData.json";
import { Timestamp } from "firebase-admin/firestore";

interface RawWilaya {
  code: string;
  name: string;
  name_ar?: string;
  lat?: number;
  lng?: number;
}

interface SeededWilaya {
  code: string;
  name: string;
  name_ar: string;
  lat: number;
  lng: number;
  zone: "Nord" | "Hauts-Plateaux" | "Sud" | "Grand-Sud";
  homeDeliveryCostDZD: number;
  stopDeskDeliveryCostDZD: number;
  estimatedDeliveryDays: number;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CategoryDefinition {
  id: string;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  icon: string;
  image: string;
  gradient: string;
  order: number;
  active: boolean;
  subcategories: string[];
  subCategoryImages: Record<string, string>;
  hierarchy: Record<string, string[]>;
}

// 1. Catégories Officielles Olmart Algérie
const OFFICIAL_CATEGORIES: CategoryDefinition[] = [
  {
    id: "Artisanat Algérien",
    title: "Artisanat d'Algérie",
    title_ar: "الصناعة التقليدية الجزائرية",
    subtitle: "Trésors des 69 Wilayas & Savoir-faire ancestral",
    subtitle_ar: "كنوز 69 ولاية وإبداع الأجداد",
    icon: "🏺",
    image: "/images/placeholders/product.svg",
    gradient: "from-amber-950/80 via-amber-900/30 to-transparent",
    order: 1,
    active: true,
    subcategories: [
      "Tapis Traditionnels & Berbères",
      "Poterie & Céramique de Kabylie",
      "Dinanderie & Cuivre de Constantine",
      "Bijoux Traditionnels en Argent",
      "Habits Traditionnels & Caftans",
      "Cuir, Maroquinerie & Babouches",
      "Vannerie & Sparterie des Oasis",
    ],
    subCategoryImages: {
      "Tapis Traditionnels & Berbères": "/images/placeholders/product.svg",
      "Poterie & Céramique de Kabylie": "/images/placeholders/product.svg",
      "Dinanderie & Cuivre de Constantine": "/images/placeholders/product.svg",
      "Bijoux Traditionnels en Argent": "/images/placeholders/product.svg",
      "Habits Traditionnels & Caftans": "/images/placeholders/product.svg",
      "Cuir, Maroquinerie & Babouches": "/images/placeholders/product.svg",
      "Vannerie & Sparterie des Oasis": "/images/placeholders/product.svg",
    },
    hierarchy: {
      "Tapis Traditionnels & Berbères": ["Tapis de Ghardaïa", "Tapis Babar des Aurès", "Tapis Guergour", "Killims du Mzab"],
      "Poterie & Céramique de Kabylie": ["Poterie de Maâtkas", "Poterie de Sejnane", "Vases & Tajines en terre cuite", "Céramiques décoratives"],
      "Dinanderie & Cuivre de Constantine": ["Plateaux gravés en cuivre rouge", "Théières & Sucriers", "M'rachech & Aiguières", "Miroirs en laiton"],
      "Bijoux Traditionnels en Argent": ["Bijoux d'Ath Yenni émaillés", "Bijoux Chaouis & Fibules", "Khelkhel & Bracelets berbères", "Colliers en corail d'El Tarf"],
      "Habits Traditionnels & Caftans": ["Karakou algérois brodé au fil d'or", "Gandoura constantinoise en velours", "Robe kabyle brodée", "Burnous en laine fine"],
      "Cuir, Maroquinerie & Babouches": ["Babouches artisanales en cuir", "Selles traditionnelles de fantasia", "Sacs en cuir repoussé", "Pouf en cuir saharien"],
      "Vannerie & Sparterie des Oasis": ["Paniers en palmier dattier", "Chapeaux sahariens", "Corbeilles tressées", "Sets de table en alfa"],
    },
  },
  {
    id: "Électronique & High-Tech",
    title: "Électronique & High-Tech",
    title_ar: "إلكترونيات وتكنولوجيا",
    subtitle: "Smartphones, Ordinateurs, Audio & Objets connectés",
    subtitle_ar: "هواتف ذكية، حواسيب، صوتيات وأجهزة متصلة",
    icon: "📱",
    image: "/images/placeholders/product.svg",
    gradient: "from-blue-950/80 via-blue-900/30 to-transparent",
    order: 2,
    active: true,
    subcategories: [
      "Smartphones & Téléphones",
      "Accessoires Téléphonie",
      "Ordinateurs Portables & PC",
      "Tablettes & Liseuses",
      "Audio, Casques & Écouteurs",
      "Gaming & Consoles",
      "Objets Connectés & Domotique",
    ],
    subCategoryImages: {
      "Smartphones & Téléphones": "/images/placeholders/product.svg",
      "Accessoires Téléphonie": "/images/placeholders/product.svg",
      "Ordinateurs Portables & PC": "/images/placeholders/product.svg",
      "Tablettes & Liseuses": "/images/placeholders/product.svg",
      "Audio, Casques & Écouteurs": "/images/placeholders/product.svg",
      "Gaming & Consoles": "/images/placeholders/product.svg",
      "Objets Connectés & Domotique": "/images/placeholders/product.svg",
    },
    hierarchy: {
      "Smartphones & Téléphones": ["Smartphones Android", "iPhone & iOS", "Téléphones à touches robustes"],
      "Accessoires Téléphonie": ["Chargeurs rapides & Câbles USB-C", "Powerbanks & Batteries externes", "Coques antichoc & Verres trempés"],
      "Ordinateurs Portables & PC": ["Laptops Bureautique", "PC Portables Gaming", "Stations de travail Pro", "Écrans & Moniteurs"],
      "Tablettes & Liseuses": ["Tablettes graphiques & pro", "Tablettes multimédia", "Liseuses d'e-books"],
      "Audio, Casques & Écouteurs": ["Écouteurs sans fil TWS", "Casques à réduction de bruit", "Enceintes Bluetooth étanches"],
      "Gaming & Consoles": ["Consoles PlayStation & Xbox", "Manettes & Accessoires", "Casques gamer & Claviers mécaniques"],
      "Objets Connectés & Domotique": ["Montres connectées", "Caméras de sécurité Wi-Fi", "Prises & Ampoules intelligentes"],
    },
  },
  {
    id: "Électroménager",
    title: "Électroménager",
    title_ar: "أجهزة كهرومنزلية",
    subtitle: "Climatisation Tropicale, Froid, Cuisson & Lavage",
    subtitle_ar: "مكيفات هوائية للمناخ الحار، ثلاجات، غسالات وأفران",
    icon: "🍳",
    image: "/images/placeholders/product.svg",
    gradient: "from-cyan-950/80 via-cyan-900/30 to-transparent",
    order: 3,
    active: true,
    subcategories: [
      "Climatisation & Chauffage",
      "Réfrigérateurs & Congélateurs",
      "Lave-linge & Sèche-linge",
      "Cuisson, Fours & Plaques",
      "TV & Home Cinéma",
      "Petit Électroménager & Café",
      "Entretien du sol & Aspirateurs",
    ],
    subCategoryImages: {
      "Climatisation & Chauffage": "/images/placeholders/product.svg",
      "Réfrigérateurs & Congélateurs": "/images/placeholders/product.svg",
      "Lave-linge & Sèche-linge": "/images/placeholders/product.svg",
      "Cuisson, Fours & Plaques": "/images/placeholders/product.svg",
      "TV & Home Cinéma": "/images/placeholders/product.svg",
      "Petit Électroménager & Café": "/images/placeholders/product.svg",
      "Entretien du sol & Aspirateurs": "/images/placeholders/product.svg",
    },
    hierarchy: {
      "Climatisation & Chauffage": ["Climatiseurs Tropicalisés Inverter", "Chauffages à gaz sécurisés", "Ventilateurs brumisateurs"],
      "Réfrigérateurs & Congélateurs": ["Réfrigérateurs No Frost", "Congélateurs coffres grande capacité", "Minibars"],
      "Lave-linge & Sèche-linge": ["Lave-linge hublot haute efficacité", "Lave-linge top", "Lave-vaisselle silencieux"],
      "Cuisson, Fours & Plaques": ["Cuisinières professionnelles inox", "Fours encastrables", "Plaques à induction & gaz", "Micro-ondes & Grills"],
      "TV & Home Cinéma": ["Téléviseurs Smart TV 4K UHD", "Téléviseurs OLED / QLED", "Barres de son Dolby Atmos", "Supports muraux inclinables"],
      "Petit Électroménager & Café": ["Machines à café espresso", "Blenders & Robots multifonctions", "Friteuses sans huile Airfryer", "Bouilloires & Grille-pain"],
      "Entretien du sol & Aspirateurs": ["Aspirateurs balais sans fil", "Aspirateurs robots laveurs", "Nettoyeurs vapeur haute pression"],
    },
  },
  {
    id: "Maison & Déco",
    title: "Maison & Décoration",
    title_ar: "المنزل والديكور",
    subtitle: "Salons, Mobilier, Linge de maison & Luminaires",
    subtitle_ar: "أثاث الصالون، مفروشات، إنارة وتجهيز المنزل",
    icon: "🛋️",
    image: "/images/placeholders/product.svg",
    gradient: "from-amber-950/80 via-amber-900/30 to-transparent",
    order: 4,
    active: true,
    subcategories: [
      "Meubles & Salons",
      "Linge de Maison & Textile",
      "Cuisine & Arts de la table",
      "Luminaires & Éclairage",
      "Salle de bain & Rangement",
      "Jardin, Terrasse & Balcon",
    ],
    subCategoryImages: {
      "Meubles & Salons": "/images/placeholders/product.svg",
      "Linge de Maison & Textile": "/images/placeholders/product.svg",
      "Cuisine & Arts de la table": "/images/placeholders/product.svg",
      "Luminaires & Éclairage": "/images/placeholders/product.svg",
      "Salle de bain & Rangement": "/images/placeholders/product.svg",
      "Jardin, Terrasse & Balcon": "/images/placeholders/product.svg",
    },
    hierarchy: {
      "Meubles & Salons": ["Canapés d'angle & Fauteuils", "Tables basses modernes", "Meubles TV design", "Salons marocains et traditionnels"],
      "Linge de Maison & Textile": ["Parures de lit coton satiné", "Couvertures chaudes d'hiver", "Rideaux occultants & voilages", "Coussins décoratifs"],
      "Cuisine & Arts de la table": ["Services à couscous complets", "Services à thé & café dorés", "Batteries de cuisine antiadhésives", "Ménagères inox prestige"],
      "Luminaires & Éclairage": ["Lustres orientaux en métal ciselé", "Plafonniers LED modernes", "Lampadaires de salon", "Veilleuses et appliques murales"],
      "Salle de bain & Rangement": ["Colonnes de douche hydromassantes", "Meubles sous-vasque", "Paniers à linge & rangements", "Miroirs LED antibuée"],
      "Jardin, Terrasse & Balcon": ["Salons de jardin en résine tressée", "Parasols déportés", "Barbecues & Grils", "Tondeuses et arrosage"],
    },
  },
  {
    id: "Mode & Habillement",
    title: "Mode & Habillement",
    title_ar: "الموضة والأزياء",
    subtitle: "Prêt-à-porter Femme, Homme, Enfant & Accessoires",
    subtitle_ar: "أزياء نسائية، رجالية، للأطفال وإكسسوارات راقية",
    icon: "👕",
    image: "/images/placeholders/product.svg",
    gradient: "from-rose-950/80 via-rose-900/30 to-transparent",
    order: 5,
    active: true,
    subcategories: [
      "Mode Femme & Hijab",
      "Mode Homme",
      "Enfants & Bébés",
      "Chaussures & Baskets",
      "Maroquinerie, Sacs & Valises",
      "Montres & Bijoux",
    ],
    subCategoryImages: {
      "Mode Femme & Hijab": "/images/placeholders/product.svg",
      "Mode Homme": "/images/placeholders/product.svg",
      "Enfants & Bébés": "/images/placeholders/product.svg",
      "Chaussures & Baskets": "/images/placeholders/product.svg",
      "Maroquinerie, Sacs & Valises": "/images/placeholders/product.svg",
      "Montres & Bijoux": "/images/placeholders/product.svg",
    },
    hierarchy: {
      "Mode Femme & Hijab": ["Abayas & Robes longues modernes", "Hijabs en soie de Médine & Mousseline", "Ensembles chics & Tailleurs", "Manteaux d'hiver & Vestes"],
      "Mode Homme": ["Costumes classiques & Chemises", "Kamis & Djellabas pour prière et fêtes", "Polos, T-shirts & Jeans", "Vestes en cuir & Manteaux"],
      "Enfants & Bébés": ["Tenues de fête pour garçons et filles", "Pyjamas doux en coton biologique", "Manteaux & doudounes enfant"],
      "Chaussures & Baskets": ["Baskets tendance streetwear", "Chaussures richelieu habillées", "Escarpins & Sandales élégantes", "Chaussons confort"],
      "Maroquinerie, Sacs & Valises": ["Sacs à main cuir", "Valises de voyage rigides à 4 roulettes", "Sacs à dos ordinateur", "Portefeuilles cuir"],
      "Montres & Bijoux": ["Montres chronographes homme", "Montres élégantes femme", "Parures dorées et argentées"],
    },
  },
  {
    id: "Beauté & Santé",
    title: "Beauté & Bien-être",
    title_ar: "الجمال والعناية الصحية",
    subtitle: "Soins Bio du Terroir, Parfums d'Orient & Dermocosmétique",
    subtitle_ar: "زيوت طبيعية محلية، عطور شرقية ومستحضرات صيدلانية",
    icon: "✨",
    image: "/images/placeholders/product.svg",
    gradient: "from-pink-950/80 via-pink-900/30 to-transparent",
    order: 6,
    active: true,
    subcategories: [
      "Huiles & Soins Naturels d'Algérie",
      "Parfums & Eaux de Cologne",
      "Soins du Visage & Anti-Âge",
      "Maquillage & Onglerie",
      "Soins Capillaires & Barbe",
      "Hygiène & Santé au quotidien",
    ],
    subCategoryImages: {
      "Huiles & Soins Naturels d'Algérie": "/images/placeholders/product.svg",
      "Parfums & Eaux de Cologne": "/images/placeholders/product.svg",
      "Soins du Visage & Anti-Âge": "/images/placeholders/product.svg",
      "Maquillage & Onglerie": "/images/placeholders/product.svg",
      "Soins Capillaires & Barbe": "/images/placeholders/product.svg",
      "Hygiène & Santé au quotidien": "/images/placeholders/product.svg",
    },
    hierarchy: {
      "Huiles & Soins Naturels d'Algérie": ["Huile pure de pépins de figue de barbarie", "Savon d'Alep & Savon noir traditionnel", "Eau de rose distillée de Médéa", "Argile Ghassoul purifiante"],
      "Parfums & Eaux de Cologne": ["Parfums orientaux Oud & Musc", "Eaux de parfum florales françaises", "Bakhour & Encens pour la maison"],
      "Soins du Visage & Anti-Âge": ["Sérums à la vitamine C et acide hyaluronique", "Crèmes solaires SPF50+ haute protection", "Gels nettoyants moussants purifiants"],
      "Maquillage & Onglerie": ["Fonds de teint haute couvrance", "Rouges à lèvres mats longue tenue", "Khol naturel traditionnel", "Palettes d'ombres à paupières"],
      "Soins Capillaires & Barbe": ["Shampoings anti-chute sans sulfates", "Masques réparateurs kératine", "Huiles à barbe hydratantes"],
      "Hygiène & Santé au quotidien": ["Tensiomètres et thermomètres connectés", "Brosses à dents électriques soniques", "Vitamines & Compléments alimentaires"],
    },
  },
  {
    id: "Auto & Moto",
    title: "Auto & Moto",
    title_ar: "السيارات والدراجات النارية",
    subtitle: "Pièces détachées, Huiles moteur climat chaud & Équipements",
    subtitle_ar: "قطع الغيار الأصلية، زيوت المحرك ومعدات المركبات",
    icon: "🚗",
    image: "/images/placeholders/product.svg",
    gradient: "from-zinc-950/80 via-zinc-900/30 to-transparent",
    order: 7,
    active: true,
    subcategories: [
      "Huiles Moteur & Fluides Haute Chaleur",
      "Pièces Détachées Mécaniques",
      "Pneumatiques & Jantes",
      "Électronique & Éclairage Auto",
      "Équipements & Casques Moto",
      "Accessoires Confort & Entretien",
    ],
    subCategoryImages: {
      "Huiles Moteur & Fluides Haute Chaleur": "/images/placeholders/product.svg",
      "Pièces Détachées Mécaniques": "/images/placeholders/product.svg",
      "Pneumatiques & Jantes": "/images/placeholders/product.svg",
      "Électronique & Éclairage Auto": "/images/placeholders/product.svg",
      "Équipements & Casques Moto": "/images/placeholders/product.svg",
      "Accessoires Confort & Entretien": "/images/placeholders/product.svg",
    },
    hierarchy: {
      "Huiles Moteur & Fluides Haute Chaleur": ["Huiles 5W30, 5W40, 10W40 certifiées", "Liquides de refroidissement spécial climat chaud 50%", "Liquides de frein DOT4"],
      "Pièces Détachées Mécaniques": ["Plaquettes & Disques de frein", "Filtres à huile, air, habitacle", "Kits d'embrayage & Courroies de distribution", "Amortisseurs renforcés"],
      "Pneumatiques & Jantes": ["Pneus été haute adhérence", "Pneus tout-terrain 4x4 & SUV", "Kits de réparation crevaison & Compresseurs 12V"],
      "Électronique & Éclairage Auto": ["Ampoules LED haute puissance homologuées", "Dashcams avec enregistrement continu", "Autoradios Android avec CarPlay / Android Auto"],
      "Équipements & Casques Moto": ["Casques intégraux & modulables homologués", "Gants moto aérés été", "Vestes motard avec protections coudes/épaules"],
      "Accessoires Confort & Entretien": ["Housses de sièges sur-mesure", "Pare-soleil aluminium grand pare-brise", "Shampoings carrosserie & Polish lustrant"],
    },
  },
  {
    id: "Supermarché & Épicerie du Terroir",
    title: "Supermarché & Terroir",
    title_ar: "سوبرماركت ومأكولات أصيلة",
    subtitle: "Dattes Deglet Nour, Huile d'Olive AOP & Épices raffinées",
    subtitle_ar: "تمور دقلة نور طولقة، زيت زيتون قبائلي وتوابل شرقية",
    icon: "🛒",
    image: "/images/placeholders/product.svg",
    gradient: "from-emerald-950/80 via-emerald-900/30 to-transparent",
    order: 8,
    active: true,
    subcategories: [
      "Dattes & Dérivés du Terroir",
      "Huiles d'Olive Vierge Extra AOP",
      "Miel Pur de l'Atlas & Confitures",
      "Épices Traditionnelles & Ras El Hanout",
      "Cafés, Thés & Infusions",
      "Épicerie Salée & Semoules",
    ],
    subCategoryImages: {
      "Dattes & Dérivés du Terroir": "/images/placeholders/product.svg",
      "Huiles d'Olive Vierge Extra AOP": "/images/placeholders/product.svg",
      "Miel Pur de l'Atlas & Confitures": "/images/placeholders/product.svg",
      "Épices Traditionnelles & Ras El Hanout": "/images/placeholders/product.svg",
      "Cafés, Thés & Infusions": "/images/placeholders/product.svg",
      "Épicerie Salée & Semoules": "/images/placeholders/product.svg",
    },
    hierarchy: {
      "Dattes & Dérivés du Terroir": ["Dattes Deglet Nour de Tolga branchées 1ère qualité", "Sirop de dattes (Robb)", "Pâte de dattes pour gâteaux traditionnels"],
      "Huiles d'Olive Vierge Extra AOP": ["Huile d'olive première pression à froid de Kabylie", "Huile d'olive fruitée de Sig / Mascara", "Huiles aromatisées au piment et herbes"],
      "Miel Pur de l'Atlas & Confitures": ["Miel d'eucalyptus de Mitidja", "Miel de montagne toutes fleurs", "Miel de jujubier (Sidr) sauvage"],
      "Épices Traditionnelles & Ras El Hanout": ["Ras El Hanout authentique 21 épices", "Cumin moulu de qualité supérieure", "Paprika doux et fort artisanal", "Cannelle de Ceylan"],
      "Cafés, Thés & Infusions": ["Cafés en grains torréfaction artisanale", "Thé vert gunpowder pour thé à la menthe", "Tisanes de verveine et camomille sauvage"],
      "Épicerie Salée & Semoules": ["Semoule fine, moyenne et grosse pour couscous", "Pâtes traditionnelles Rechta et Trida", "Conserves d'harissa artisanale"],
    },
  },
];

// Calcul de zone géographique selon code Wilaya
function getWilayaZone(codeStr: string): "Nord" | "Hauts-Plateaux" | "Sud" | "Grand-Sud" {
  const code = parseInt(codeStr, 10);
  if ([11, 33, 47, 53, 54, 56].includes(code)) {
    return "Grand-Sud"; // Tamanrasset, Illizi, Ghardaïa, Djanet, In Guezzam, In Salah
  }
  if ([1, 7, 8, 30, 37, 39, 49, 50, 51, 52, 55, 57, 58].includes(code)) {
    return "Sud"; // Adrar, Biskra, Béchar, Ouargla, Tindouf, El Oued, Timimoun, Bordj Badji Mokhtar, etc.
  }
  if ([3, 4, 5, 12, 14, 17, 19, 20, 28, 29, 32, 34, 38, 40, 41, 43, 45].includes(code)) {
    return "Hauts-Plateaux"; // Sétif, Batna, Djelfa, Tiaret, Bordj Bou Arreridj, M'Sila, etc.
  }
  return "Nord"; // Alger, Oran, Constantine, Annaba, Blida, Béjaïa, Tipaza, Boumerdès, etc.
}

function getDeliveryCosts(zone: "Nord" | "Hauts-Plateaux" | "Sud" | "Grand-Sud"): { home: number; stopDesk: number; days: number } {
  switch (zone) {
    case "Nord":
      return { home: 600, stopDesk: 350, days: 1 };
    case "Hauts-Plateaux":
      return { home: 800, stopDesk: 500, days: 2 };
    case "Sud":
      return { home: 1000, stopDesk: 650, days: 3 };
    case "Grand-Sud":
      return { home: 1300, stopDesk: 850, days: 4 };
  }
}

export async function seedAlgeriaData(): Promise<void> {
  console.log("=================================================================");
  console.log("🇩🇿 [Olmart Seeder] Démarrage du Seeding Officiel pour l'Algérie...");
  console.log("=================================================================");

  if (!db) {
    throw new Error("Firestore Admin instance unavailable.");
  }

  // A. SEEDING DES 69 WILAYAS
  console.log("\n📦 1. Seeding des 69 Wilayas Algériennes...");
  const rawWilayas = wilayasData as RawWilaya[];
  console.log(`ℹ️  Nombre de wilayas à insérer : ${rawWilayas.length}`);

  const wilayasBatch = db.batch();
  const summaryWilayas: SeededWilaya[] = [];

  for (const raw of rawWilayas) {
    const code = raw.code.padStart(2, "0");
    const zone = getWilayaZone(code);
    const { home, stopDesk, days } = getDeliveryCosts(zone);

    const wilayaDoc: SeededWilaya = {
      code,
      name: raw.name,
      name_ar: raw.name_ar || raw.name,
      lat: raw.lat || 36.75,
      lng: raw.lng || 3.05,
      zone,
      homeDeliveryCostDZD: home,
      stopDeskDeliveryCostDZD: stopDesk,
      estimatedDeliveryDays: days,
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = db.collection("wilayas").doc(code);
    wilayasBatch.set(docRef, wilayaDoc, { merge: true });
    summaryWilayas.push(wilayaDoc);
  }

  await wilayasBatch.commit();
  console.log(`✅ ${summaryWilayas.length} Wilayas enregistrées dans la collection /wilayas/{code}`);

  // Document récapitulatif dans /settings/wilayas pour chargement ultra-rapide côté client
  await db.collection("settings").doc("wilayas").set({
    count: summaryWilayas.length,
    wilayas: summaryWilayas.map((w) => ({
      code: w.code,
      name: w.name,
      name_ar: w.name_ar,
      lat: w.lat,
      lng: w.lng,
      zone: w.zone,
      homeDeliveryCostDZD: w.homeDeliveryCostDZD,
      stopDeskDeliveryCostDZD: w.stopDeskDeliveryCostDZD,
      estimatedDeliveryDays: w.estimatedDeliveryDays,
    })),
    updatedAt: Timestamp.now(),
  }, { merge: true });
  console.log("✅ Fiche de référence globale enregistrée dans /settings/wilayas");

  // B. SEEDING DES CATÉGORIES OFFICIELLES
  console.log("\n📦 2. Seeding des Catégories Officielles Olmart Algérie...");

  const globalHierarchy: Record<string, Record<string, string[]>> = {};

  for (const cat of OFFICIAL_CATEGORIES) {
    const docRef = db.collection("homepage_categories_v2").doc(cat.id);
    await docRef.set({
      id: cat.id,
      title: cat.title,
      title_ar: cat.title_ar,
      subtitle: cat.subtitle,
      subtitle_ar: cat.subtitle_ar,
      icon: cat.icon,
      image: cat.image,
      gradient: cat.gradient,
      order: cat.order,
      active: cat.active,
      subcategories: cat.subcategories,
      subCategoryImages: cat.subCategoryImages,
      featuredProductIds: [],
      updatedAt: Timestamp.now(),
    }, { merge: true });

    globalHierarchy[cat.id] = cat.hierarchy;
    console.log(`  ✓ Catégorie créée dans /homepage_categories_v2/${cat.id} (${cat.subcategories.length} sous-catégories)`);
  }

  // Sauvegarde de la hiérarchie globale complète dans /settings/categories
  await db.collection("settings").doc("categories").set({
    hierarchy: globalHierarchy,
    updatedAt: Timestamp.now(),
  }, { merge: true });
  console.log("✅ Hiérarchie taxonomique à 3 niveaux enregistrée dans /settings/categories");

  console.log("\n=================================================================");
  console.log("🎉 [Olmart Seeder] Seeding Algérie achevé avec 100% de succès !");
  console.log("=================================================================\n");
}

// Exécution directe en CLI
if (process.argv[1]?.endsWith("seed-algeria-data.ts") || process.argv[1]?.endsWith("seed-algeria-data.js")) {
  seedAlgeriaData()
    .then(() => process.exit(0))
    .catch((err: unknown) => {
      console.error("❌ Erreur critique lors du seeding Algérie :", err);
      process.exit(1);
    });
}
