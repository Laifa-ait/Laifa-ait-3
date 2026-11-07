import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowUpRight } from "lucide-react";
import {
  ArtisticCardMaterial,
  ArtisticFrameShape,
  CustomPageTheme,
} from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";
import {
  WishlistHeartButton,
  ProductStockProgressBar,
  ProductStarRating,
} from "./ProductFeedEcommerceWidgets";
import {
  resolveCatalogProductFrameVisuals,
  resolveEffectiveFrameShape,
} from "../ArtisticFrameWrapper";

interface SectionProductItemCardProps {
  product: Product;
  layoutMode?: string;
  cardStyle: string;
  aspectRatio: string;
  imagePosition: string;
  imageFit: string;
  accentColor: string;
  cardMaterial?: ArtisticCardMaterial;
  frameShape?: ArtisticFrameShape;
  showCategory?: boolean;
  showStockBadge?: boolean;
  showQuickWishlist?: boolean;
  showStockProgressBar?: boolean;
  showCompareAtPrice?: boolean;
  showStarRating?: boolean;
  ctaText?: string;
  theme: CustomPageTheme;
  isEditable?: boolean;
  triggerDesignFocus?: (e: React.MouseEvent, focusTarget: string) => void;
}

function resolveProductCardStyleTokens(cardStyle: string, isHorizontalList: boolean, isArchShape: boolean, primaryColor: string) {
  if (cardStyle === "minimal") {
    return {
      outer: "bg-transparent border-transparent shadow-none p-0 transition-all duration-300 hover:-translate-y-0.5",
      media: isArchShape ? "rounded-t-[999px] rounded-b-xl" : "rounded-2xl",
      body: isHorizontalList ? "py-1 pr-1 flex-1" : "pt-3 pb-1 px-0.5",
      outerStyle: {} as React.CSSProperties,
    };
  }
  if (cardStyle === "bordered") {
    return {
      outer: `bg-[var(--store-surface,#FFFFFF)] border-2 p-2.5 @sm:p-3 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 ${
        isArchShape ? "rounded-t-[999px] rounded-b-2xl" : "rounded-2xl"
      }`,
      media: `${isArchShape ? "rounded-t-[999px] rounded-b-xl" : "rounded-xl"} ring-1 ring-black/10`,
      body: isHorizontalList ? "py-1 pr-1 flex-1" : "pt-3 pb-1 px-1",
      outerStyle: { borderColor: `${primaryColor}55` } as React.CSSProperties,
    };
  }
  if (cardStyle === "elevated") {
    return {
      outer: `bg-[var(--store-surface,#FFFFFF)] border border-black/[0.04] p-2.5 @sm:p-3 shadow-[0_18px_42px_-8px_rgba(15,23,42,0.16),0_6px_16px_-3px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-8px_rgba(15,23,42,0.22)] ${
        isArchShape ? "rounded-t-[999px] rounded-b-2xl" : "rounded-3xl"
      }`,
      media: isArchShape ? "rounded-t-[999px] rounded-b-xl" : "rounded-2xl",
      body: isHorizontalList ? "py-1 pr-2 flex-1" : "pt-3.5 pb-1.5 px-1.5",
      outerStyle: {} as React.CSSProperties,
    };
  }
  return {
    outer: `bg-[var(--store-surface,#FFFFFF)] border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden ${
      isHorizontalList ? "p-2.5 rounded-2xl" : isArchShape ? "rounded-t-[999px] rounded-b-2xl" : "rounded-2xl"
    }`,
    media: isHorizontalList ? "rounded-xl" : isArchShape ? "rounded-t-[999px]" : "rounded-t-2xl rounded-b-none",
    body: isHorizontalList ? "py-1 pr-2 flex-1" : "p-3 @sm:p-3.5",
    outerStyle: {} as React.CSSProperties,
  };
}

