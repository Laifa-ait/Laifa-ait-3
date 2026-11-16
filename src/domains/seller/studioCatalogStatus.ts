import { PRODUCT_STATUSES } from "../product/product.status";

export type CatalogLifecycleGroup = "active" | "inactive" | "deleted";

export interface CatalogProductStatusMeta {
  lifecycle: CatalogLifecycleGroup;
  rawStatus: string;
  label: string;
  isPubliclyVisible: boolean;
  isPurchasable: boolean;
}

export const PUBLIC_PRODUCT_STATUS_SET = new Set<string>([PRODUCT_STATUSES.ACTIVE, "approved", "published"]);
const DELETED_PRODUCT_STATUS_SET = new Set<string>(["deleted", "pending_deletion"]);

export function slugifyCategoryValue(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseProductTimestampMs(raw: unknown): number {
  if (!raw) return 0;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
  if (raw instanceof Date) return Number.isFinite(raw.getTime()) ? raw.getTime() : 0;
  if (typeof raw === "string") {
    const parsed = new Date(raw).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof raw === "object") {
    const obj = raw as {
      toMillis?: () => number;
      toDate?: () => Date;
      seconds?: unknown;
      _seconds?: unknown;
      nanoseconds?: unknown;
      _nanoseconds?: unknown;
    };
    if (typeof obj.toMillis === "function") {
      const ms = obj.toMillis();
      return Number.isFinite(ms) ? ms : 0;
    }
    if (typeof obj.toDate === "function") {
      const ms = obj.toDate().getTime();
      return Number.isFinite(ms) ? ms : 0;
    }
    const sec =
      typeof obj.seconds === "number" ? obj.seconds : typeof obj._seconds === "number" ? obj._seconds : NaN;
    if (Number.isFinite(sec)) {
      const ns =
        typeof obj.nanoseconds === "number"
          ? obj.nanoseconds
          : typeof obj._nanoseconds === "number"
          ? obj._nanoseconds
          : 0;
      return sec * 1000 + Math.floor(ns / 1_000_000);
    }
  }
  return 0;
}

export function serializeTimestampIso(raw: unknown): string | undefined {
  const ms = parseProductTimestampMs(raw);
  return ms > 0 ? new Date(ms).toISOString() : undefined;
}

export function classifyCatalogProductStatus(product: {
  status?: unknown;
  stock?: unknown;
  deletedAt?: unknown;
}): CatalogProductStatusMeta {
  const rawStatus =
    typeof product.status === "string" && product.status.trim()
      ? product.status.trim().toLowerCase()
      : PRODUCT_STATUSES.ACTIVE;
  const stockNum = typeof product.stock === "number" ? product.stock : 1;

  if (product.deletedAt || DELETED_PRODUCT_STATUS_SET.has(rawStatus)) {
    return {
      lifecycle: "deleted",
      rawStatus,
      label: rawStatus === "pending_deletion" ? "Suppression" : "Supprimé",
      isPubliclyVisible: false,
      isPurchasable: false,
    };
  }
  if (PUBLIC_PRODUCT_STATUS_SET.has(rawStatus)) {
    return {
      lifecycle: "active",
      rawStatus,
      label: stockNum <= 0 ? "Rupture" : "Actif",
      isPubliclyVisible: true,
      isPurchasable: stockNum > 0,
    };
  }
  const labelMap: Record<string, string> = {
    draft: "Brouillon",
    pending: "En attente",
    suspended: "Suspendu",
    rejected: "Rejeté",
    archived: "Archivé",
  };
  return {
    lifecycle: "inactive",
    rawStatus,
    label: labelMap[rawStatus] || "Inactif",
    isPubliclyVisible: false,
    isPurchasable: false,
  };
}

export function isCatalogProductPubliclyActive(
  product: { status?: unknown; stock?: unknown; deletedAt?: unknown } | null | undefined
): boolean {
  return Boolean(product && classifyCatalogProductStatus(product).isPubliclyVisible);
}
