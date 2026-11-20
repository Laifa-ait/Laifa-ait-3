import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowUpRight } from "lucide-react";
import { ArtisticCardMaterial, ArtisticFrameShape, CustomPageTheme } from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";
import { WishlistHeartButton, ProductStockProgressBar, ProductStarRating } from "./ProductFeedEcommerceWidgets";
import { resolveCatalogProductFrameVisuals, resolveEffectiveFrameShape } from "../ArtisticFrameWrapper";
import { resolveCardMaterialClasses } from "../ArtisticAtmosphereLayer";
import { resolveShadowClass } from "./sectionStyleHelper";
import { isDarkColor, readableTextColor } from "./themeColorUtils";
import { DEFAULT_MODERN_THEME } from "../../../pages/Seller/StoreBuilder/constants/studioThemeDefaults";

interface SectionProductItemCardProps {
  product: Product;
  layoutMode?: string;
  cardStyle: string;
  aspectRatio: string;
  imagePosition: string;
  imageFit: string;
  accentColor: string;
  cardBgColor?: string;
  cardTextColor?: string;
  cardBorderColor?: string;
  priceColor?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
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

function resolveCardTokens(
  cardStyle: string,
  isList: boolean,
  isArch: boolean,
  primaryColor: string,
  cardBgColor?: string,
  cardBorderColor?: string
) {
  const outerStyle: React.CSSProperties = {
    ...(cardBgColor ? { backgroundColor: cardBgColor } : {}),
    ...(cardBorderColor ? { borderColor: cardBorderColor } : {}),
  };
  if (cardStyle === "minimal") {
    return {
      outer: "bg-transparent border-transparent shadow-none p-0 transition-transform duration-200 hover:-translate-y-0.5",
      media: isArch ? "rounded-t-[999px] rounded-b-xl" : "rounded-xl",
      body: isList ? "py-1 pe-1 flex-1" : "pt-3 pb-1 px-0.5",
      outerStyle,
    };
  }
  if (cardStyle === "bordered") {
    return {
      outer: `bg-[var(--store-surface,#FFFFFF)] border p-2.5 transition-transform duration-200 hover:-translate-y-0.5 ${isArch ? "rounded-t-[999px] rounded-b-xl" : "rounded-xl"}`,
      media: isArch ? "rounded-t-[999px] rounded-b-lg" : "rounded-lg",
      body: isList ? "py-1 pe-1 flex-1" : "pt-3 pb-1 px-1",
      outerStyle: { borderColor: cardBorderColor || `${primaryColor}45`, ...outerStyle },
    };
  }
  if (cardStyle === "elevated") {
    return {
      outer: `bg-[var(--store-surface,#FFFFFF)] border border-black/[0.05] p-2.5 shadow-[0_14px_34px_-10px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_44px_-10px_rgba(15,23,42,0.16)] ${isArch ? "rounded-t-[999px] rounded-b-xl" : "rounded-2xl"}`,
      media: isArch ? "rounded-t-[999px] rounded-b-lg" : "rounded-xl",
      body: isList ? "py-1 pe-2 flex-1" : "pt-3 pb-1 px-1",
      outerStyle,
    };
  }
  return {
    outer: `bg-[var(--store-surface,#FFFFFF)] border border-[var(--store-border,#E2E8F0)] shadow-2xs hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 overflow-hidden ${isList ? "p-2.5 rounded-xl" : isArch ? "rounded-t-[999px] rounded-b-xl" : "rounded-xl"}`,
    media: isList ? "rounded-lg" : isArch ? "rounded-t-[999px]" : "rounded-t-xl rounded-b-none",
    body: isList ? "py-1 pe-2 flex-1" : "p-3 @sm:p-3.5",
    outerStyle,
  };
}

export const SectionProductItemCard: React.FC<SectionProductItemCardProps> = ({
  product, layoutMode = "grid", cardStyle = "modern", aspectRatio = "4/5", imagePosition = "center", imageFit = "cover",
  accentColor, cardBgColor, cardTextColor, cardBorderColor, priceColor, badgeBgColor, badgeTextColor,
  cardMaterial, frameShape, showCategory = true, showStockBadge = true, showQuickWishlist = true,
  showStockProgressBar = false, showCompareAtPrice = true, showStarRating = true, theme, isEditable, triggerDesignFocus,
}) => {
  const navigate = useNavigate();
  const [imgBroken, setImgBroken] = useState(false);

  const isHorizontalList = layoutMode === "vertical" || layoutMode === "list";
  const effectiveShape = resolveEffectiveFrameShape(theme, frameShape);
  const frameVisuals = resolveCatalogProductFrameVisuals(effectiveShape, theme.borderRadiusPx);
  const aspectClass =
    aspectRatio === "1/1" ? "aspect-square" : aspectRatio === "16/9" ? "aspect-video" : aspectRatio === "4/3" ? "aspect-[4/3]" : aspectRatio === "3/4" ? "aspect-[3/4]" : "aspect-[4/5]";
  const posClass = imagePosition === "top" ? "object-top" : imagePosition === "bottom" ? "object-bottom" : "object-center";
  const fitClass = imageFit === "contain" ? "object-contain p-3 bg-slate-50" : "object-cover";

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
  const ratingValue = Number(product.stats?.averageRating || product.rating || 0);
  const primaryColor = accentColor || theme.accentColor || theme.primaryColor || `var(--store-primary, ${DEFAULT_MODERN_THEME.primaryColor})`;
  const titleColor = cardTextColor || theme.secondaryColor || `var(--store-secondary, ${DEFAULT_MODERN_THEME.secondaryColor})`;
  const resolvedPriceColor = priceColor || theme.priceColor || titleColor;
  const resolvedBadgeBg = badgeBgColor || theme.accentBadgeColor || primaryColor;
  const resolvedBadgeText = badgeTextColor || theme.badgeTextColor || readableTextColor(resolvedBadgeBg);

  const isArchShape = !isHorizontalList && (effectiveShape === "arch-minimal" || effectiveShape === "casbah-arch");
  const isGalleryFrame = !isHorizontalList && effectiveShape === "polaroid-atelier";
  const tokens = resolveCardTokens(cardStyle, isHorizontalList, isArchShape, primaryColor, cardBgColor, cardBorderColor);
  const materialClass = cardStyle !== "minimal" ? resolveCardMaterialClasses(theme.cardMaterial, cardMaterial, isDarkColor(cardBgColor || theme.surfaceColor)) : "";
  const themeShadowClass = cardStyle === "modern" && theme.cardShadow ? resolveShadowClass(theme.cardShadow) : "";

  const singleStatusLabel =
    stockCount <= 0
      ? "Rupture"
      : showCompareAtPrice !== false && discountPct > 0
      ? `-${discountPct}%`
      : stockCount <= 3
      ? `Limité (${stockCount})`
      : showStockBadge
      ? "En stock"
      : null;

  const primaryImgUrl = product.image || product.images?.[0] || "";

  const handleCardActivate = (e: React.MouseEvent<HTMLElement>) => {
    if (isEditable) {
      triggerDesignFocus?.(e, "selection");
      return;
    }
    if (e.currentTarget.closest('[data-studio-interactive="true"]')) {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent("studio:simulate-cart-add", { detail: { product } }));
      return;
    }
    navigate(`/product/${product.id}`);
  };

