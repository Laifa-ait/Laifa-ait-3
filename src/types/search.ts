import { Request } from "express";
import { Product } from "../domains/product/product.types";

export interface SearchableProduct {
  id: string;
  name?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  subCategory?: string;
  subSubCategory?: string;
  subsubcategory?: string;
  price?: number;
  promoPrice?: number;
  wilaya?: string;
  stock?: number;
  gender?: string;
  brand?: string;
  sku?: string;
  season?: string;
  shopName?: string;
  sellerName?: string;
  sellerId?: string;
  sellerTrustScore?: number;
  salesCount?: number;
  rating?: number;
  image?: string;
  images?: string[];
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  translations?: Record<string, Record<string, string>>;
  stats?: {
    reviewCount?: number;
    averageRating?: number;
    totalRatingSum?: number;
  };
}

export interface StoreProfile {
  id?: string;
  uid?: string;
  shopName?: string;
  displayName?: string;
  shopDescription?: string;
  logoUrl?: string;
  wilaya?: string | number;
  [key: string]: unknown;
}

export type SearchStoreResult = StoreProfile;

export interface SearchStoresContainer {
  stores: StoreProfile[];
}

export interface SearchRequestExpress extends Request {
  user?: { uid: string; [key: string]: unknown };
}

export interface SearchApiResponse {
  products: Product[];
  stores: SearchStoreResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  suggestions?: string[];
}
