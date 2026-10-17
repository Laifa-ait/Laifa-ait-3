import { AttributeGroup } from "./types";

export function getFashionAttributeGroups(
  category: string,
  subcategory: string,
  subSubCategory: string,
  productName: string
): AttributeGroup[] {
  const sub = subcategory.toLowerCase();
  const subSub = subSubCategory.toLowerCase();
  const name = productName.toLowerCase();
  const groups: AttributeGroup[] = [];

  // 1. Vestes, Manteaux, Blousons & Doudounes
  const isJacket =
    subSub.includes("veste") ||
    subSub.includes("manteau") ||
    subSub.includes("blouson") ||
    subSub.includes("doudoune") ||
    subSub.includes("blazer") ||
    subSub.includes("parka") ||
    subSub.includes("trench") ||
    subSub.includes("bomber") ||
    sub.includes("veste") ||
    sub.includes("manteau") ||
    name.includes("veste") ||
    name.includes("manteau") ||
    name.includes("blouson") ||
    name.includes("doudoune") ||
    name.includes("parka") ||
    name.includes("trench") ||
    name.includes("bomber");

  if (isJacket) {
    groups.push({
      id: "jacket_specs",
      title: "Caractéristiques Spécifiques : Veste, Manteau & Blouson",
      iconName: "Shirt",
      description: "Attributs dédiés à la coupe, fermeture, doublure et style de la veste",
      attributes: [
        {
          id: "jacket_type",
          label: "Type de Veste / Manteau *",
          type: "select",
          options: [
            { value: "Veste en cuir / Perfecto", label: "Veste en cuir / Perfecto (جاكيت جلد)" },
            { value: "Veste en jean (Denim)", label: "Veste en jean / Denim (جاكيت جينز)" },
            { value: "Blouson & Bomber", label: "Blouson aviateur / Bomber (بومبر)" },
            { value: "Doudoune matelassée", label: "Doudoune matelassée (سترة منتفخة)" },
            { value: "Parka d'hiver", label: "Parka d'hiver (باركا شتوية)" },
            { value: "Blazer & Veston habillé", label: "Blazer & Veston habillé (بليزر كلاسيكي)" },
            { value: "Coupe-vent & K-way", label: "Coupe-vent imperméable (سترة واقية من الرياح)" },
            { value: "Trench-coat", label: "Trench-coat long (معطف ترنش)" },
            { value: "Manteau long en laine", label: "Manteau long en laine (معطف صوف طويل)" },
            { value: "Veste polaire / Sherpa", label: "Veste polaire / Sherpa (سترة صوفية ناعمة)" },
            { value: "Gilet sans manches", label: "Gilet sans manches (سترة بدون أكمام)" },
            { value: "Autre veste", label: "Autre modèle de veste" },
          ],
        },
        {
          id: "jacket_fit",
          label: "Coupe de la Veste",
          type: "radio",
          options: ["Droite (Regular)", "Ajustée (Slim fit)", "Ample (Oversize)", "Cintrée", "Courte (Cropped)", "Longue"],
        },
        {
          id: "jacket_closure",
          label: "Système de Fermeture",
          type: "select",
          options: [
            "Fermeture éclair (Zip)",
            "Boutonnage simple classique",
            "Double boutonnage (Croisé)",
            "Boutons-pression",
            "Double fermeture (Zip + Boutons)",
            "Ceinture à nouer (Style trench)",
            "Ouvert sans fermeture",
          ],
        },
        {
          id: "jacket_hood",
          label: "Capuche",
          type: "radio",
          options: ["Sans capuche", "À capuche fixe", "À capuche amovible (détachable)", "Capuche avec fausse fourrure"],
        },
        {
          id: "jacket_lining",
          label: "Doublure & Épaisseur thermique",
          type: "select",
          options: [
            "Légère et fine (Mi-saison & Printemps)",
            "Matelassée thermique (Chaleur moyenne)",
            "Doublée polaire ou sherpa (Chaud pour hiver)",
            "Garnissage duvet & plumes (Grand froid)",
            "Sans doublure (Non doublée)",
          ],
        },
        {
          id: "jacket_collar",
          label: "Style de Col",
          type: "select",
          options: [
            "Col montant protecteur",
            "Col tailleur cranté classique",
            "Col motard / Col officier",
            "Col chemise rabattu",
            "Col montant avec capuche intégrée",
            "Col rond classique",
          ],
        },
        {
          id: "jacket_features",
          label: "Fonctionnalités & Traitements",
          type: "multiselect",
          options: [
            "Imperméable / Déperlant à l'eau",
            "Coupe-vent certifié",
            "Tissu respirant",
            "Poche intérieure portefeuille",
            "Poches extérieures zippées sécurisées",
            "Poignets côtelés élastiques anti-froid",
            "Modèle réversible (2 en 1)",
          ],
        },
      ],
    });
    return groups;
  }

  // 2. Robes & Jupes
  const isDress = subSub.includes("robe") || subSub.includes("jupe") || sub.includes("robe") || sub.includes("jupe") || name.includes("robe") || name.includes("jupe");
  if (isDress) {
    groups.push({
      id: "dress_specs",
      title: "Caractéristiques Spécifiques : Robes & Jupes",
      description: "Longueur, coupe, manches et style",
      attributes: [
        { id: "dress_length", label: "Longueur", type: "radio", options: ["Courte (Mini)", "Midi (Au genou)", "Longue (Maxi)", "Asymétrique"] },
        { id: "dress_cut", label: "Coupe", type: "select", options: ["Évasée / Trapèze", "Droite", "Cintrée / Moulante", "Sirène", "Plissée", "Portefeuille"] },
        { id: "dress_sleeves", label: "Manches", type: "select", options: ["Sans manches", "Manches courtes", "Manches 3/4", "Manches longues", "Manches bouffantes"] },
        { id: "dress_occasion", label: "Occasion d'usage", type: "select", options: ["Quotidien / Décontracté", "Soirée & Cérémonie", "Mariage / Fête", "Professionnel / Bureau"] },
      ],
    });
    return groups;
  }

  // 3. Pantalons, Jeans & Cargos
  const isPants = subSub.includes("pantalon") || subSub.includes("jean") || subSub.includes("cargo") || subSub.includes("chino") || sub.includes("pantalon") || sub.includes("jean") || name.includes("pantalon") || name.includes("jean");
  if (isPants) {
    groups.push({
      id: "pants_specs",
      title: "Caractéristiques Spécifiques : Pantalons & Jeans",
      description: "Coupe de jambe, taille et élasticité",
      attributes: [
        { id: "pants_cut", label: "Coupe de jambe", type: "select", options: ["Slim fit (Ajustée)", "Droite classique (Regular)", "Skinny (Très ajustée)", "Cargo (Multi-poches)", "Jambe large (Wide leg / Palazzo)", "Évasé (Bootcut / Flare)", "Jogger (Cheville élastiquée)"] },
        { id: "pants_waist", label: "Hauteur de taille", type: "radio", options: ["Taille haute", "Taille standard (Moyenne)", "Taille basse"] },
        { id: "pants_stretch", label: "Élasticité", type: "radio", options: ["Non-stretch (100% Coton)", "Confort stretch", "Super stretch"] },
      ],
    });
    return groups;
  }

  // 4. Chemises, Polos, T-shirts & Sweats
  const isTop = subSub.includes("chemise") || subSub.includes("t-shirt") || subSub.includes("polo") || subSub.includes("pull") || subSub.includes("sweat") || name.includes("chemise") || name.includes("t-shirt") || name.includes("polo") || name.includes("sweat") || name.includes("pull");
  if (isTop) {
    groups.push({
      id: "top_specs",
      title: "Caractéristiques Spécifiques : Chemises, T-shirts & Hauts",
      description: "Col, coupe, longueur de manches et style",
      attributes: [
        { id: "top_collar", label: "Type de Col", type: "select", options: ["Col français classique", "Col italien / Évasé", "Col Mao / Officier", "Col Polo", "Col rond classique", "Col V", "Col roulé / Montant", "Capuche (Hoodie)"] },
        { id: "top_cut", label: "Coupe", type: "radio", options: ["Regular (Droite)", "Slim fit (Cintrée)", "Oversize (Ample)", "Muscle fit"] },
        { id: "top_sleeves", label: "Manches", type: "radio", options: ["Manches courtes", "Manches longues", "Sans manches"] },
        { id: "top_pattern", label: "Motif / Imprimé", type: "select", options: ["Uni", "Rayures", "Carreaux", "Imprimé graphique / Logo", "Brodé"] },
      ],
    });
    return groups;
  }

  // 5. Costumes & Tailleurs
  const isSuit = subSub.includes("costume") || subSub.includes("smoking") || subSub.includes("tailleur") || name.includes("costume") || name.includes("smoking");
  if (isSuit) {
    groups.push({
      id: "suit_specs",
      title: "Caractéristiques Spécifiques : Costumes & Tailleurs",
      description: "Coupe veston, nombre de pièces et fentes",
      attributes: [
        { id: "suit_pieces", label: "Composition", type: "select", options: ["Costume 2 pièces (Veste + Pantalon)", "Costume 3 pièces (Veste + Pantalon + Gilet)", "Veston seul", "Ensemble tailleur femme"] },
        { id: "suit_drop", label: "Coupe veste & drop", type: "select", options: ["Drop 6 (Standard regular)", "Drop 7 / 8 (Slim fit ajusté)", "Coupe confort large"] },
        { id: "suit_vents", label: "Fentes dos", type: "radio", options: ["Double fente latérale (Italien)", "Fente simple centrale", "Sans fente"] },
      ],
    });
    return groups;
  }

  // 6. Chaussures & Baskets
  const isShoe = subSub.includes("chaussure") || subSub.includes("basket") || subSub.includes("sneaker") || subSub.includes("botte") || subSub.includes("escarpin") || subSub.includes("mocassin") || subSub.includes("sandale") || sub.includes("chaussure") || name.includes("chaussure") || name.includes("basket") || name.includes("sneaker");
  if (isShoe) {
    groups.push({
      id: "shoes_specs",
      title: "Caractéristiques Spécifiques : Chaussures & Baskets",
      description: "Type, tige, semelle et fermeture",
      attributes: [
        { id: "shoe_type", label: "Type de Chaussure", type: "select", options: ["Baskets basses (Sneakers)", "Baskets montantes (High top)", "Chaussures de ville (Richelieus/Derbies)", "Mocassins & Bateau", "Bottes & Bottines", "Escarpins & Talons", "Sandales & Mules", "Chaussures de running"] },
        { id: "shoe_closure", label: "Fermeture", type: "radio", options: ["Lacets", "Scratch / Velcro", "Sans lacets (Slip-on)", "Fermeture éclair (Zip)", "Boucle"] },
        { id: "shoe_sole", label: "Type de Semelle", type: "select", options: ["Caoutchouc antidérapant", "Gomme souple", "Cuir véritable", "Semelle plateforme", "Coussin d'air amortissant"] },
        { id: "heel_height", label: "Hauteur du talon", type: "select", options: ["Plat (< 2 cm)", "Bas (2 - 4 cm)", "Moyen (5 - 7 cm)", "Haut (> 8 cm)"] },
      ],
    });
    return groups;
  }

  // 7. Sacs & Maroquinerie
  const isBag = subSub.includes("sac") || subSub.includes("valise") || subSub.includes("portefeuille") || sub.includes("sac") || sub.includes("bagagerie") || name.includes("sac") || name.includes("valise");
  if (isBag) {
    groups.push({
      id: "bag_specs",
      title: "Caractéristiques Spécifiques : Sacs & Maroquinerie",
      description: "Format, compartiments et poignées",
      attributes: [
        { id: "bag_type", label: "Type de Bagage / Sac", type: "select", options: ["Sac à main cabas", "Sac bandoulière", "Sac à dos ville / PC", "Sacoche banane", "Pochette de soirée", "Valise cabine", "Valise soute grand format", "Sac de voyage weekend"] },
        { id: "bag_compartments", label: "Poches & Compartiments", type: "select", options: ["1 compartiment simple", "2 compartiments séparés", "Multi-poches intérieures et extérieures", "Compartiment spécial PC portable matelassé"] },
        { id: "bag_strap", label: "Bandoulière", type: "radio", options: ["Avec bandoulière amovible et réglable", "Bandoulière fixe", "Poignées courtes uniquement", "Bretelles sac à dos"] },
      ],
    });
    return groups;
  }

  return groups;
}
