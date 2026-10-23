/**
 * Service de calcul du poids volumétrique (Norme Fret IATA / Transporteurs Algériens).
 * Formule officielle : (Longueur cm × Largeur cm × Hauteur cm) / 5000.
 * Pour les articles volumineux (canapés, électroménager), le transporteur facture
 * le maximum entre le poids réel et le poids volumétrique.
 */

export interface ParsedDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  volumeCm3: number;
}

export interface VolumetricCalculationResult {
  actualWeightKg: number;
  volumetricWeightKg: number;
  billableWeightKg: number;
  isVolumetricDominant: boolean;
  parsedDimensions: ParsedDimensions | null;
  divisor: number;
  explanation: string;
}

export const STANDARD_VOLUMETRIC_DIVISOR = 5000;

/**
 * Analyse une chaîne de dimensions de formats variés (ex: "120x80x60", "120 x 80 x 60", "120*80*60")
 */
export function parseDimensionsString(dimStr?: string): ParsedDimensions | null {
  if (!dimStr) return null;
  const clean = dimStr.trim().toLowerCase().replace(/cm/g, "");
  const parts = clean.split(/[x*×\s,;-]+/).filter(Boolean);

  if (parts.length >= 3) {
    const l = parseFloat(parts[0]);
    const w = parseFloat(parts[1]);
    const h = parseFloat(parts[2]);

    if (!isNaN(l) && !isNaN(w) && !isNaN(h) && l > 0 && w > 0 && h > 0) {
      return {
        lengthCm: l,
        widthCm: w,
        heightCm: h,
        volumeCm3: Math.round(l * w * h)
      };
    }
  }

  return null;
}

/**
 * Calcule le poids facturable selon le poids volumétrique
 */
export function calculateVolumetricWeight(
  dimensionsInput?: string | ParsedDimensions | null,
  actualWeightKgInput?: number | string | null,
  divisor: number = STANDARD_VOLUMETRIC_DIVISOR
): VolumetricCalculationResult {
  const actualWeight = Math.max(
    0.1,
    typeof actualWeightKgInput === "number"
      ? actualWeightKgInput
      : parseFloat(String(actualWeightKgInput || "1")) || 1.0
  );

  let parsed: ParsedDimensions | null = null;
  if (typeof dimensionsInput === "string") {
    parsed = parseDimensionsString(dimensionsInput);
  } else if (dimensionsInput && typeof dimensionsInput === "object") {
    parsed = dimensionsInput;
  }

  if (!parsed) {
    return {
      actualWeightKg: actualWeight,
      volumetricWeightKg: 0,
      billableWeightKg: actualWeight,
      isVolumetricDominant: false,
      parsedDimensions: null,
      divisor,
      explanation: `Poids réel retenu (${actualWeight} kg) sans dimensions volumétriques spécifiées.`
    };
  }

  const effectiveDivisor = divisor > 0 ? divisor : STANDARD_VOLUMETRIC_DIVISOR;
  const rawVolumetric = (parsed.lengthCm * parsed.widthCm * parsed.heightCm) / effectiveDivisor;
  const volumetricWeightKg = Math.round(rawVolumetric * 10) / 10; // Arrondi à 1 décimale

  const isVolumetricDominant = volumetricWeightKg > actualWeight;
  const billableWeightKg = Math.max(actualWeight, volumetricWeightKg);

  const explanation = isVolumetricDominant
    ? `Article volumineux : Poids volumétrique de ${volumetricWeightKg} kg appliqué car supérieur au poids réel (${actualWeight} kg).`
    : `Poids réel de ${actualWeight} kg appliqué (poids volumétrique de ${volumetricWeightKg} kg inférieur).`;

  return {
    actualWeightKg: actualWeight,
    volumetricWeightKg,
    billableWeightKg,
    isVolumetricDominant,
    parsedDimensions: parsed,
    divisor: effectiveDivisor,
    explanation
  };
}
