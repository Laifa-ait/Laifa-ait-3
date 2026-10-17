import { ai, DEFAULT_GEMINI_MODEL } from "../../config/gemini";
import { safeLogger } from "../../utils/logger";

export interface GenerateProductDescriptionParams {
  productName: string;
  category?: string;
  subcategory?: string;
  subSubCategory?: string;
  brand?: string;
  attributes?: Record<string, unknown> | string[];
  materials?: string | string[];
  warranty?: string;
  condition?: string;
}

export async function generateProductDescriptionService(
  params: GenerateProductDescriptionParams
): Promise<string> {
  const {
    productName,
    category,
    subcategory,
    subSubCategory,
    brand,
    attributes,
    materials,
    warranty,
    condition,
  } = params;

  try {
    const prompt = `Génère une description commerciale concise, attrayante et professionnelle en français pour le produit suivant vendu sur la marketplace algérienne OLMART :
- Nom du produit : ${productName}
${category ? `- Catégorie : ${category}` : ""}
${subcategory ? `- Sous-catégorie : ${subcategory}` : ""}
${subSubCategory ? `- Spécialité : ${subSubCategory}` : ""}
${brand ? `- Marque : ${brand}` : ""}
${condition ? `- État : ${condition}` : ""}
${materials ? `- Matériaux : ${Array.isArray(materials) ? materials.join(", ") : materials}` : ""}
${warranty ? `- Garantie : ${warranty}` : ""}
${attributes ? `- Attributs : ${typeof attributes === "object" ? JSON.stringify(attributes) : attributes}` : ""}

Directives :
- Texte vendeur, fluide, mettant en valeur la qualité, l'authenticité et la satisfaction client.
- Adapté au commerce en Algérie (livraison rapide, fiabilité).
- Maximum 3 paragraphes courts. Ne pas inclure de balises HTML ou markdown superflues.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
    });

    const description = response.text?.trim();
    if (description && description.length > 10) {
      return description;
    }

    return `Découvrez ${productName}, sélectionné pour sa qualité, sa fiabilité et ses performances au quotidien sur Olmart.`;
  } catch (err: unknown) {
    safeLogger.warn("[generateProductDescriptionService] Failed to generate AI description, using fallback", {
      err: err instanceof Error ? err.message : String(err),
      productName,
    });
    return `Découvrez ${productName}, sélectionné pour sa qualité, sa fiabilité et ses performances au quotidien sur Olmart.`;
  }
}
