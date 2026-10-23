/**
 * Types & DTOs stricts pour l'Univers Pièces Détachées & Casse Automobile (Olma Auto - Phase 4)
 */

export type AutoPartCategory =
  | "moteur"
  | "carrosserie"
  | "optique"
  | "freinage"
  | "suspension"
  | "habitacle"
  | "casse_depecage"
  | "autre";

export type AutoPartCondition = "neuf" | "tres_bon_etat" | "bon_etat" | "pour_pieces";

export interface AutoPartCompatibility {
  brand: string;
  model: string;
  yearStart?: number;
  yearEnd?: number;
  engineType?: string;
  isUniversal?: boolean;
  isCertified?: boolean; // Certifiée constructeur ou OEM vs à confirmer par vendeur
}

export interface AutoPartDto {
  id: string;
  title: string;
  category: AutoPartCategory;
  condition: AutoPartCondition;
  priceDZD: number;
  isPriceNegotiable: boolean;
  wilayaId: number;
  commune: string;
  compatibilities: AutoPartCompatibility[];
  description: string;
  images: string[];
  isJunkYard: boolean; // Pièce issue de casse ou véhicule entier pour dépeçage
  sellerId: string;
  sellerName: string;
  sellerPhoneMasked?: string;
  createdAt: string;
  status: "active" | "sold" | "archived";
}

export interface AutoPartDetailDto extends AutoPartDto {
  sellerPhoneFull?: string;
  sellerWhatsApp?: string;
}

export interface CreateAutoPartInput {
  title: string;
  category: AutoPartCategory;
  condition: AutoPartCondition;
  priceDZD: number;
  isPriceNegotiable?: boolean;
  wilayaId: number;
  commune: string;
  compatibilities: AutoPartCompatibility[];
  description: string;
  images: string[];
  isJunkYard?: boolean;
  sellerPhone: string;
}

export interface AutoPartFilterParams {
  category?: AutoPartCategory;
  condition?: AutoPartCondition;
  brand?: string;
  model?: string;
  year?: number;
  wilayaId?: number;
  isJunkYard?: boolean;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  page?: number;
  limit?: number;
}
