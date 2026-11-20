import React from "react";
import { Heart, Scale, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useComparatorStore } from "../../store/useComparatorStore";
import { Product } from "../../domains/product/product.types";
import { formatPrice } from "../../utils/format";
import { getCategoryTranslation, getTranslatedField } from "../../utils/translations";
import { getOptimizedImageUrl, getFallbackSubImage } from "../../utils/imageUtils";

const getEnergyColor = (cls?: string) => {
  switch (cls) {
    case "A": return "#009640";
    case "B": return "#50B848";
    case "C": return "#C2D82E";
    case "D": return "#FFED00";
    case "E": return "#FBBA15";
    case "F": return "#EC6608";
    case "G": return "#E30613";
    default: return "#10B981";
  }
};

interface ProductCardProps {
  product: Product;
  index?: number;
  onClick?: (product: Product) => void;
  isFeatured?: boolean;
  variant?: "default" | "premium_immersive" | "flash_sale";
  sectionStyle?: string;
  styleVariant?: "clean" | "premium" | "immersive" | "glass" | "dark" | string;
  isFlashSale?: boolean;
}

export const ProductCard = React.memo(
  ({
    product,
    index: _index,
    onClick,
    isFeatured: _isFeatured = false,
    variant = "default",
    sectionStyle,
    styleVariant = "clean",
    isFlashSale: isFlashSaleProp,
  }: ProductCardProps) => {
    const { t, i18n } = useTranslation();
    const { wishlist, toggleWishlist } = useCart();
    const navigate = useNavigate();
    const lang = i18n.language;
    const isProductFlashActive = isFlashSaleProp || false;

    const {
      products: comparedProducts,
      addProduct: addToCompare,
      removeProduct: removeFromCompare,
    } = useComparatorStore();
    const isCompared = comparedProducts.some((p) => p.id === product.id);

    const defaultClick = (prod: Product) => {
      if (onClick) onClick(prod);
      else navigate(`/product/${prod.id}`);
    };

    const currentPrice = isProductFlashActive
      ? product.flashPrice || 0
      : product.promoPrice || product.price || 0;

    const hasDiscount =
      (product.promoPrice && product.promoPrice < (product.price || 0)) ||
      (isProductFlashActive && product.flashPrice && product.flashPrice < (product.price || 0)) ||
      (product.originalPrice && product.originalPrice > currentPrice);

    const originalPrice = product.originalPrice || product.price || 0;
    const discountPercent =
      hasDiscount && originalPrice > 0
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0;

    const isPremium = variant === "premium_immersive" || styleVariant === "premium";
    const isImmersive = styleVariant === "immersive";
    const isGlass = styleVariant === "glass";
    const isDark = styleVariant === "dark";
    const isElevated = styleVariant === "elevated";

    const getContainerStyles = () => {
      if (isGlass) {
        return "bg-white/92 backdrop-blur-md border border-[#E3E9E5] shadow-xs hover:shadow-md";
      }
      if (isPremium) {
        return "bg-white border-2 border-[#0D5C4B] shadow-xs hover:shadow-md hover:-translate-y-0.5";
      }
      if (isImmersive) {
        return "bg-white border-2 border-[#0F1B1D] shadow-xs hover:shadow-md hover:-translate-y-0.5";
      }
      if (isElevated) {
        return "bg-white border border-[#E3E9E5] shadow-xs hover:shadow-md hover:-translate-y-0.5";
      }
      if (isDark) {
        return "bg-[#0F1B1D] border border-[#1E3639] text-white";
      }
      return "bg-white border border-[#E3E9E5] hover:border-[#C3D3CB] shadow-[0_2px_8px_rgba(15,27,29,0.035)] hover:shadow-[0_14px_28px_rgba(15,27,29,0.08)] hover:-translate-y-0.5";
    };

    const translatedName = getTranslatedField(product, "name", lang);
    const translatedCategory = product.category
      ? getCategoryTranslation(product.category, t)
      : product.sellerName || "Olmart";
    const fallbackImg = getFallbackSubImage(`${translatedName} ${product.category || ""}`);

    return (
      <div
        className={`group flex flex-col overflow-hidden rounded-2xl transition-all duration-200 cursor-pointer h-full relative ${getContainerStyles()} ${sectionStyle || ""}`}
        onClick={() => defaultClick(product)}
      >
        {/* Photo Container */}
        <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-[#F2F5F3]">
          <img
            src={getOptimizedImageUrl(product.image, 600) || fallbackImg}
            alt={translatedName}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (target.dataset.fallbackApplied !== "1") {
                target.dataset.fallbackApplied = "1";
                target.src = fallbackImg;
              } else {
                target.src = "/images/placeholders/product.svg";
              }
            }}
          />

          {/* Top-left single clean discount or energy indicator */}
          <div className="absolute top-2.5 start-2.5 z-20 flex flex-col items-start gap-1 pointer-events-none">
            {hasDiscount && discountPercent > 0 && (
              <span className="flex items-center gap-1 bg-[#C83E4D] text-white font-mono tabular-nums font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                -{discountPercent}%
              </span>
            )}
            {product.isSponsored && !hasDiscount && (
              <span className="bg-[#0F1B1D]/85 backdrop-blur-sm text-[#E59A42] font-sans font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md">
                {t("home.sponsored.badge")}
              </span>
            )}
            {product.energyClass && (
              <span
                className="text-white font-sans font-extrabold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded shadow-xs"
                style={{ backgroundColor: getEnergyColor(product.energyClass) }}
              >
                {product.energyClass}
              </span>
            )}
          </div>

          {/* Floating actions top-right */}
          <div className="absolute top-2.5 end-2.5 z-20 flex flex-col gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              aria-label={wishlist.includes(product.id) ? t("product.remove_from_wishlist") : t("product.add_to_wishlist")}
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className="w-8 h-8 rounded-full bg-white/95 hover:bg-[#F7F8F6] backdrop-blur-sm flex items-center justify-center text-[#0F1B1D] hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer border border-[#E3E9E5]"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  wishlist.includes(product.id) ? "fill-[#C83E4D] text-[#C83E4D]" : "stroke-[2]"
                }`}
              />
            </button>
            <button
              type="button"
              aria-label={isCompared ? t("product.remove_from_compare") : t("product.add_to_compare")}
              onClick={(e) => {
                e.stopPropagation();
                if (isCompared) removeFromCompare(product.id);
                else addToCompare(product);
              }}
              className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer border ${
                isCompared
                  ? "bg-[#0D5C4B] text-white border-transparent"
                  : "bg-white/95 text-[#0F1B1D] hover:bg-[#F7F8F6] border-[#E3E9E5]"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Body: Metadata, Title, and Tabular Price */}
        <div className={`p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2 ${isDark ? "bg-[#0F1B1D]" : "bg-white"}`}>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className={`text-[10px] font-semibold uppercase tracking-wider truncate ${isDark ? "text-[#B8C8C4]" : "text-[#5F7073]"}`}>
                {translatedCategory}
              </span>
              {Number(product.rating || 0) > 0 && (
                <div className={`flex items-center gap-0.5 text-[10px] font-mono tabular-nums font-bold shrink-0 ${isDark ? "text-white" : "text-[#0F1B1D]"}`}>
                  <Star className="w-3 h-3 fill-[#E59A42] text-[#E59A42]" />
                  <span>{Number(product.rating).toFixed(1)}</span>
                </div>
              )}
            </div>

            <h3 className={`font-sans font-semibold text-xs sm:text-sm leading-snug line-clamp-2 transition-colors ${isDark ? "text-white group-hover:text-[#E59A42]" : "text-[#0F1B1D] group-hover:text-[#0D5C4B]"}`}>
              {translatedName}
            </h3>
          </div>

          {/* Bottom Row: Price */}
          <div className={`pt-2 border-t flex items-baseline justify-between gap-2 mt-auto ${isDark ? "border-[#1E3639]" : "border-[#EFF3F1]"}`}>
            <div className="flex flex-wrap items-baseline gap-1.5 min-w-0">
              <span className={`font-sans font-extrabold text-sm sm:text-base tracking-tight tabular-nums ${isDark ? "text-white" : "text-[#0F1B1D]"}`}>
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="font-sans text-[11px] text-[#839497] line-through tabular-nums">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
