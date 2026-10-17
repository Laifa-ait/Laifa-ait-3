import { AttributeGroup } from "./types";

export function getSportBabyAttributeGroups(
  category: string,
  subcategory: string,
  subSubCategory: string,
  productName: string
): AttributeGroup[] {
  const cat = category.toLowerCase();
  const sub = subcategory.toLowerCase();
  const subSub = subSubCategory.toLowerCase();
  const name = productName.toLowerCase();
  const groups: AttributeGroup[] = [];

  // 1. Fitness, Musculation & Sports
  const isFitness =
    cat.includes("sport") ||
    sub.includes("fitness") ||
    sub.includes("musculation") ||
    subSub.includes("haltère") ||
    subSub.includes("vélo") ||
    subSub.includes("tapis") ||
    name.includes("haltère") ||
    name.includes("tapis de course") ||
    name.includes("vélo d'appartement");

  if (isFitness) {
    groups.push({
      id: "sport_specs",
      title: "Caractéristiques Spécifiques : Sport & Fitness",
      iconName: "Activity",
      description: "Charge, poids, résistance et pliabilité",
      attributes: [
        {
          id: "sport_weight_capacity",
          label: "Poids / Charge maximale supportée",
          type: "text",
          placeholder: "Ex: Charge max 120 kg, Haltère 10 kg",
        },
        {
          id: "sport_resistance",
          label: "Type de résistance / Niveaux",
          type: "select",
          options: ["Magnétique silencieuse motorisée (8 à 16 niveaux)", "Poids libres en fonte / caoutchouc", "Élastique à tension progressive", "Résistance manuelle par friction"],
        },
        {
          id: "sport_foldable",
          label: "Pliable & Gain de place",
          type: "radio",
          options: ["Oui pliable avec roulettes de déplacement", "Fixe non pliable"],
        },
      ],
    });
    return groups;
  }

  // 2. Bébé : Poussettes & Sièges Auto
  const isStrollerOrCarSeat =
    sub.includes("poussette") ||
    sub.includes("siège auto") ||
    subSub.includes("poussette") ||
    subSub.includes("siège auto") ||
    name.includes("poussette") ||
    name.includes("siège auto") ||
    name.includes("cosy");

  if (isStrollerOrCarSeat) {
    groups.push({
      id: "baby_travel_specs",
      title: "Caractéristiques Spécifiques : Poussettes & Sièges Auto",
      iconName: "Baby",
      description: "Groupe d'âge/poids, fixation sécurité Isofix et pliage",
      attributes: [
        {
          id: "baby_gear_type",
          label: "Type de Matériel de Voyage",
          type: "select",
          options: ["Poussette canne ultra-compacte (Cabine avion)", "Poussette combinée Trio (Châssis + Nacelle + Siège auto Cosy)", "Poussette 3 roues tout-terrain", "Siège auto pivotant 360° Isofix", "Rehausseur avec dossier"],
        },
        {
          id: "baby_age_group",
          label: "Groupe & Poids de l'enfant",
          type: "select",
          options: ["Dès la naissance (0 à 13 kg / Cosy groupe 0+)", "Groupe 0+/1 (0 à 18 kg / 0 à 4 ans)", "Groupe 1/2/3 évolutif (9 à 36 kg / 9 mois à 12 ans)", "Homologation i-Size R129 (40 à 150 cm)"],
        },
        {
          id: "baby_isofix",
          label: "Fixation en voiture",
          type: "radio",
          options: ["Système ISOFIX avec jambe de force / Top Tether", "Fixation par ceinture de sécurité du véhicule", "Double fixation Isofix ou ceinture"],
        },
      ],
    });
    return groups;
  }

  // 3. Bébé : Chambre, Hygiène & Alimentation
  const isBabyLiving =
    cat.includes("bébé") ||
    sub.includes("couche") ||
    sub.includes("alimentation bébé") ||
    sub.includes("chambre bébé") ||
    subSub.includes("biberon") ||
    subSub.includes("lit") ||
    name.includes("biberon") ||
    name.includes("gigoteuse") ||
    name.includes("lit bébé");

  if (isBabyLiving) {
    groups.push({
      id: "baby_living_specs",
      title: "Caractéristiques Spécifiques : Puériculture & Bébé",
      description: "Sécurité bébé, âge et contenance",
      attributes: [
        {
          id: "baby_age_rec",
          label: "Âge Recommandé",
          type: "select",
          options: ["0 à 6 mois (Nouveau-né)", "6 à 12 mois", "12 à 24 mois", "2 à 4 ans"],
        },
        {
          id: "baby_safety",
          label: "Matériaux & Sécurité",
          type: "multiselect",
          options: ["0% Bisphénol A (Sans BPA)", "Tétine en silicone médical anti-colique", "Barrières de lit sécurisées aux normes", "Hypoallergénique certifié"],
        },
        {
          id: "baby_capacity",
          label: "Contenance / Dimensions",
          type: "text",
          placeholder: "Ex: 240 ml (Biberon), Lit 60x120 cm",
        },
      ],
    });
    return groups;
  }

  return groups;
}
