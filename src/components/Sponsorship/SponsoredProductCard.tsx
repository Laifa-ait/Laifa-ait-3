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
  const translatedName =
    product.translations?.[cleanLang]?.name ||
    getTranslatedField(product as unknown as Parameters<typeof getTranslatedField>[0], "name", lang) ||
    product.name;
  const translatedCategory = getCategoryTranslation(product.category || "", t);

  return (
    <Link
      ref={cardRef}
      to={`/product/${product.id}`}
      onClick={() => onClick?.(item)}
      className="group flex flex-col bg-white rounded-2xl border border-[#EFE6E6] overflow-hidden hover:shadow-[0_12px_28px_rgba(26,24,54,0.09)] hover:border-[#E0B4B2] transition-all duration-200"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-[#FAF7F6] overflow-hidden">
        {product.image ? (
          <img
            src={getOptimizedImageUrl(product.image, 400)}
            alt={translatedName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#9B879C] text-xs">
            {t("common.no_image")}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 start-2.5 flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1A1836]/85 backdrop-blur-xs text-[#E0B4B2] border border-[#E0B4B2]/30">
            <Sparkles className="w-3 h-3 text-[#E99856]" /> {t("home.sponsored.badge")}
          </span>
          {discountPercent > 0 && (
            <span className="text-[10px] font-mono tabular-nums font-extrabold px-1.5 py-0.5 rounded-lg bg-[#A54055] text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        <p className="text-[10px] uppercase font-bold text-[#6E5A6F] tracking-wider mb-0.5 truncate">
          {translatedCategory}
        </p>
        <h3 className="font-semibold text-xs sm:text-sm text-[#1A1836] line-clamp-2 mb-2 group-hover:text-[#622347] transition-colors">
          {translatedName}
        </h3>

        <div className="mt-auto pt-2 flex items-baseline justify-between border-t border-[#FAF7F6]">
          <div>
            <div className="font-extrabold text-sm text-[#1A1836] font-mono tabular-nums">
              {formatPrice(product.promoPrice || product.price)}
            </div>
            {product.promoPrice && product.promoPrice < product.price && (
              <div className="text-[10px] text-[#9B879C] line-through font-mono tabular-nums">
                {formatPrice(product.price)}
              </div>
            )}
          </div>
          {typeof product.rating === "number" && product.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#1A1836] bg-[#FAF7F6] px-1.5 py-0.5 rounded-full border border-[#EFE6E6] font-mono tabular-nums">
              <Star className="w-3 h-3 fill-[#E99856] text-[#E99856]" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
