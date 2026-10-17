/**
 * Dictionnaire de synonymes, phonétique et normalisation linguistique
 * spécialement conçu pour le marché et les habitudes de recherche en Algérie.
 */

export const ALGERIAN_SYNONYM_GROUPS: string[][] = [
  // High-Tech & Téléphonie
  [
    "telephone", "smartphone", "portable", "mobile", "smart", "gsm", "iphone",
    "samsung", "redmi", "xiaomi", "oppo", "realme", "condor", "infinix", "huawei",
    "هاتف", "جوال", "موبايل", "تلفون"
  ],
  [
    "pc", "ordinateur", "laptop", "macbook", "computer", "unite centrale", "bureau",
    "gamer", "pc portable", "حاسوب", "كمبيوتر", "لابتوب"
  ],
  [
    "ecouteur", "casque", "airpods", "kitman", "earphones", "headphones", "baffle",
    "haut parleur", "audio", "bluetooth", "سماعات", "مكبر صوت"
  ],
  [
    "ecran", "moniteur", "tv", "television", "display", "smart tv", "demo", "recepteur",
    "تلفاز", "شاشة"
  ],

  // Mode & Vêtements
  [
    "robe", "caftan", "kaftan", "karakou", "blousa", "badroun", "gandoura", "abaya",
    "soiree", "mariage", "traditionnel", "فساتين", "فستان", "قفطان", "كاراكو", "عباية"
  ],
  [
    "pantalon", "jeans", "jean", "serwal", "sarouel", "pants", "jogging", "short",
    "cargo", "سروال", "بنطلون"
  ],
  [
    "t-shirt", "tshirt", "tricot", "chemise", "polo", "haut", "shirt", "kamis", "qamis",
    "قميص", "تيشيرت"
  ],
  [
    "veste", "kebbot", "blouson", "manteau", "pull", "hoodie", "sweat", "survet",
    "survetement", "معطف", "سترة"
  ],
  [
    "chaussure", "basket", "sneaker", "soulier", "shoes", "sandale", "sandala",
    "claquette", "sbata", "sbabit", "sabot", "botte", "bottine", "حذاء", "أحذية", "صندل"
  ],
  [
    "sac", "sacoche", "valise", "sac a main", "pochette", "backpack", "حقيبة"
  ],

  // Maison & Électroménager
  [
    "electromenager", "frigo", "refrigerateur", "congelateur", "lave linge", "machine a laver",
    "cuisiniere", "four", "koucha", "aspirateur", "micro ondes", "ثلاجة", "غسالة", "فرن"
  ],
  [
    "climatiseur", "clim", "chauffage", "ventilo", "ventilateur", "chaudiere",
    "مكيف", "مدفأة"
  ],
  [
    "cuisine", "vaisselle", "cocotte", "poele", "casserole", "service", "طنجرة", "أواني"
  ],
  [
    "meuble", "salon", "canape", "fauteuil", "lit", "matelas", "table", "armoire", "أثاث"
  ],

  // Beauté, Santé & Parfums
  [
    "parfum", "riha", "fragrance", "musk", "oud", "bakhoor", "deodorant", "عطر", "بخور"
  ],
  [
    "maquillage", "cosmetique", "rouge a levres", "fard", "fond de teint", "soin", "creme",
    "تجميل", "مكياج"
  ],

  // Véhicules & Pièces
  [
    "voiture", "auto", "vehicule", "sayara", "piece auto", "pneu", "moteur", "سيارة"
  ]
];

export const ALGERIAN_WILAYAS_NAMES: Record<string, string> = {
  "01": "Adrar", "02": "Chlef", "03": "Laghouat", "04": "Oum El Bouaghi", "05": "Batna",
  "06": "Béjaïa", "07": "Biskra", "08": "Béchar", "09": "Blida", "10": "Bouira",
  "11": "Tamanrasset", "12": "Tébessa", "13": "Tlemcen", "14": "Tiaret", "15": "Tizi Ouzou",
  "16": "Alger", "17": "Djelfa", "18": "Jijel", "19": "Sétif", "20": "Saïda",
  "21": "Skikda", "22": "Sidi Bel Abbès", "23": "Annaba", "24": "Guelma", "25": "Constantine",
  "26": "Médéa", "27": "Mostaganem", "28": "M'Sila", "29": "Mascara", "30": "Ouargla",
  "31": "Oran", "32": "El Bayadh", "33": "Illizi", "34": "Bordj Bou Arréridj", "35": "Boumerdès",
  "36": "El Tarf", "37": "Tindouf", "38": "Tissemsilt", "39": "El Oued", "40": "Khenchela",
  "41": "Souk Ahras", "42": "Tipaza", "43": "Mila", "44": "Aïn Defla", "45": "Naâma",
  "46": "Aïn Témouchent", "47": "Ghardaïa", "48": "Relizane", "49": "El M'Ghair", "50": "El Meniaa",
  "51": "Ouled Djellal", "52": "Bordj Baji Mokhtar", "53": "Béni Abbès", "54": "Timimoun",
  "55": "Touggourt", "56": "Djanet", "57": "In Salah", "58": "In Guezzam"
};

/**
 * Normalise un texte multilingue (français, arabe, dialectal)
 */
export function normalizeAlgerianSearchText(text?: string): string {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents français
    .replace(/[\u064B-\u065F]/g, "") // Supprime les diacritiques arabes (tashkeel)
    .replace(/[أإآا]/g, "ا")         // Unifie les Alif
    .replace(/ة/g, "ه")             // Unifie Teh Marbuta en Heh
    .replace(/[ىي]/g, "ي")           // Unifie Yeh
    .toLowerCase()
    .trim();
}

/**
 * Soundex adapté au contexte franco-algérien
 */
export function getAlgerianSoundex(word: string): string {
  const w = word.toLowerCase().trim().replace(/[^a-z]/g, "");
  if (w.length === 0) return "";
  const first = w.charAt(0).toUpperCase();
  const codes: Record<string, number> = {
    b: 1, p: 1, v: 1, f: 1,
    c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
    d: 3, t: 3,
    l: 4,
    m: 5, n: 5,
    r: 6
  };
  let res = first;
  for (let i = 1; i < w.length; i++) {
    const char = w.charAt(i);
    const code = codes[char];
    if (code && code !== codes[w.charAt(i - 1)]) {
      res += code;
    }
  }
  return (res + "0000").slice(0, 4);
}
