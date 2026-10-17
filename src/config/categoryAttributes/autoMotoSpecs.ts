import { AttributeGroup } from "./types";

export function getAutoMotoAttributeGroups(
  _category: string,
  subcategory: string,
  subSubCategory: string,
  productName: string
): AttributeGroup[] {
  const sub = subcategory.toLowerCase();
  const subSub = subSubCategory.toLowerCase();
  const name = productName.toLowerCase();
  const groups: AttributeGroup[] = [];

  // 1. Huiles & Lubrifiants
  const isOil = sub.includes("entretien") || subSub.includes("huile") || name.includes("huile moteur") || name.includes("5w30") || name.includes("10w40") || name.includes("5w40");
  if (isOil) {
    groups.push({
      id: "oil_specs",
      title: "Caractéristiques Spécifiques : Huiles & Lubrifiants",
      iconName: "Droplet",
      description: "Viscosité, norme constructeur et volume",
      attributes: [
        {
          id: "oil_viscosity",
          label: "Indice de Viscosité *",
          type: "select",
          options: ["5W-30 (Synthèse moderne DPF)", "5W-40 (100% Synthèse haute protection)", "10W-40 (Semi-synthèse polyvalente)", "15W-40 (Minérale pour moteurs kilométrés)", "0W-20 / 0W-30 (Éco-carburant récent)", "Huile de boîte de vitesses 75W-80 / 75W-90"],
        },
        {
          id: "oil_volume",
          label: "Contenance du bidon",
          type: "select",
          options: ["1 Litre (Appoint)", "4 Litres", "5 Litres (Vidange complète standard)", "20 Litres (Fût atelier)"],
        },
        {
          id: "oil_motor_type",
          label: "Compatibilité Motorisation",
          type: "select",
          options: ["Diesel avec FAP / DPF (Low SAPS)", "Essence & Hybride", "Universel Essence & Diesel sans FAP"],
        },
      ],
    });
    return groups;
  }

  // 2. Pneumatiques & Jantes
  const isTyre = subSub.includes("pneu") || subSub.includes("jante") || name.includes("pneu") || name.includes("pneumatique");
  if (isTyre) {
    groups.push({
      id: "tyre_specs",
      title: "Caractéristiques Spécifiques : Pneus & Roues",
      description: "Dimension normalisée, indice de charge et saison",
      attributes: [
        {
          id: "tyre_size",
          label: "Dimension Complète du Pneu *",
          type: "text",
          placeholder: "Ex: 205/55 R16 91V, 195/65 R15 91H",
        },
        {
          id: "tyre_season",
          label: "Saison d'utilisation",
          type: "radio",
          options: ["Pneu Été (Performances optimales)", "4 Saisons (Toutes saisons)", "Pneu Hiver / M+S"],
        },
        {
          id: "tyre_runflat",
          label: "Technologie Runflat (Roulage à plat)",
          type: "radio",
          options: ["Standard (Non Runflat)", "Runflat renforcé"],
        },
      ],
    });
    return groups;
  }

  // 3. Casques & Équipement Motard
  const isMotoGear = sub.includes("moto") || subSub.includes("casque") || subSub.includes("gant") || name.includes("casque moto") || name.includes("gants moto");
  if (isMotoGear) {
    groups.push({
      id: "moto_gear_specs",
      title: "Caractéristiques Spécifiques : Équipement Motard",
      iconName: "Shield",
      description: "Homologation sécurité, type de casque et taille",
      attributes: [
        {
          id: "helmet_type",
          label: "Type de Casque / Équipement",
          type: "select",
          options: ["Casque Intégral (Sécurité maximale)", "Casque Modulable (Mentonnière relevable)", "Casque Jet urbain", "Casque Cross / Enduro", "Blouson moto renforcé", "Gants moto certifiés CE KP1"],
        },
        {
          id: "helmet_homologation",
          label: "Norme d'Homologation",
          type: "select",
          options: ["Homologué ECE 22.06 (Dernière norme stricte)", "Homologué ECE 22.05", "Certifié CE"],
        },
        {
          id: "helmet_visor",
          label: "Écran & Pare-soleil",
          type: "multiselect",
          options: ["Double écran solaire interne fumé", "Prédisposé film antibuée Pinlock", "Visière anti-rayures traitée UV"],
        },
      ],
    });
    return groups;
  }

  // 4. Pièces détachées mécaniques auto
  const isAutoPart = sub.includes("mécanique") || sub.includes("pièce") || subSub.includes("frein") || subSub.includes("filtre") || subSub.includes("batterie") || name.includes("plaquette") || name.includes("disque de frein") || name.includes("batterie auto");
  if (isAutoPart) {
    groups.push({
      id: "autopart_specs",
      title: "Caractéristiques Spécifiques : Pièces Détachées Auto",
      description: "Compatibilité constructeur, position et spécifications",
      attributes: [
        {
          id: "part_compatibility",
          label: "Véhicules compatibles *",
          type: "text",
          placeholder: "Ex: Renault Clio 4 1.5 dCi, Dacia Sandero, Golf 7...",
        },
        {
          id: "part_position",
          label: "Position de montage",
          type: "select",
          options: ["Essieu Avant (Gauche & Droite)", "Essieu Arrière (Gauche & Droite)", "Côté Gauche (Conducteur)", "Côté Droit (Passager)", "Compartiment moteur / Universel"],
        },
        {
          id: "part_reference",
          label: "Référence d'origine constructeur (OEM)",
          type: "text",
          placeholder: "Ex: Référence pièce constructeur OEM",
        },
      ],
    });
    return groups;
  }

  return groups;
}
