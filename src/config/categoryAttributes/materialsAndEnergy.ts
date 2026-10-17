import { MaterialOption } from "./types";

/**
 * Détermine si la classe énergétique est strictement pertinente pour le produit
 */
export function isEnergyClassApplicable(category?: string, subcategory?: string): boolean {
  if (!category) return false;
  const c = category.toLowerCase();
  const s = (subcategory || "").toLowerCase();

  if (c.includes("électroménager") || c.includes("electromenager")) return true;
  if (c.includes("électronique") && (s.includes("tv") || s.includes("télévis") || s.includes("écran"))) return true;
  if (s.includes("froid") || s.includes("lavage") || s.includes("cuisson") || s.includes("climatisation") || s.includes("chauffage")) return true;
  return false;
}

/**
 * Retourne la liste des matières premières strictement pertinentes pour la catégorie
 */
export function getRelevantMaterials(category?: string, subcategory?: string, subSubCategory?: string): MaterialOption[] {
  const cat = (category || "").toLowerCase();
  const sub = (subcategory || "").toLowerCase();
  const subSub = (subSubCategory || "").toLowerCase();

  // 1. Mode, Vêtements, Textiles, Vestes
  if (cat.includes("mode") || sub.includes("vêtement") || sub.includes("veste") || sub.includes("costume") || sub.includes("robe") || sub.includes("pantalon") || sub.includes("homme") || sub.includes("femme") || sub.includes("enfant")) {
    return [
      { id: "Coton", label: "Coton / قطن" },
      { id: "Cuir", label: "Cuir véritable / جلد طبيعي" },
      { id: "Similicuir", label: "Similicuir (PU) / جلد صناعي" },
      { id: "Denim", label: "Denim (Jean) / جينز" },
      { id: "Laine", label: "Laine / صوف" },
      { id: "Polyester", label: "Polyester / بوليستر" },
      { id: "Lin", label: "Lin / كتان" },
      { id: "Soie", label: "Soie / حرير" },
      { id: "Velours", label: "Velours / مخمل" },
      { id: "Polaire", label: "Polaire / قماش صوفي دافئ" },
      { id: "Duvet", label: "Duvet & Plumes / ريش دافئ" },
      { id: "Nylon", label: "Nylon imperméable / نايلون" },
      { id: "Viscose", label: "Viscose / فيسكوز" },
      { id: "Cachemire", label: "Cachemire / كشمير" },
      { id: "Satin", label: "Satin / ساتان" },
      { id: "Élasthanne", label: "Élasthanne (Stretch) / ليكرا مطاطي" },
      { id: "Autre", label: "Autre matière textile" },
    ];
  }

  // 2. Chaussures
  if (sub.includes("chaussure") || subSub.includes("chaussure") || subSub.includes("basket") || subSub.includes("botte")) {
    return [
      { id: "Cuir Véritable", label: "Cuir véritable pleine fleur / جلد طبيعي" },
      { id: "Cuir Suède / Daim", label: "Daim & Nubuck / جلد سويد" },
      { id: "Similicuir", label: "Similicuir résistant / جلد صناعي" },
      { id: "Toile / Canvas", label: "Toile de coton (Canvas) / قماش كانفاس" },
      { id: "Mesh Respirant", label: "Mesh technique respirant / نسيج شبكي" },
      { id: "Caoutchouc", label: "Gomme & Caoutchouc / مطاط" },
      { id: "Autre", label: "Autre matière" },
    ];
  }

  // 3. Artisanat & Tradition Algérienne
  if (cat.includes("artisanat") || cat.includes("tradition") || sub.includes("poterie") || sub.includes("cuivre") || sub.includes("tapis")) {
    return [
      { id: "Argile", label: "Argile (Poterie) / طين فخاري" },
      { id: "Cuivre Rouge", label: "Cuivre rouge martelé / نحاس أحمر" },
      { id: "Cuivre Jaune", label: "Cuivre jaune ciselé / نحاس أصفر" },
      { id: "Céramique", label: "Céramique émaillée / سيراميك تقليدي" },
      { id: "Bois Noble", label: "Bois noble (Cèdre, Noyer, Olivier) / خشب نبيل" },
      { id: "Laine Pure", label: "Laine pure tissée main / صوف خالص منسوج" },
      { id: "Argent Massif", label: "Argent massif 925 / فضة خالصة" },
      { id: "Fil d'Or", label: "Fil d'Or & Mejboud / فتلة ومجبود" },
      { id: "Cuir Tanné", label: "Cuir tanné artisanal / جلد مدبوغ" },
      { id: "Soie Pure", label: "Soie pure / حرير خالص" },
      { id: "Verre Soufflé", label: "Verre soufflé / زجاج يدوي" },
      { id: "Autre", label: "Autre matière artisanale" },
    ];
  }

  // 4. Bijoux & Joaillerie
  if (cat.includes("bijou") || sub.includes("bijou") || subSub.includes("bague") || subSub.includes("collier") || subSub.includes("bracelet")) {
    return [
      { id: "Or 18k", label: "Or 18 Carats (750) / ذهب عيار 18" },
      { id: "Or 24k", label: "Or 24 Carats / ذهب خالص" },
      { id: "Argent 925", label: "Argent Sterling 925 / فضة عيار 925" },
      { id: "Plaqué Or", label: "Plaqué Or / مطلي بالذهب" },
      { id: "Acier Inoxydable", label: "Acier Inoxydable 316L / ستانلس ستيل" },
      { id: "Pierres Précieuses", label: "Pierres précieuses & Zircon / أحجار كريمة وزركون" },
      { id: "Perles Naturelles", label: "Perles d'eau douce / لؤلؤ طبيعي" },
      { id: "Cuir", label: "Cuir véritable / جلد" },
      { id: "Autre", label: "Autre métal précieux" },
    ];
  }

  // 5. Maison, Meubles & Literie
  if (cat.includes("maison") || cat.includes("déco") || sub.includes("mobilier") || sub.includes("salon") || sub.includes("chambre") || sub.includes("literie")) {
    return [
      { id: "Bois Massif", label: "Bois Massif (Chêne, Hêtre, Pin) / خشب صلب" },
      { id: "MDF / Mélaminé", label: "Bois MDF / Bois d'ingénierie / خشب مضغوط" },
      { id: "Métal / Acier", label: "Métal / Acier traité thermolaqué / معدن وفولاذ" },
      { id: "Verre Trempé", label: "Verre Trempé / زجاج مقسى" },
      { id: "Tissu Velours", label: "Tissu Velours anti-tâche / قماش مخملي" },
      { id: "Tissu Lin / Coton", label: "Tissu Lin & Coton / قماش كتان وقطن" },
      { id: "Cuir Véritable", label: "Cuir véritable / جلد طبيعي" },
      { id: "Similicuir", label: "Similicuir / جلد صناعي" },
      { id: "Mousse Haute Résilience", label: "Mousse HR / mémoire de forme / رغوة عالية الكثافة" },
      { id: "Marbre", label: "Marbre naturel ou composite / رخام" },
      { id: "Bambou / Rotin", label: "Bambou & Rotin naturel / خيزران وقصب" },
      { id: "Autre", label: "Autre matériau d'ameublement" },
    ];
  }

  // 6. High-Tech & Électronique & Électroménager
  if (cat.includes("électronique") || cat.includes("électroménager") || cat.includes("informatique") || cat.includes("téléphonie")) {
    return [
      { id: "Aluminium", label: "Aluminium anodisé / ألومنيوم مؤكسد" },
      { id: "Inox", label: "Acier Inoxydable (Inox brossé) / ستانلس ستيل" },
      { id: "Plastique ABS", label: "Plastique ABS renforcé / بلاستيك مقوى" },
      { id: "Verre Trempé", label: "Verre trempé (Gorilla Glass) / زجاج مقسى" },
      { id: "Silicone", label: "Silicone médical / سيليكون" },
      { id: "Cuivre", label: "Cuivre (Moteur / Bobinage) / نحاس" },
      { id: "Fibre de Carbone", label: "Fibre de carbone / ألياف الكربون" },
      { id: "Autre", label: "Autre composant" },
    ];
  }

  // 7. Auto & Moto
  if (cat.includes("auto") || cat.includes("moto")) {
    return [
      { id: "Acier Forgé", label: "Acier forgé / Alliage mécanique / فولاذ مقوى" },
      { id: "Aluminium", label: "Alliage d'aluminium léger / ألومنيوم" },
      { id: "Caoutchouc Synthétique", label: "Caoutchouc synthétique haute résistance / مطاط مقوى" },
      { id: "Fibre de Carbone", label: "Fibre de carbone / ألياف كربونية" },
      { id: "Céramique", label: "Plaquettes de frein céramique / سيراميك" },
      { id: "Plastique Polycarbonate", label: "Polycarbonate haute densité / بولي كربونات" },
      { id: "Autre", label: "Autre matériau automobile" },
    ];
  }

  // 8. Bricolage & Outillage
  if (cat.includes("bricolage") || sub.includes("outil")) {
    return [
      { id: "Acier Chrome Vanadium", label: "Acier Chrome-Vanadium (Cr-V) / فولاذ كروم فاناديوم" },
      { id: "Fonte", label: "Fonte aciérée / حديد زهر" },
      { id: "Aluminium", label: "Aluminium extrudé / ألومنيوم" },
      { id: "Laiton", label: "Laiton massif (Plomberie) / نحاس أصفر" },
      { id: "Cuivre", label: "Cuivre recuit / نحاس أحمر" },
      { id: "Plastique Bi-matière", label: "Plastique ergonomique soft-grip / مقبض مطاطي" },
      { id: "Autre", label: "Autre matériau d'outillage" },
    ];
  }

  // Par défaut : palette standard
  return [
    { id: "Coton", label: "Coton / قطن" },
    { id: "Cuir", label: "Cuir / جلد" },
    { id: "Bois", label: "Bois / خشب" },
    { id: "Métal", label: "Métal / معدن" },
    { id: "Plastique", label: "Plastique / بلاستيك" },
    { id: "Verre", label: "Verre / زجاج" },
    { id: "Céramique", label: "Céramique / سيراميك" },
    { id: "Inox", label: "Inox / إينوكس" },
    { id: "Autre", label: "Autre matière" },
  ];
}
