import { AttributeGroup } from "./types";

export function getApplianceAttributeGroups(
  category: string,
  subcategory: string,
  subSubCategory: string,
  productName: string
): AttributeGroup[] {
  const sub = subcategory.toLowerCase();
  const subSub = subSubCategory.toLowerCase();
  const name = productName.toLowerCase();
  const groups: AttributeGroup[] = [];

  // 1. Froid : Réfrigérateurs & Congélateurs
  const isCooling = sub.includes("froid") || subSub.includes("réfrigérateur") || subSub.includes("congélateur") || name.includes("frigo") || name.includes("réfrigérateur") || name.includes("congélateur");
  if (isCooling) {
    groups.push({
      id: "cooling_specs",
      title: "Caractéristiques Spécifiques : Froid & Réfrigération",
      iconName: "Refrigerator",
      description: "Type de froid, volume et technologie compresseur",
      attributes: [
        {
          id: "cool_type",
          label: "Format de l'appareil",
          type: "select",
          options: ["Combiné 2 portes (Congélateur en bas)", "Réfrigérateur 2 portes (Congélateur en haut)", "Side by Side Américain (2 portes côte à côte)", "Multi-portes / French Door (4 portes)", "Congélateur coffre horizontal", "Congélateur armoire vertical"],
        },
        {
          id: "cool_tech",
          label: "Technologie de Froid",
          type: "select",
          options: ["Total No-Frost (Ventilé sans givre)", "Froid brassé dynamique", "Froid statique classique"],
        },
        {
          id: "cool_volume",
          label: "Volume net total (Litres)",
          type: "text",
          placeholder: "Ex: 350 Litres, 520 Litres",
        },
        {
          id: "cool_features",
          label: "Équipements & Confort",
          type: "multiselect",
          options: ["Moteur Inverter silencieux garanti 10 ans", "Distributeur d'eau fraîche en façade", "Fabrique automatique de glaçons", "Éclairage intérieur LED", "Zone fraîcheur fruits & légumes 0°C"],
        },
      ],
    });
    return groups;
  }

  // 2. Lavage : Lave-linge, Sèche-linge & Lave-vaisselle
  const isWashing = sub.includes("lavage") || subSub.includes("lave-linge") || subSub.includes("lave-vaisselle") || subSub.includes("sèche-linge") || name.includes("lave-linge") || name.includes("lave-vaisselle");
  if (isWashing) {
    groups.push({
      id: "washing_specs",
      title: "Caractéristiques Spécifiques : Lavage & Soin du Linge",
      description: "Capacité, essorage et programmes",
      attributes: [
        {
          id: "wash_type",
          label: "Type d'appareil",
          type: "select",
          options: ["Lave-linge frontal (Hublot)", "Lave-linge ouverture par le haut (Top)", "Lave-linge séchant 2-en-1", "Sèche-linge pompe à chaleur", "Lave-vaisselle 60cm (12-14 couverts)", "Lave-vaisselle compact 45cm"],
        },
        {
          id: "wash_capacity",
          label: "Capacité de chargement",
          type: "select",
          options: ["6 kg", "7 kg", "8 kg", "9 kg", "10 kg", "12 kg et +", "13 - 15 couverts (Lave-vaisselle)"],
        },
        {
          id: "wash_spin",
          label: "Vitesse d'essorage maximale",
          type: "select",
          options: ["1000 tr/min", "1200 tr/min", "1400 tr/min", "1600 tr/min", "Non applicable (Lave-vaisselle)"],
        },
        {
          id: "wash_motor",
          label: "Type de Moteur",
          type: "radio",
          options: ["Moteur Induction Direct Drive (Ultra silencieux)", "Moteur universel standard"],
        },
      ],
    });
    return groups;
  }

  // 3. Cuisson : Fours, Plaques & Cuisinières
  const isCooking = sub.includes("cuisson") || subSub.includes("four") || subSub.includes("plaque") || subSub.includes("cuisinière") || subSub.includes("micro-ondes") || name.includes("four") || name.includes("cuisinière") || name.includes("plaque");
  if (isCooking) {
    groups.push({
      id: "cooking_specs",
      title: "Caractéristiques Spécifiques : Cuisson",
      description: "Source d'énergie, feux et nettoyage",
      attributes: [
        {
          id: "cook_type",
          label: "Type d'appareil",
          type: "select",
          options: ["Four encastrable 60 cm", "Plaque de cuisson encastrable", "Cuisinière tout gaz", "Cuisinière mixte (Gaz + Four électrique)", "Micro-ondes gril / combiné", "Friteuse sans huile (Airfryer)"],
        },
        {
          id: "cook_energy",
          label: "Énergie / Type de feux",
          type: "select",
          options: ["Gaz naturel / Butane avec sécurité thermocouple", "Induction rapide sécurisée", "Vitrocéramique radiante", "Électrique classique"],
        },
        {
          id: "cook_burners",
          label: "Nombre de feux / foyers",
          type: "select",
          options: ["2 foyers (Domino)", "3 foyers", "4 feux standards", "5 feux avec triple couronne Wok"],
        },
        {
          id: "cook_cleaning",
          label: "Système de nettoyage four",
          type: "select",
          options: ["Pyrolyse (Nettoyage à très haute température)", "Catalyse (Parois autonettoyantes)", "Émail lisse manuel / Vapeur Hydrolyse", "Non applicable"],
        },
      ],
    });
    return groups;
  }

  // 4. Climatisation & Chauffage
  const isClimate = sub.includes("climatisation") || sub.includes("chauffage") || subSub.includes("climatiseur") || subSub.includes("chauffage") || name.includes("climatiseur") || name.includes("chauffage");
  if (isClimate) {
    groups.push({
      id: "climate_specs",
      title: "Caractéristiques Spécifiques : Climatisation & Traitement de l'air",
      description: "Puissance frigorifique, technologie et gaz",
      attributes: [
        {
          id: "climate_power",
          label: "Puissance frigorifique (BTU) *",
          type: "select",
          options: ["9 000 BTU (Idéal jusqu'à 20 m²)", "12 000 BTU (Idéal jusqu'à 30 m²)", "18 000 BTU (Idéal jusqu'à 45 m²)", "24 000 BTU (Idéal jusqu'à 65 m²)", "36 000 BTU (Grand espace / Salon pro)"],
        },
        {
          id: "climate_inverter",
          label: "Technologie Inverter",
          type: "radio",
          options: ["Oui (Inverter économique -60% énergie)", "Non (Compresseur standard On/Off)"],
        },
        {
          id: "climate_reversible",
          label: "Mode Réversible",
          type: "radio",
          options: ["Chaud & Froid (Réversible 4 saisons)", "Froid seul"],
        },
        {
          id: "climate_gas",
          label: "Gaz réfrigérant",
          type: "select",
          options: ["R32 (Nouvelle génération écologique)", "R410A standard"],
        },
      ],
    });
    return groups;
  }

  // 5. Petit Électroménager, Café & Préparation
  const isSmallAppliance = sub.includes("café") || sub.includes("petit déjeuner") || sub.includes("culinaire") || sub.includes("sol") || subSub.includes("aspirateur") || subSub.includes("cafeti") || subSub.includes("robot") || subSub.includes("blender") || name.includes("aspirateur") || name.includes("cafetière") || name.includes("mixeur");
  if (isSmallAppliance) {
    groups.push({
      id: "small_appliance_specs",
      title: "Caractéristiques Spécifiques : Petit Électroménager",
      description: "Puissance, capacité et fonctionnalités",
      attributes: [
        {
          id: "small_power",
          label: "Puissance électrique (Watts)",
          type: "text",
          placeholder: "Ex: 1500 W, 2200 W",
        },
        {
          id: "small_capacity",
          label: "Capacité du bol ou réservoir",
          type: "text",
          placeholder: "Ex: 1.5 Litres, 15 bars de pression",
        },
        {
          id: "small_speeds",
          label: "Vitesses & Réglages",
          type: "select",
          options: ["Vitesse unique avec fonction Pulse", "2 à 5 vitesses réglables", "Variateur de vitesse continu", "Programmes automatiques programmés"],
        },
      ],
    });
    return groups;
  }

  return groups;
}
