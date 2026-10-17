import { AttributeGroup } from "./types";

export function getCraftGroceryOfficeAttributeGroups(
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

  // 1. Artisanat & Patrimoine Algérien
  const isCraft =
    cat.includes("artisanat") ||
    cat.includes("tradition") ||
    sub.includes("traditionnel") ||
    subSub.includes("karakou") ||
    subSub.includes("caftan") ||
    subSub.includes("chedda") ||
    subSub.includes("burnous") ||
    subSub.includes("poterie") ||
    subSub.includes("cuivre") ||
    name.includes("karakou") ||
    name.includes("caftan") ||
    name.includes("burnous") ||
    name.includes("chedda");

  if (isCraft) {
    groups.push({
      id: "craft_specs",
      title: "Caractéristiques Spécifiques : Artisanat & Terroir Algérien",
      iconName: "Crown",
      description: "Origine régionale, broderie traditionnelle et pièces incluses",
      attributes: [
        {
          id: "craft_origin",
          label: "Région d'Artisanat / Wilaya *",
          type: "select",
          options: ["Alger (Karakou / Broderie algéroise)", "Tlemcen (Chedda / Blousa traditionnelle)", "Kabylie / Tizi Ouzou (Bijoux argent & Poterie)", "Constantine (Gandoura brodée au fil d'or)", "Ghardaïa / M'zab (Tapis pure laine & Tissages)", "Aurès / Chaouia (Bijoux & Tenues berbères)", "Oran (Blousa oranaise)", "Sahara / Grand Sud"],
        },
        {
          id: "craft_embroidery",
          label: "Technique Artisanale & Broderie",
          type: "select",
          options: ["Broderie Fatla & Mejboud au fil d'or", "Tarz el gherza traditionnel fait main", "Filigrane et émaux aux 3 couleurs (Kabyle)", "Cuivre rouge martelé et ciselé au burin", "Tissage berbère noué main à haute laine", "Poterie modelée main séchée au soleil"],
        },
        {
          id: "craft_handmade",
          label: "Fabrication 100% Artisanale Fait Main",
          type: "radio",
          options: ["100% Fait main par un maître artisan", "Semi-artisanal en atelier traditionnel"],
        },
      ],
    });
    return groups;
  }

  // 2. Bricolage & Outillage Électroportatif
  const isTools =
    cat.includes("bricolage") ||
    sub.includes("outillage") ||
    subSub.includes("perceuse") ||
    subSub.includes("meuleuse") ||
    subSub.includes("visseuse") ||
    name.includes("perceuse") ||
    name.includes("visseuse") ||
    name.includes("meuleuse");

  if (isTools) {
    groups.push({
      id: "tool_specs",
      title: "Caractéristiques Spécifiques : Bricolage & Outillage",
      iconName: "Wrench",
      description: "Alimentation électrique, puissance et accessoires",
      attributes: [
        {
          id: "tool_power_type",
          label: "Alimentation",
          type: "select",
          options: ["Sans fil sur batterie Lithium-Ion (18V - 20V Max)", "Sans fil compact 12V", "Filaire 220V - 240V puissant", "Pneumatique / Air comprimé"],
        },
        {
          id: "tool_motor",
          label: "Moteur Brushless (Sans charbon)",
          type: "radio",
          options: ["Oui (Moteur Brushless haute durée de vie)", "Moteur standard à charbons"],
        },
        {
          id: "tool_kit",
          label: "Coffret & Batteries fournies",
          type: "select",
          options: ["Machine nue sans batterie (Solo)", "Pack complet : 2 batteries + chargeur + mallette", "Pack avec 1 batterie et chargeur", "Coffret avec jeu complet d'embouts & mèches"],
        },
      ],
    });
    return groups;
  }

  // 3. Supermarché & Épicerie Algérienne
  const isGrocery =
    cat.includes("supermarché") ||
    cat.includes("supermarche") ||
    sub.includes("épicerie") ||
    sub.includes("alimentation") ||
    subSub.includes("datte") ||
    subSub.includes("huile") ||
    subSub.includes("café") ||
    name.includes("datte") ||
    name.includes("deglet nour") ||
    name.includes("huile d'olive");

  if (isGrocery) {
    groups.push({
      id: "grocery_specs",
      title: "Caractéristiques Spécifiques : Supermarché & Produits Alimentaires",
      iconName: "ShoppingBag",
      description: "Poids net, provenance terroir et conservation",
      attributes: [
        {
          id: "grocery_weight",
          label: "Poids Net / Volume unitaire *",
          type: "text",
          placeholder: "Ex: 1 kg, 500 g, 5 Litres (Bidon huile)",
        },
        {
          id: "grocery_origin",
          label: "Origine du Produit",
          type: "select",
          options: ["Produit d'Algérie (Terroir national)", "Dattes Deglet Nour de Biskra / Tolga", "Huile d'olive vierge de Kabylie", "Produit importé certifié"],
        },
        {
          id: "grocery_storage",
          label: "Conservation",
          type: "select",
          options: ["À conserver dans un endroit sec et frais à l'abri de la lumière", "Au réfrigérateur entre +2°C et +6°C", "Température ambiante"],
        },
      ],
    });
    return groups;
  }

  // 4. Scolaire, Papeterie & Bureau
  const isSchoolOffice =
    cat.includes("scolaire") ||
    cat.includes("bureau") ||
    sub.includes("scolaire") ||
    sub.includes("papeterie") ||
    subSub.includes("cahier") ||
    name.includes("cahier") ||
    name.includes("registre");

  if (isSchoolOffice) {
    groups.push({
      id: "school_specs",
      title: "Caractéristiques Spécifiques : Cahiers & Papeterie",
      iconName: "BookOpen",
      description: "Format papier, nombre de pages et réglure",
      attributes: [
        {
          id: "paper_format",
          label: "Format du Cahier / Papier",
          type: "select",
          options: ["Grand Format 24 x 32 cm (Standard scolaire)", "Format A4 (21 x 29.7 cm)", "Petit Format A5 (17 x 22 cm)", "Registre grand livre comptable"],
        },
        {
          id: "paper_pages",
          label: "Nombre de Pages",
          type: "select",
          options: ["48 pages", "64 pages", "96 pages", "120 pages", "192 pages", "288 pages"],
        },
        {
          id: "paper_ruling",
          label: "Réglure des Feuilles",
          type: "select",
          options: ["Séyès (Grands carreaux standard)", "Petits carreaux (Quadrillé 5x5)", "Ligné simple", "Feuilles blanches unies"],
        },
      ],
    });
    return groups;
  }

  // 5. Jeux & Jouets
  const isToy =
    cat.includes("jouet") ||
    cat.includes("jeux") ||
    sub.includes("jouet") ||
    sub.includes("société") ||
    name.includes("jouet") ||
    name.includes("puzzle") ||
    name.includes("lego");

  if (isToy) {
    groups.push({
      id: "toy_specs",
      title: "Caractéristiques Spécifiques : Jeux & Jouets",
      iconName: "Smile",
      description: "Tranche d'âge, nombre de joueurs et sécurité",
      attributes: [
        {
          id: "toy_age",
          label: "Âge Recommandé *",
          type: "select",
          options: ["0 à 18 mois (Éveil bébé)", "2 à 4 ans", "5 à 7 ans", "8 à 12 ans", "12 ans et + / Famille"],
        },
        {
          id: "toy_players",
          label: "Nombre de Joueurs",
          type: "select",
          options: ["Solo (1 joueur)", "2 joueurs", "2 à 4 joueurs", "4 à 8 joueurs (Jeux d'ambiance)"],
        },
      ],
    });
    return groups;
  }

  return groups;
}
