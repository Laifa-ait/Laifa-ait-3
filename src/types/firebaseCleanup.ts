/**
 * Types stricts pour le module d'audit et de nettoyage sécurisé Firebase (Olmart Core).
 */

export type CleanupCategoryId =
  | "obsolete_legacy_collections"
  | "duplicate_shadow_collections"
  | "write_only_bloat"
  | "analytics_and_expired_keys"
  | "seed_products"
  | "corrupted_products"
  | "seed_auto_parts"
  | "seed_real_estate"
  | "search_logs"
  | "site_errors"
  | "system_noise"
  | "read_notifications";

export interface CleanupSampleItem {
  id: string;
  collection: string;
  label: string;
}

export interface CleanupTargetDoc {
  id: string;
  collection: string;
  label: string;
}

export interface CleanupCollectorResult {
  targets: CleanupTargetDoc[];
  truncated: boolean;
  totalCount?: number;
}

export interface CleanupCategoryMeta {
  id: CleanupCategoryId;
  title: string;
  description: string;
  collections: string[];
  riskLevel: "safe" | "moderate";
}

export interface CleanupCategorySummary extends CleanupCategoryMeta {
  count: number;
  truncated: boolean;
  samples: CleanupSampleItem[];
}

export interface CleanupAuditReport {
  scannedAt: string;
  totalJunkCount: number;
  categories: CleanupCategorySummary[];
  protectedCollections: string[];
}

export interface CleanupPurgeRequest {
  categories: CleanupCategoryId[];
}

export interface CleanupPurgeResult {
  purgedAt: string;
  totalDeleted: number;
  deletedByCategory: Record<string, number>;
  errors: string[];
}