export const SectionProductItemCard: React.FC<SectionProductItemCardProps> = ({
  product,
  layoutMode = "grid",
  cardStyle = "modern",
  aspectRatio = "4/5",
  imagePosition = "center",
  imageFit = "cover",
  accentColor,
  frameShape,
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
  const [imgBroken, setImgBroken] = useState(false);

  const isHorizontalList = layoutMode === "vertical" || layoutMode === "list";
  const effectiveShape = resolveEffectiveFrameShape(theme, frameShape);
  const frameVisuals = resolveCatalogProductFrameVisuals(effectiveShape, theme.borderRadiusPx);

  const aspectClass =
    aspectRatio === "1/1" ? "aspect-square" : aspectRatio === "16/9" ? "aspect-video" : aspectRatio === "4/3" ? "aspect-[4/3]" : aspectRatio === "3/4" ? "aspect-[3/4]" : "aspect-[4/5]";

  const posClass = imagePosition === "top" ? "object-top" : imagePosition === "bottom" ? "object-bottom" : "object-center";
  const fitClass = imageFit === "contain" ? "object-contain p-3 bg-zinc-50" : "object-cover";

  const rawPrice = Number(product.price || 0);
  const rawPromo = Number(product.promoPrice || 0);
  const rawOriginal = Number(product.originalPrice || 0);
  const hasPromoPrice = rawPromo > 0 && rawPromo < rawPrice;
  const displayPrice = hasPromoPrice ? rawPromo : rawPrice;
  const comparePrice = hasPromoPrice ? rawPrice : rawOriginal > displayPrice ? rawOriginal : null;
  const discountPct = comparePrice && comparePrice > displayPrice ? Math.round(((comparePrice - displayPrice) / comparePrice) * 100) : 0;

  const soldCount = Number(product.salesCount || 0);
  const stockCount = typeof product.stock === "number" ? Math.max(0, product.stock) : 1;
  const reviewsCount = Number(product.stats?.reviewCount || 0);
  const ratingValue = Number(product.stats?.averageRating || product.rating || 5);
  const primaryColor = accentColor || theme.accentColor || theme.primaryColor || "#023859";
  const titleColor = theme.secondaryColor || "#18181B";

  const isArchShape = !isHorizontalList && effectiveShape === "casbah-arch";
  const isPolaroid = !isHorizontalList && effectiveShape === "polaroid-atelier";
  const styleTokens = resolveProductCardStyleTokens(cardStyle, isHorizontalList, isArchShape, primaryColor);

  const statusPillText =
    stockCount <= 0 ? "Rupture" : showCompareAtPrice !== false && discountPct > 0 ? `-${discountPct}%` : stockCount <= 3 ? `Plus que ${stockCount}` : showStockBadge ? "En stock" : null;

  const primaryImgUrl = product.image || product.images?.[0] || "";

  return (
    <article
      onClick={(e) => (isEditable ? triggerDesignFocus?.(e, "selection") : navigate(`/product/${product.id}`))}
      style={styleTokens.outerStyle}
      data-artistic-frame={effectiveShape}
      data-card-style={cardStyle}
      className={`group relative flex ${isHorizontalList ? "flex-row items-center gap-3.5 @sm:gap-5" : "flex-col h-full"} cursor-pointer select-none ${styleTokens.outer}`}
    >
      <div
        className={`relative overflow-hidden bg-zinc-100/90 shrink-0 ${
          isHorizontalList ? `w-28 @sm:w-36 @md:w-40 ${aspectClass} ${styleTokens.media}` : `w-full ${aspectClass} ${styleTokens.media}`
        }`}
      >
        {showQuickWishlist !== false && <WishlistHeartButton />}

        {primaryImgUrl && !imgBroken ? (
          <img
            src={primaryImgUrl}
            alt=""
            loading="lazy"
            onError={() => setImgBroken(true)}
            className={`w-full h-full transition-transform duration-700 ease-out group-hover:scale-105 ${posClass} ${fitClass}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-zinc-100 text-zinc-400 text-xs px-3 text-center">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[10px] font-medium uppercase tracking-widest">Pièce d&apos;Atelier</span>
          </div>
        )}

        {(cardStyle === "bordered" || frameVisuals.showDoubleGalleryBorder) && !isHorizontalList && (
          <div className="pointer-events-none absolute inset-2 border z-10 rounded-lg" style={{ borderColor: `${primaryColor}55` }} />
        )}

        {showStockBadge && statusPillText && (
          <div className={`pointer-events-none absolute z-20 ${isArchShape ? "bottom-2.5 left-1/2 -translate-x-1/2" : "bottom-2.5 left-2.5"}`}>
            <span
              style={{ backgroundColor: stockCount <= 0 ? "#be123c" : primaryColor }}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.12em] text-white border border-white/25 shadow-sm whitespace-nowrap"
            >
              {statusPillText}
            </span>
          </div>
        )}
      </div>

      <div className={`flex flex-col justify-between min-w-0 ${styleTokens.body}`}>
        <div>
          <div className="flex items-center justify-between gap-2">
            {showCategory ? (
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 truncate">
                {product.category ? `${product.category}${product.brand ? ` · ${product.brand}` : ""}` : "Collection"}
              </span>
            ) : <span />}
            {showStarRating && ratingValue > 0 && <ProductStarRating rating={ratingValue} reviewsCount={reviewsCount} />}
          </div>
          <h4
            className={`${isHorizontalList ? "text-sm @sm:text-base font-bold line-clamp-2" : "text-sm font-semibold line-clamp-1"} leading-snug mt-1 transition-opacity group-hover:opacity-80 ${isPolaroid ? "italic font-serif" : ""}`}
            style={{ color: titleColor }}
          >
            {product.name}
          </h4>
          {isHorizontalList && product.description && (
            <p className="text-xs text-zinc-500 line-clamp-1 mt-1 hidden @sm:block">{product.description}</p>
          )}
          {showStockProgressBar && (
            <div className="mt-2">
              <ProductStockProgressBar sold={soldCount} stock={stockCount} accentColor={primaryColor} />
            </div>
          )}
        </div>

        <div className="mt-2.5 flex items-baseline justify-between gap-2 pt-1.5 border-t border-black/[0.04]">
          <div className="flex flex-wrap items-baseline gap-1.5 min-w-0">
            <span className="text-sm @sm:text-base font-extrabold tracking-tight tabular-nums whitespace-nowrap" style={{ color: titleColor }}>
              {displayPrice.toLocaleString("fr-DZ")} DA
            </span>
            {showCompareAtPrice !== false && comparePrice && comparePrice > displayPrice && (
              <span className="text-xs text-zinc-400 line-through tabular-nums whitespace-nowrap">
                {comparePrice.toLocaleString("fr-DZ")} DA
              </span>
            )}
          </div>
          {isHorizontalList ? (
            <span
              style={{ color: primaryColor, borderColor: `${primaryColor}35` }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-slate-50/80 shrink-0"
            >
              <span>Découvrir</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          ) : (
            showStockBadge && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-zinc-600 shrink-0">
                <span style={{ backgroundColor: stockCount > 0 ? primaryColor : "#f43f5e" }} className="w-2 h-2 rounded-full" />
                <span className="hidden @sm:inline">{stockCount > 0 ? "En stock" : "Rupture"}</span>
              </span>
            )
          )}
        </div>
      </div>
    </article>
  );
};
