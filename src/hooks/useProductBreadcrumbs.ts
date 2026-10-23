import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Product } from "../domains/product/product.types";
import { getCategoryTranslation } from "../utils/translations";

export function useProductBreadcrumbs(product: Product | null) {
  const { t } = useTranslation();

  return useMemo(() => {
    if (!product) return [];
    const items: { label: string; link?: string }[] = [{ label: t("common.shop") || "Boutique", link: "/shop" }];
    if (product.category) {
      items.push({
        label: getCategoryTranslation(product.category, t),
        link: `/shop?category=${encodeURIComponent(product.category)}`,
      });
    }
    if (product.subcategory) {
      items.push({
        label: getCategoryTranslation(product.subcategory, t),
        link: `/shop?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`,
      });
    }
    const subSub = product.subSubCategory || product.subsubcategory;
    if (subSub && product.category && product.subcategory) {
      items.push({
        label: getCategoryTranslation(subSub, t),
        link: `/shop?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}&subsubcategory=${encodeURIComponent(subSub)}`,
      });
    }
    if (product.name) {
      items.push({
        label: product.name,
      });
    }
    return items;
  }, [product, t]);
}
