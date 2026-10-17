import React from "react";
import { Product, ProductVariant } from "../domains/product/product.types";

export function useProductVariantsStock(
  product: Product | null,
  selectedColor: string | null,
  selectedSize: string | null,
  currentPrice?: number | null
) {
  const calculatedVariantKey = React.useMemo(() => {
    return [selectedColor, selectedSize].filter(Boolean).join(" - ").toUpperCase();
  }, [selectedColor, selectedSize]);

  const selectedVariantObj = React.useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) return null;
    return product.variants.find((v: ProductVariant) => {
      if (v.isActive === false) return false;
      const vNameUpper = v.name?.toUpperCase().trim() || "";
      if (calculatedVariantKey && vNameUpper === calculatedVariantKey.toUpperCase().trim()) return true;
      if (selectedColor && selectedSize) {
        const matchesColor = (v.color?.toUpperCase().trim() === selectedColor.toUpperCase().trim()) || vNameUpper.includes(selectedColor.toUpperCase().trim());
        const matchesSize = (v.size?.toUpperCase().trim() === selectedSize.toUpperCase().trim()) || vNameUpper.includes(selectedSize.toUpperCase().trim());
        return Boolean(matchesColor && matchesSize);
      }
      if (selectedColor && !selectedSize) {
        return (v.color?.toUpperCase().trim() === selectedColor.toUpperCase().trim()) || vNameUpper === selectedColor.toUpperCase().trim();
      }
      if (selectedSize && !selectedColor) {
        return (v.size?.toUpperCase().trim() === selectedSize.toUpperCase().trim()) || vNameUpper === selectedSize.toUpperCase().trim();
      }
      return false;
    }) || null;
  }, [product, calculatedVariantKey, selectedColor, selectedSize]);

  const isCurrentSelectionOutOfStock = React.useMemo(() => {
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      if (!selectedVariantObj) return false;
      return (Number(selectedVariantObj.stock) || 0) <= 0;
    }
    return (product?.stock || 0) <= 0;
  }, [product, selectedVariantObj]);

  const displayedPrice = React.useMemo(() => {
    const basePrice = currentPrice || 0;
    if (selectedVariantObj) {
      if (
        selectedVariantObj.priceOverride !== undefined &&
        selectedVariantObj.priceOverride !== null &&
        selectedVariantObj.priceOverride !== ""
      ) {
        return Number(selectedVariantObj.priceOverride);
      } else if (selectedVariantObj.priceDiff) {
        return basePrice + Number(selectedVariantObj.priceDiff);
      }
    }
    return basePrice;
  }, [currentPrice, selectedVariantObj]);

  const isColorOutOfStock = React.useCallback(
    (c: string) => {
      if (!product?.variants) return false;
      const variantsWithColor = product.variants.filter((v: ProductVariant) => {
        if (v.isActive === false) return false;
        return v.color?.toUpperCase().trim() === c.toUpperCase().trim() ||
          v.name?.toUpperCase().includes(c.toUpperCase().trim());
      });
      return (
        variantsWithColor.length > 0 &&
        variantsWithColor.every((v: ProductVariant) => (Number(v.stock) || 0) <= 0)
      );
    },
    [product]
  );

  const isSizeOutOfStock = React.useCallback(
    (s: string) => {
      if (!product?.variants) return false;
      const variantsWithSize = product.variants.filter((v: ProductVariant) => {
        if (v.isActive === false) return false;
        const matchesSize = v.size?.toUpperCase().trim() === s.toUpperCase().trim() ||
          v.name?.toUpperCase().includes(s.toUpperCase().trim());
        if (selectedColor) {
          const matchesColor = v.color?.toUpperCase().trim() === selectedColor.toUpperCase().trim() ||
            v.name?.toUpperCase().includes(selectedColor.toUpperCase().trim());
          return matchesSize && matchesColor;
        }
        return matchesSize;
      });
      return (
        variantsWithSize.length > 0 &&
        variantsWithSize.every((v: ProductVariant) => (Number(v.stock) || 0) <= 0)
      );
    },
    [product, selectedColor]
  );

  return {
    selectedVariantObj,
    isCurrentSelectionOutOfStock,
    displayedPrice,
    isColorOutOfStock,
    isSizeOutOfStock,
  };
}
