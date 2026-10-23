import { useState, useMemo, useCallback, useEffect, useDeferredValue } from "react";
import { Product } from "../domains/product/product.types";

export type ArrayFacetKey = "sizes" | "colors" | "materials" | "brands" | "wilayas" | "conditions";

export interface SelectedFacets {
  sizes: string[];
  colors: string[];
  materials: string[];
  brands: string[];
  wilayas: string[];
  conditions: string[];
  priceRange: [number, number];
  minRating: number;
  inStock: boolean;
  onSale: boolean;
  freeShipping: boolean;
  acceptsCod: boolean;
}

export interface FacetOption {
  value: string;
  count: number;
}

export interface AvailableFacets {
  sizes: FacetOption[];
  colors: FacetOption[];
  materials: FacetOption[];
  brands: FacetOption[];
  wilayas: FacetOption[];
  conditions: FacetOption[];
  minPrice: number;
  maxPrice: number;
}

const DEFAULT_PRICE_LIMIT: [number, number] = [0, 150000];

export function useFacetedFilters(products: Product[] = [], activeCategory: string = "Tous") {
  const categoryProducts = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    if (!activeCategory || activeCategory === "Tous") return safeProducts;
    return safeProducts.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const [selectedFacets, setSelectedFacets] = useState<SelectedFacets>({
    sizes: [], colors: [], materials: [], brands: [], wilayas: [], conditions: [],
    priceRange: [0, 150000], minRating: 0, inStock: false, onSale: false, freeShipping: false, acceptsCod: false,
  });

  const [isPriceModified, setIsPriceModified] = useState(false);

  const nonPriceFilteredProducts = useMemo(() => {
    return categoryProducts.filter((prod) => {
      if ((selectedFacets.sizes || []).length > 0 && !selectedFacets.sizes.some((s) => (prod.sizes || []).includes(s))) return false;
      if ((selectedFacets.colors || []).length > 0 && !selectedFacets.colors.some((c) => (prod.colors || []).includes(c))) return false;
      if ((selectedFacets.materials || []).length > 0) {
        const prodMat = prod.material || "";
        const prodMats = prod.materials || [];
        if (!selectedFacets.materials.some((m) => m === prodMat || prodMats.includes(m))) return false;
      }
      if ((selectedFacets.brands || []).length > 0 && (!prod.brand || !selectedFacets.brands.includes(prod.brand))) return false;
      if ((selectedFacets.wilayas || []).length > 0 && (!prod.wilaya || !selectedFacets.wilayas.includes(prod.wilaya))) return false;
      if ((selectedFacets.conditions || []).length > 0) {
        const cond = (prod as unknown as Record<string, unknown>).condition as string;
        if (!cond || !selectedFacets.conditions.includes(cond)) return false;
      }
      return true;
    });
  }, [categoryProducts, selectedFacets]);

  const dynamicPriceLimits = useMemo((): [number, number] => {
    const listToAnalyze = nonPriceFilteredProducts.length > 0 ? nonPriceFilteredProducts : categoryProducts;
    if (listToAnalyze.length === 0) return DEFAULT_PRICE_LIMIT;
    let min = Infinity;
    let max = -Infinity;
    listToAnalyze.forEach((p) => {
      const price = p.promoPrice || p.price || 0;
      if (price < min) min = price;
      if (price > max) max = price;
    });
    if (min === Infinity || max === -Infinity) return DEFAULT_PRICE_LIMIT;
    const roundedMin = Math.max(0, Math.floor(min / 100) * 100);
    const roundedMax = Math.ceil(max / 100) * 100;
    return roundedMin === roundedMax ? [Math.max(0, roundedMin - 1000), roundedMax + 1000] : [roundedMin, roundedMax];
  }, [nonPriceFilteredProducts, categoryProducts]);

  const [prevCategory, setPrevCategory] = useState(activeCategory);
  useEffect(() => {
    if (activeCategory !== prevCategory) {
      setPrevCategory(activeCategory);
      setIsPriceModified(false);
      setSelectedFacets((prev) => ({ ...prev, priceRange: [dynamicPriceLimits[0], dynamicPriceLimits[1]] }));
    }
  }, [activeCategory, prevCategory, dynamicPriceLimits]);

  const toggleFacet = useCallback((facetKey: ArrayFacetKey, value: string) => {
    setSelectedFacets((prev) => {
      const currentValues = (prev[facetKey] || []) as string[];
      const exists = currentValues.includes(value);
      const updated = exists ? currentValues.filter((v) => v !== value) : [...currentValues, value];
      return { ...prev, [facetKey]: updated };
    });
  }, []);

  const setBooleanFacet = useCallback((facetKey: "inStock" | "onSale" | "freeShipping" | "acceptsCod", value: boolean) => {
    setSelectedFacets((prev) => ({ ...prev, [facetKey]: value }));
  }, []);

  const setMinRating = useCallback((value: number) => {
    setSelectedFacets((prev) => ({ ...prev, minRating: value }));
  }, []);

  const setPriceRange = useCallback((range: [number, number]) => {
    setSelectedFacets((prev) => ({ ...prev, priceRange: range }));
    setIsPriceModified(true);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedFacets({
      sizes: [], colors: [], materials: [], brands: [], wilayas: [], conditions: [],
      priceRange: [dynamicPriceLimits[0], dynamicPriceLimits[1]],
      minRating: 0, inStock: false, onSale: false, freeShipping: false, acceptsCod: false,
    });
    setIsPriceModified(false);
  }, [dynamicPriceLimits]);

  const availableFacets = useMemo((): AvailableFacets => {
    const sizesMap: Record<string, number> = {};
    const colorsMap: Record<string, number> = {};
    const materialsMap: Record<string, number> = {};
    const brandsMap: Record<string, number> = {};
    const wilayasMap: Record<string, number> = {};
    const conditionsMap: Record<string, number> = {};

    categoryProducts.forEach((prod) => {
      if (Array.isArray(prod.sizes)) prod.sizes.forEach((s) => (sizesMap[s] = (sizesMap[s] || 0) + 1));
      if (Array.isArray(prod.colors)) prod.colors.forEach((c) => (colorsMap[c] = (colorsMap[c] || 0) + 1));
      if (prod.material) materialsMap[prod.material] = (materialsMap[prod.material] || 0) + 1;
      if (Array.isArray(prod.materials)) prod.materials.forEach((m) => (materialsMap[m] = (materialsMap[m] || 0) + 1));
      if (prod.brand) brandsMap[prod.brand] = (brandsMap[prod.brand] || 0) + 1;
      if (prod.wilaya) wilayasMap[prod.wilaya] = (wilayasMap[prod.wilaya] || 0) + 1;
      const cond = (prod as unknown as Record<string, unknown>).condition as string;
      if (cond) conditionsMap[cond] = (conditionsMap[cond] || 0) + 1;
    });

    const sortFn = (a: FacetOption, b: FacetOption) => b.count - a.count;
    return {
      sizes: Object.entries(sizesMap).map(([value, count]) => ({ value, count })).sort(sortFn),
      colors: Object.entries(colorsMap).map(([value, count]) => ({ value, count })).sort(sortFn),
      materials: Object.entries(materialsMap).map(([value, count]) => ({ value, count })).sort(sortFn),
      brands: Object.entries(brandsMap).map(([value, count]) => ({ value, count })).sort(sortFn),
      wilayas: Object.entries(wilayasMap).map(([value, count]) => ({ value, count })).sort(sortFn),
      conditions: Object.entries(conditionsMap).map(([value, count]) => ({ value, count })).sort(sortFn),
      minPrice: dynamicPriceLimits[0],
      maxPrice: dynamicPriceLimits[1],
    };
  }, [categoryProducts, dynamicPriceLimits]);

  const deferredSelectedFacets = useDeferredValue(selectedFacets);

  const filteredProducts = useMemo(() => {
    return categoryProducts.filter((prod) => {
      const prodPrice = prod.promoPrice || prod.price || 0;
      const [minP, maxP] = deferredSelectedFacets.priceRange || [0, Infinity];
      if (isPriceModified && (prodPrice < minP || prodPrice > maxP)) return false;
      if (deferredSelectedFacets.inStock && (prod.stock || 0) <= 0) return false;
      if (deferredSelectedFacets.onSale && (!prod.promoPrice || prod.promoPrice >= prod.price)) return false;
      if (deferredSelectedFacets.minRating > 0 && (prod.rating || prod.sellerRating || 0) < deferredSelectedFacets.minRating) return false;

      if ((deferredSelectedFacets.sizes || []).length > 0 && !deferredSelectedFacets.sizes.some((size) => (prod.sizes || []).includes(size))) return false;
      if ((deferredSelectedFacets.colors || []).length > 0 && !deferredSelectedFacets.colors.some((color) => (prod.colors || []).includes(color))) return false;
      if ((deferredSelectedFacets.materials || []).length > 0) {
        const prodMat = prod.material || "";
        const prodMats = prod.materials || [];
        if (!deferredSelectedFacets.materials.some((mat) => mat === prodMat || prodMats.includes(mat))) return false;
      }
      if ((deferredSelectedFacets.brands || []).length > 0 && (!prod.brand || !deferredSelectedFacets.brands.includes(prod.brand))) return false;
      if ((deferredSelectedFacets.wilayas || []).length > 0 && (!prod.wilaya || !deferredSelectedFacets.wilayas.includes(prod.wilaya))) return false;
      if ((deferredSelectedFacets.conditions || []).length > 0) {
        const cond = (prod as unknown as Record<string, unknown>).condition as string;
        if (!cond || !deferredSelectedFacets.conditions.includes(cond)) return false;
      }
      return true;
    });
  }, [categoryProducts, deferredSelectedFacets, isPriceModified]);

  return {
    selectedFacets,
    availableFacets,
    filteredProducts,
    toggleFacet,
    setBooleanFacet,
    setMinRating,
    setPriceRange,
    resetFilters,
    totalCount: filteredProducts.length,
    isFiltered:
      (selectedFacets.sizes || []).length > 0 ||
      (selectedFacets.colors || []).length > 0 ||
      (selectedFacets.materials || []).length > 0 ||
      (selectedFacets.brands || []).length > 0 ||
      (selectedFacets.wilayas || []).length > 0 ||
      (selectedFacets.conditions || []).length > 0 ||
      selectedFacets.minRating > 0 ||
      selectedFacets.inStock ||
      selectedFacets.onSale ||
      selectedFacets.freeShipping ||
      selectedFacets.acceptsCod ||
      isPriceModified,
  };
}
