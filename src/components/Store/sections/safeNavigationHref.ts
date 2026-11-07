import React from "react";
import type { CategoryItem } from "../../../domains/seller/customPage.types";

const BUILTIN_SECTION_ANCHORS: Record<string, string> = {
  "#new-arrivals": "new_arrivals",
  "#livraison": "delivery_info",
  "#faq": "faq_accordion",
  "#contact": "contact_footer",
};

export function safeNavigationHref(target?: string): string | undefined {
  const value = target?.trim();
  if (!value) return undefined;
  if (value.startsWith("#") || (value.startsWith("/") && !value.startsWith("//"))) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}

export function parseSmartLinkProductIds(value?: string): string[] {
  const trimmed = (value || "").trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("#products:")) {
    return trimmed
      .replace("#products:", "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }
  if (trimmed.startsWith("#product:")) {
    const single = trimmed.replace("#product:", "").trim();
    return single ? [single] : [];
  }
  if (trimmed.startsWith("/product/")) {
    const single = trimmed.replace("/product/", "").split("?")[0].trim();
    return single ? [single] : [];
  }
  return [];
}

export function handleSmartLinkClick(
  href: string | undefined,
  e: React.MouseEvent,
  collectionTitle?: string
): boolean {
  const clean = (href || "").trim();
  if (!clean) return false;

  if (clean.startsWith("#products:") || clean.startsWith("#product:")) {
    const ids = parseSmartLinkProductIds(clean);
    if (ids.length > 0) {
      e.preventDefault();
      const customCategory: CategoryItem = {
        id: "selection-produits",
        name: collectionTitle || "Sélection de Produits",
        slug: "selection-produits",
        productIds: ids,
        description: `${ids.length} article${ids.length > 1 ? "s" : ""} sélectionné${
          ids.length > 1 ? "s" : ""
        }`,
      };
      window.dispatchEvent(
        new CustomEvent("studio:navigate-page", {
          detail: {
            viewMode: "category",
            categorySlug: "selection-produits",
            categoryItem: customCategory,
          },
        })
      );
      return true;
    }
  }

  if (clean.startsWith("#rayon:")) {
    const slug = clean.replace("#rayon:", "").trim();
    if (slug) {
      e.preventDefault();
      window.dispatchEvent(
        new CustomEvent("studio:navigate-page", {
          detail: {
            viewMode: "category",
            categorySlug: slug,
          },
        })
      );
      return true;
    }
  }

  if (clean === "#catalog") {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent("studio:navigate-page", {
        detail: { viewMode: "collection" },
      })
    );
    return true;
  }

  if (clean.startsWith("#")) {
    const rawAnchor = clean.slice(1);
    const mappedType = BUILTIN_SECTION_ANCHORS[clean];
    const targetEl =
      document.getElementById(rawAnchor) ||
      document.querySelector(`[data-anchor-id="${rawAnchor}"]`) ||
      (mappedType ? document.querySelector(`[data-section-type="${mappedType}"]`) : null);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    }
  }

  return false;
}
