import { useMemo } from "react";
import { Product } from "../../../domains/product/product.types";

export interface DetailedAttributeItem {
  label: string;
  value: string;
  unit?: string;
}

export function useDetailedAttributes(product: Product): DetailedAttributeItem[] {
  return useMemo(() => {
    const items: DetailedAttributeItem[] = [];

    // Parse product.attributes
    if (product.attributes && typeof product.attributes === "object") {
      Object.entries(product.attributes).forEach(([rawKey, val]) => {
        if (!val) return;
        const formattedLabel = rawKey
          .replace(/([A-Z])/g, " $1")
          .replace(/[_-]/g, " ")
          .trim()
          .replace(/^\w/, (c) => c.toUpperCase());

        const formattedVal = Array.isArray(val) ? val.join(", ") : String(val);
        if (formattedVal.trim()) {
          items.push({ label: formattedLabel, value: formattedVal.trim() });
        }
      });
    }

    // Parse product.specs
    if (product.specs && typeof product.specs === "object") {
      Object.entries(product.specs).forEach(([rawKey, val]) => {
        if (!val) return;
        // avoid duplicates if already present from attributes
        const formattedLabel = rawKey
          .replace(/([A-Z])/g, " $1")
          .replace(/[_-]/g, " ")
          .trim()
          .replace(/^\w/, (c) => c.toUpperCase());

        if (!items.some((item) => item.label.toLowerCase() === formattedLabel.toLowerCase())) {
          items.push({ label: formattedLabel, value: String(val).trim() });
        }
      });
    }

    return items;
  }, [product.attributes, product.specs]);
}
