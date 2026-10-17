import { AttributeGroup } from "./types";

export function getBeautyHealthAttributeGroups(
  _category: string,
  subcategory: string,
  subSubCategory: string,
  productName: string
): AttributeGroup[] {
  const sub = subcategory.toLowerCase();
  const subSub = subSubCategory.toLowerCase();
  const name = productName.toLowerCase();
  const groups: AttributeGroup[] = [];

  // 1. Parfumerie & Fragrances
  const isPerfume = sub.includes("parfum") || subSub.includes("parfum") || subSub.includes("eau de") || name.includes("parfum") || name.includes("eau de parfum") || name.includes("eau de toilette");
  if (isPerfume) {
    groups.push({
      id: "perfume_specs",
      title: "Caractéristiques Spécifiques : Parfumerie",
      iconName: "Sparkles",
      description: "Concentration, volume et famille olfactive",
      attributes: [
        {
          id: "perfume_type",
          label: "Concentration du Parfum",
          type: "select",
          options: ["Extrait de Parfum (Haute tenue)", "Eau de Parfum (EDP)", "Eau de Toilette (EDT)", "Eau de Cologne / Fraîche", "Huile parfumée / Musc pur (Sans alcool)"],
        },
        {
          id: "perfume_volume",
          label: "Volume du flacon (ml)",
          type: "select",
          options: ["30 ml", "50 ml", "75 ml", "100 ml", "125 ml", "200 ml"],
        },
        {
          id: "fragrance_family",
          label: "Famille Olfactive *",
          type: "select",
          options: [
            "Boisé & Ambré (Oud noble, Cèdre, Santal)",
            "Oriental & Épicé (Vanille, Musc, Ambre gris)",
            "Floral & Poudré (Rose, Jasmin, Fleur d'oranger)",
            "Frais & Hespéridé (Bergamote, Citron, Mandarine)",
            "Aromatique & Fougère (Lavande, Sauge, Menthe)",
            "Gourmand & Sucré (Caramel, Fève Tonka, Chocolat)",
          ],
        },
        {
          id: "perfume_gender",
          label: "Pour qui ?",
          type: "radio",
          options: ["Homme", "Femme", "Unisexe"],
        },
      ],
    });
    return groups;
  }

  // 2. Soins du Visage, Corps & Solaire
  const isSkincare = sub.includes("visage") || sub.includes("soin") || subSub.includes("crème") || subSub.includes("sérum") || subSub.includes("nettoyant") || name.includes("crème") || name.includes("sérum");
  if (isSkincare) {
    groups.push({
      id: "skincare_specs",
      title: "Caractéristiques Spécifiques : Soin & Cosmétique",
      description: "Type de peau, bénéfices et contenance",
      attributes: [
        {
          id: "skin_type",
          label: "Type de peau ciblé",
          type: "select",
          options: ["Tous types de peaux", "Peau normale à mixte", "Peau grasse à tendance acnéique", "Peau sèche à très sèche (Hydratation intense)", "Peau sensible & réactive"],
        },
        {
          id: "skin_benefit",
          label: "Bénéfice principal",
          type: "select",
          options: ["Anti-âge / Rides & Fermeté", "Hydratation 24h & Nutrition", "Éclat & Anti-taches pigmentaires", "Purifiant & Anti-imperfections", "Apaisant & Réparateur", "Protection solaire SPF 50+"],
        },
        {
          id: "skin_volume",
          label: "Contenance (ml ou g)",
          type: "text",
          placeholder: "Ex: 30 ml (Sérum), 50 ml (Crème)",
        },
      ],
    });
    return groups;
  }

  // 3. Maquillage & Teint
  const isMakeup = sub.includes("maquillage") || subSub.includes("rouge à lèvres") || subSub.includes("fond de teint") || subSub.includes("mascara") || name.includes("fond de teint") || name.includes("rouge à lèvres");
  if (isMakeup) {
    groups.push({
      id: "makeup_specs",
      title: "Caractéristiques Spécifiques : Maquillage",
      description: "Finition, couvrance et tenue",
      attributes: [
        {
          id: "makeup_finish",
          label: "Fini / Rendu",
          type: "select",
          options: ["Mat velouté longue tenue", "Lumineux / Glow naturel", "Satiné hydratant", "Brillant / Gloss", "Pailleté / Métallique"],
        },
        {
          id: "makeup_coverage",
          label: "Niveau de Couvrance",
          type: "radio",
          options: ["Légère & Naturelle", "Moyenne modulable", "Haute couvrance totale"],
        },
        {
          id: "makeup_waterproof",
          label: "Résistance à l'eau",
          type: "radio",
          options: ["Waterproof résistant à l'eau & transpiration", "Formule standard"],
        },
      ],
    });
    return groups;
  }

  return groups;
}
