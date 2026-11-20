import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PublicSponsoredProductDTO } from "../../types/sponsoredCampaign";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import { formatPrice } from "../../utils/format";
import { getCategoryTranslation, getTranslatedField } from "../../utils/translations";

interface SponsoredProductCardProps {
  item: PublicSponsoredProductDTO;
  onImpression?: (item: PublicSponsoredProductDTO) => void;
  onClick?: (item: PublicSponsoredProductDTO) => void;
}

export const SponsoredProductCard: React.FC<SponsoredProductCardProps> = ({
  item,
  onImpression,
  onClick,
}) => {
  const { t, i18n } = useTranslation();
  const cardRef = useRef<HTMLAnchorElement>(null);
  const impressionSentRef = useRef(false);
  const { product } = item;
  const lang = i18n.language || "fr";

  useEffect(() => {
    const el = cardRef.current;
    if (!el || impressionSentRef.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionSentRef.current) {
            impressionSentRef.current = true;
            onImpression?.(item);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [item, onImpression]);

  const discountPercent =
    product.promoPrice && product.price > product.promoPrice
      ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
      : 0;

  const cleanLang = lang.split("-")[0] as "fr" | "ar" | "en";
  const productTranslations = (product as unknown as { translations?: Record<string, { name?: string }> }).translations;
  const translatedName =
    productTranslations?.[cleanLang]?.name ||
    getTranslatedField(product as unknown as Parameters<typeof getTranslatedField>[0], "name", lang) ||
    product.name;
  const translatedCategory = getCategoryTranslation(product.category || "", t);

  return (
    <Link
      ref={cardRef}
      to={`/product/${product.id}`}
      onClick={() => onClick?.(item)}
      className="group flex flex-col bg-white rounded-2xl border border-[#E3E9E5] overflow-hidden hover:shadow-[0_12px_28px_rgba(15,27,29,0.08)] hover:border-[#C3D3CB] transition-all duration-200"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-[#F2F5F3] overflow-hidden">
        {product.image ? (
          <img
            src={getOptimizedImageUrl(product.image, 400)}
            alt={translatedName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#839497] text-xs">
            {t("common.no_image")}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 start-2.5 flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0F1B1D]/88 backdrop-blur-xs text-[#E59A42] border border-white/10">
            <Sparkles className="w-3 h-3 text-[#E59A42]" /> {t("home.sponsored.badge")}
          </span>
          {discountPercent > 0 && (
            <span className="text-[10px] font-mono tabular-nums font-extrabold px-1.5 py-0.5 rounded-md bg-[#C83E4D] text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        <p className="text-[10px] uppercase font-bold text-[#5F7073] tracking-wider mb-0.5 truncate">
          {translatedCategory}
        </p>
        <h3 className="font-semibold text-xs sm:text-sm text-[#0F1B1D] line-clamp-2 mb-2 group-hover:text-[#0D5C4B] transition-colors">
          {translatedName}
        </h3>

        <div className="mt-auto pt-2 flex items-baseline justify-between border-t border-[#EFF3F1]">
          <div>
            <div className="font-extrabold text-sm text-[#0F1B1D] font-mono tabular-nums">
              {formatPrice(product.promoPrice || product.price)}
            </div>
            {product.promoPrice && product.promoPrice < product.price && (
              <div className="text-[10px] text-[#839497] line-through font-mono tabular-nums">
                {formatPrice(product.price)}
              </div>
            )}
          </div>
          {typeof product.rating === "number" && product.rating > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#2E4144] font-mono tabular-nums">
              <Star className="w-3 h-3 fill-[#E59A42] text-[#E59A42]" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