  return (
    <article
      id={`product-${product.id}`}
      onClick={handleCardActivate}
      style={tokens.outerStyle}
      data-testid="section-product-card"
      data-artistic-frame={effectiveShape}
      data-card-style={cardStyle}
      className={`group relative flex ${isHorizontalList ? "flex-row items-center gap-3.5 @sm:gap-5" : "flex-col h-full"} cursor-pointer select-none ${tokens.outer} ${materialClass} ${themeShadowClass}`}
    >
      <div className={`relative overflow-hidden bg-slate-100/90 shrink-0 ${isHorizontalList ? `w-28 @sm:w-36 @md:w-40 ${aspectClass} ${tokens.media}` : `w-full ${aspectClass} ${tokens.media}`}`}>
        {showQuickWishlist !== false && <WishlistHeartButton />}
        {primaryImgUrl && !imgBroken ? (
          <img
            src={primaryImgUrl} alt={product.name || "Produit"} loading="lazy" referrerPolicy="no-referrer"
            style={{ filter: "var(--section-image-filter, none)" }} onError={() => setImgBroken(true)}
            className={`w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.03] ${posClass} ${fitClass}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-slate-100 text-slate-400 text-xs px-3 text-center">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[11px] font-medium tracking-wide">Visuel produit</span>
          </div>
        )}
        {(cardStyle === "bordered" || frameVisuals.showDoubleGalleryBorder) && !isHorizontalList && (
          <div className="pointer-events-none absolute inset-2 border z-10 rounded-md" style={{ borderColor: cardBorderColor || `${primaryColor}45` }} />
        )}
        {showStockBadge && singleStatusLabel && (
          <div className={`pointer-events-none absolute z-20 ${isArchShape ? "bottom-2.5 inset-x-0 flex justify-center" : "bottom-2.5 start-2.5"}`}>
            <span data-testid="product-card-badge" style={{ backgroundColor: stockCount <= 0 ? "#be123c" : resolvedBadgeBg, color: resolvedBadgeText }} className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold tracking-wide shadow-2xs whitespace-nowrap">
              {singleStatusLabel}
            </span>
          </div>
        )}
      </div>

      <div className={`flex flex-col justify-between min-w-0 ${tokens.body}`}>
        <div>
          <div className="flex items-center justify-between gap-2">
            {showCategory ? (
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 truncate">
                {product.category ? `${product.category}${product.brand ? ` · ${product.brand}` : ""}` : "Collection"}
              </span>
            ) : <span />}
            {showStarRating && ratingValue > 0 && <ProductStarRating rating={ratingValue} reviewsCount={reviewsCount} />}
          </div>
          <h4 data-testid="product-card-title" className={`${isHorizontalList ? "text-sm @sm:text-base font-semibold line-clamp-2" : "text-[15px] font-semibold line-clamp-1"} leading-snug mt-1 break-words transition-opacity group-hover:opacity-80 ${isGalleryFrame ? "tracking-tight" : ""}`} style={{ color: titleColor }}>
            {product.name}
          </h4>
          {isHorizontalList && product.description && <p className="text-xs text-slate-500 line-clamp-1 mt-1 hidden @sm:block break-words">{product.description}</p>}
          {showStockProgressBar && (
            <div className="mt-2"><ProductStockProgressBar sold={soldCount} stock={stockCount} accentColor={primaryColor} /></div>
          )}
        </div>

        <div className="mt-2.5 flex items-baseline justify-between gap-2 pt-2 border-t border-black/[0.05]" style={{ borderColor: cardBorderColor || undefined }}>
          <div className="flex flex-wrap items-baseline gap-2 min-w-0">
            <span data-testid="product-card-price" className="text-[15px] font-bold tracking-tight tabular-nums whitespace-nowrap" style={{ color: resolvedPriceColor }}>
              {displayPrice.toLocaleString("fr-DZ")} DA
            </span>
            {showCompareAtPrice !== false && comparePrice && comparePrice > displayPrice && (
              <span className="text-xs text-slate-400 line-through tabular-nums whitespace-nowrap">{comparePrice.toLocaleString("fr-DZ")} DA</span>
            )}
          </div>
          {isHorizontalList && (
            <span style={{ color: primaryColor }} className="inline-flex items-center gap-1 text-xs font-semibold shrink-0 whitespace-nowrap">
              <span>Découvrir</span><ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
