import { AttributeGroup } from "./types";

export function getHomeLivingAttributeGroups(
  _category: string,
  subcategory: string,
  subSubCategory: string,
  productName: string
): AttributeGroup[] {
  const sub = subcategory.toLowerCase();
  const subSub = subSubCategory.toLowerCase();
  const name = productName.toLowerCase();
  const groups: AttributeGroup[] = [];

  // 1. Mobilier Salon, Canapés & Fauteuils
  const isLivingFurniture =
    sub.includes("mobilier de salon") ||
    subSub.includes("canapé") ||
    subSub.includes("fauteuil") ||
    subSub.includes("table basse") ||
    subSub.includes("meuble tv") ||
    name.includes("canapé") ||
    name.includes("fauteuil") ||
    name.includes("table basse");

  if (isLivingFurniture) {
    groups.push({
      id: "living_furniture_specs",
      title: "Caractéristiques Spécifiques : Canapés & Mobilier Salon",
      description: "Nombre de places, dimensions et modularité",
      attributes: [
        {
          id: "sofa_seats",
          label: "Nombre de Places assises",
          type: "select",
          options: ["Fauteuil 1 place", "Canapé 2 places", "Canapé 3 places", "Canapé d'angle réversible (4-5 places)", "Grand canapé d'angle en U (6-8 places)", "Table basse / Meuble TV"],
        },
        {
          id: "sofa_convertible",
          label: "Convertible / Couchage d'appoint",
          type: "radio",
          options: ["Oui avec coffre de rangement", "Oui convertible simple (Clic-clac / BZ)", "Fixe non convertible"],
        },
        {
          id: "furniture_dimensions",
          label: "Dimensions (L x P x H en cm)",
          type: "text",
          placeholder: "Ex: 220 x 95 x 85 cm",
        },
        {
          id: "sofa_cushions",
          label: "Assise & Déhoussable",
          type: "select",
          options: ["Coussins déhoussables lavables", "Assise fixe capitonnée", "Mousse haute densité 30-35 kg/m³"],
        },
      ],
    });
    return groups;
  }

  // 2. Literie, Lits & Matelas
  const isBedding =
    sub.includes("chambre") ||
    sub.includes("lit") ||
    subSub.includes("matelas") ||
    subSub.includes("lit") ||
    name.includes("matelas") ||
    name.includes("lit double") ||
    name.includes("sommier");

  if (isBedding) {
    groups.push({
      id: "bedding_specs",
      title: "Caractéristiques Spécifiques : Literie & Matelas",
      description: "Dimensions de couchage, technologie et fermeté",
      attributes: [
        {
          id: "bed_size",
          label: "Dimensions du Couchage *",
          type: "select",
          options: ["90 x 190 cm (1 place standard)", "120 x 190 cm (1 place et demi)", "140 x 190 cm (2 places standard)", "160 x 200 cm (Queen Size grand confort)", "180 x 200 cm (King Size)", "200 x 200 cm (Super King Size)"],
        },
        {
          id: "mattress_tech",
          label: "Technologie du Matelas",
          type: "select",
          options: ["Ressorts ensachés indépendants (Aération maximale)", "Mousse à mémoire de forme thermosensible", "Mousse haute densité orthopédique", "Latex naturel hypoallergénique", "Hybride (Ressorts + Mousse mémoire)"],
        },
        {
          id: "mattress_firmness",
          label: "Soutien & Fermeté",
          type: "radio",
          options: ["Très ferme (Orthopédique dos)", "Ferme équilibré", "Moelleux enveloppant"],
        },
        {
          id: "mattress_thickness",
          label: "Épaisseur du matelas (cm)",
          type: "text",
          placeholder: "Ex: 24 cm, 28 cm, 30 cm",
        },
      ],
    });
    return groups;
  }

  // 3. Luminaires & Éclairage
  const isLighting = sub.includes("luminaire") || sub.includes("éclairage") || subSub.includes("lampe") || subSub.includes("lustre") || subSub.includes("suspension") || subSub.includes("ampoule") || name.includes("lustre") || name.includes("lampe");
  if (isLighting) {
    groups.push({
      id: "lighting_specs",
      title: "Caractéristiques Spécifiques : Luminaires & Ampoules",
      description: "Type de culot, température d'éclairage et puissance",
      attributes: [
        {
          id: "light_socket",
          label: "Type de Culot / Source",
          type: "select",
          options: ["Culot E27 (Gros pas de vis)", "Culot E14 (Petit pas de vis)", "Culot GU10 (Spots)", "LED intégrée sans ampoule à changer", "Solaire avec détecteur crépusculaire"],
        },
        {
          id: "light_color",
          label: "Température de couleur (Kelvins)",
          type: "select",
          options: ["Blanc Chaud 2700K-3000K (Chaleureux & Doux)", "Blanc Neutre 4000K (Lumière du jour naturelle)", "Blanc Froid 6500K (Très lumineux / Travail)", "RGB multicolore télécommandé"],
        },
        {
          id: "light_lumens",
          label: "Flux lumineux (Lumens ou Watts)",
          type: "text",
          placeholder: "Ex: 800 Lumens (équivalent 60W)",
        },
      ],
    });
    return groups;
  }

  // 4. Cuisine & Arts de la Table
  const isTableware = sub.includes("arts de la table") || sub.includes("ustensile") || subSub.includes("casserole") || subSub.includes("poêle") || subSub.includes("vaisselle") || name.includes("casserole") || name.includes("poêle") || name.includes("assiette");
  if (isTableware) {
    groups.push({
      id: "tableware_specs",
      title: "Caractéristiques Spécifiques : Cuisine & Casserolerie",
      description: "Compatibilité feux, revêtement et nombre de pièces",
      attributes: [
        {
          id: "cookware_compatibility",
          label: "Compatibilité des feux",
          type: "select",
          options: ["Tous feux dont INDUCTION", "Gaz, électrique et vitrocéramique (Hors induction)", "Compatible Four traditionnel jusqu'à 220°C"],
        },
        {
          id: "cookware_coating",
          label: "Revêtement antiadhésif",
          type: "select",
          options: ["Granit anti-rayures sans PFOA", "Inox 18/10 poli miroir haute durabilité", "Fonte émaillée traditionnelle", "Céramique antiadhésive sans produits chimiques"],
        },
        {
          id: "cookware_pieces",
          label: "Nombre d'éléments / pièces inclus",
          type: "text",
          placeholder: "Ex: Set de 10 pièces, Service 18 assiettes",
        },
      ],
    });
    return groups;
  }

  return groups;
}
