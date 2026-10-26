import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { CustomPageTheme } from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";
import {
  WishlistHeartButton,
  ProductStockProgressBar,
  ProductStarRating,
} from "./ProductFeedEcommerceWidgets";

interface SectionProductItemCardProps {
  product: Product;
  cardStyle: string;
  aspectRatio: string;
  imagePosition: string;
  imageFit: string;
  accentColor: string;
  showCategory?: boolean;
  showStockBadge?: boolean;
  showCtaButton?: boolean;
  ctaLabel?: string;
  showQuickWishlist?: boolean;
  showColorSwatches?: boolean;
  showSizeChips?: boolean;
  showStockProgressBar?: boolean;
  showCompareAtPrice?: boolean;
  showStarRating?: boolean;
  theme: CustomPageTheme;
  isEditable?: boolean;
  triggerDesignFocus?: (e: React.MouseEvent, focusTarget: string) => void;
}

export const SectionProductItemCard: React.FC<SectionProductItemCardProps> = ({
  product,
  cardStyle,
  aspectRatio,
  imagePosition,
  imageFit,
  accentColor,
  showCategory = true,
  showStockBadge = true,
  showQuickWishlist = true,
  showStockProgressBar = false,
  showCompareAtPrice = true,
  showStarRating = true,
  theme,
  isEditable,
  triggerDesignFocus,
}) => {
  const navigate = useNavigate();

  const aspectClass =
    aspectRatio === "1/1"
      ? "aspect-square"
      : aspectRatio === "4/3"
      ? "aspect-[4/3]"
      : aspectRatio === "16/9"
      ? "aspect-video"
      : aspectRatio === "3/4"
      ? "aspect-[3/4]"
      : "aspect-[4/5]";

  const posClass =
    imagePosition === "top"
      ? "object-top"
      : imagePosition === "bottom"
      ? "object-bottom"
      : "object-center";

  const fitClass =
    imageFit === "contain" ? "object-contain p-2.5 bg-slate-50" : "object-cover";

  const rawPrice = Number(product.price || 0);
  const rawPromo = Number(product.promoPrice || 0);
  const rawOriginal = Number(product.originalPrice || 0);

  const hasPromoPrice = rawPromo > 0 && rawPromo < rawPrice;
  const displayPrice = hasPromoPrice ? rawPromo : rawPrice;

  // Strictly real compare-at price: never fabricate a 1.2x price
  const comparePrice =
    hasPromoPrice
      ? rawPrice
      : rawOriginal > displayPrice
      ? rawOriginal
      : null;

  const discountPct =
    comparePrice && comparePrice > displayPrice
      ? Math.round(((comparePrice - displayPrice) / comparePrice) * 100)
      : 0;

  const soldCount = Number(product.salesCount || 0);
  const stockCount = typeof product.stock === "number" ? Math.max(0, product.stock) : 1;

  // Strictly real rating: only display stars if the product has genuine ratings
  const reviewsCount = Number(product.stats?.reviewCount || 0);
  const ratingValue = Number(product.stats?.averageRating || product.rating || 0);
  const hasRealRating = ratingValue > 0 && (reviewsCount > 0 || Number(product.rating || 0) > 0);

  const primaryColor = accentColor || theme.primaryColor || "#023859";
  const titleColor = theme.secondaryColor || "#011C40";

  const handleCardClick = (e: React.MouseEvent) => {
    if (isEditable) {
      triggerDesignFocus?.(e, "selection");
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const containerStyleClass =
    cardStyle === "minimal"
      ? "bg-transparent rounded-xl"
      : cardStyle === "bordered"
      ? "bg-white border border-slate-300 hover:border-[#26658C] rounded-2xl p-2.5 transition-all"
      : cardStyle === "elevated"
      ? "bg-white border border-slate-100 shadow-[0_8px_24px_rgba(1,28,64,0.06)] hover:shadow-[0_14px_30px_rgba(1,28,64,0.12)] hover:-translate-y-0.5 rounded-2xl p-2.5 transition-all"
      : "bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 rounded-2xl overflow-hidden transition-all";

  const imageRadiusClass =
    cardStyle === "modern" ? "rounded-none" : "rounded-xl";

  const detailsPaddingClass =
    cardStyle === "modern"
      ? "p-3 @sm:p-3.5"
      : cardStyle === "minimal"
      ? "pt-2.5 px-0.5 pb-1"
      : "pt-2.5 px-1 pb-1";

  return (
    <article
      onClick={handleCardClick}
      className={`group relative flex flex-col h-full cursor-pointer select-none ${containerStyleClass}`}
    >
      {/* Product Image Container */}
      <div
        className={`relative w-full overflow-hidden bg-slate-100 ${aspectClass} ${imageRadiusClass}`}
      >
        {showQuickWishlist !== false && <WishlistHeartButton />}

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 ${posClass} ${fitClass}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-slate-100 text-slate-400 text-xs">
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[10px] font-medium">Sans image</span>
          </div>
        )}

        {/* Top-left Status & Real Discount Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1 pointer-events-none">
          {showCompareAtPrice !== false && discountPct > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-extrabold tracking-tight shadow-2xs">
              -{discountPct}%
            </span>
          )}
          {showStockBadge && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-2xs backdrop-blur-xs ${
                stockCount <= 0 ? "bg-rose-600/95" : ""
              }`}
              style={{
                backgroundColor: stockCount > 0 ? primaryColor : undefined,
              }}
            >
              {stockCount > 0 ? "En stock" : "Rupture"}
            </span>
          )}
        </div>
      </div>

      {/* Product Authentic Information */}
      <div className={`flex flex-1 flex-col justify-between gap-2 ${detailsPaddingClass}`}>
        <div className="space-y-1">
          {/* Category + Real Rating Row */}
          {( (showCategory && product.category) || (showStarRating && hasRealRating) ) && (
            <div className="flex items-center justify-between gap-1.5">
              {showCategory && product.category ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  {product.category}
                  {product.brand ? ` · ${product.brand}` : ""}
                </span>
              ) : (
                <span />
              )}
              {showStarRating && hasRealRating && (
                <ProductStarRating rating={ratingValue} reviewsCount={reviewsCount} />
              )}
            </div>
          )}

          {/* Product Name */}
          <h4
            className="text-xs @sm:text-sm font-bold leading-snug line-clamp-2 transition-colors group-hover:opacity-85"
            style={{ color: titleColor }}
          >
            {product.name}
          </h4>

          {/* Optional Stock Progress Bar (only real stock & sales) */}
          {showStockProgressBar && (
            <ProductStockProgressBar
              sold={soldCount}
              stock={stockCount}
              accentColor={primaryColor}
            />
          )}
        </div>

        {/* Full-Width Clean Price Footer (No redundant CTA button) */}
        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between gap-2 mt-auto">
          <div className="flex flex-wrap items-baseline gap-1.5 min-w-0">
            <span
              className="text-sm @sm:text-base font-extrabold tracking-tight tabular-nums whitespace-nowrap"
              style={{ color: titleColor }}
            >
              {displayPrice.toLocaleString("fr-DZ")} DA
            </span>
            {showCompareAtPrice !== false && comparePrice && comparePrice > displayPrice && (
              <span className="text-[11px] font-medium text-slate-400 line-through tabular-nums whitespace-nowrap">
                {comparePrice.toLocaleString("fr-DZ")} DA
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
