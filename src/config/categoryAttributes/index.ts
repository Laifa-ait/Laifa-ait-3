/**
 * OLMART CATEGORY ATTRIBUTES ENGINE - CENTRAL DISPATCHER
 * Fournit les spécifications, filtres et matières 100% dynamiques et contextuels
 * selon la catégorie, sous-catégorie et sous-sous-catégorie du produit.
 */

import { AttributeGroup } from "./types";
import { getFashionAttributeGroups } from "./fashionSpecs";
import { getTechAttributeGroups } from "./techSpecs";
import { getApplianceAttributeGroups } from "./applianceSpecs";
import { getHomeLivingAttributeGroups } from "./homeLivingSpecs";
import { getBeautyHealthAttributeGroups } from "./beautyHealthSpecs";
import { getAutoMotoAttributeGroups } from "./autoMotoSpecs";
import { getSportBabyAttributeGroups } from "./sportBabySpecs";
import { getCraftGroceryOfficeAttributeGroups } from "./craftGroceryOfficeSpecs";

export * from "./types";
export * from "./materialsAndEnergy";

/**
 * Retourne les groupes d'attributs ultra-spécifiques et contextuels
 */
export function getContextualAttributeGroups(
  category?: string,
  subcategory?: string,
  subSubCategory?: string,
  productName?: string
): AttributeGroup[] {
  const cat = category || "";
  const sub = subcategory || "";
  const subSub = subSubCategory || "";
  const name = productName || "";

  // 1. Fashion (Vestes, robes, pantalons, chemises, costumes, chaussures, sacs)
  const fashionGroups = getFashionAttributeGroups(cat, sub, subSub, name);
  if (fashionGroups.length > 0) return fashionGroups;

  // 2. High-Tech & Électronique (Smartphones, PC, tablettes, audio, TV)
  const techGroups = getTechAttributeGroups(cat, sub, subSub, name);
  if (techGroups.length > 0) return techGroups;

  // 3. Électroménager (Froid, lavage, cuisson, climatisation, petit électro)
  const applianceGroups = getApplianceAttributeGroups(cat, sub, subSub, name);
  if (applianceGroups.length > 0) return applianceGroups;

  // 4. Maison & Déco (Mobilier salon, chambre, literie, luminaires, cuisine)
  const homeGroups = getHomeLivingAttributeGroups(cat, sub, subSub, name);
  if (homeGroups.length > 0) return homeGroups;

  // 5. Beauté & Santé (Parfums, soins, maquillage)
  const beautyGroups = getBeautyHealthAttributeGroups(cat, sub, subSub, name);
  if (beautyGroups.length > 0) return beautyGroups;

  // 6. Auto & Moto (Huiles, pneus, équipement motard, pièces détachées)
  const autoGroups = getAutoMotoAttributeGroups(cat, sub, subSub, name);
  if (autoGroups.length > 0) return autoGroups;

  // 7. Sport & Bébé (Sport fitness, poussettes, sièges auto, puériculture)
  const sportBabyGroups = getSportBabyAttributeGroups(cat, sub, subSub, name);
  if (sportBabyGroups.length > 0) return sportBabyGroups;

  // 8. Artisanat, Terroir, Bricolage, Supermarché, Scolaire, Jouets
  const craftGroceryGroups = getCraftGroceryOfficeAttributeGroups(cat, sub, subSub, name);
  if (craftGroceryGroups.length > 0) return craftGroceryGroups;

  return [];
}
