import React from "react";
import { ArrowRight, Star, MapPin, Truck, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../domains/product/product.types";
import { formatPrice } from "../../utils/format";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

interface SearchProductCardProps {
  product: Product;
  query: string;
  onSelect: (productId: string, name: string) => void;
}

export const SearchProductCard: React.FC<SearchProductCardProps> = ({
  product,
  query,
  onSelect,
}) => {
  const { t } = useTranslation();
  const name = product.name || "";
  const price = product.promoPrice || product.price || 0;
  const originalPrice =
    product.originalPrice || (product.promoPrice ? product.price : null);
  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const highlightMatch = (text: string, q?: string) => {
    const safeText = String(text || "");
    const safeQ = String(q || "").trim();
    if (!safeQ) return safeText;
    const parts = safeText.split(
      new RegExp(`(${safeQ.replace(/[.+*?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    );
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === safeQ.toLowerCase() ? (
            <mark
              key={i}
              className="text-orange-950 bg-orange-100 font-black px-0.5 rounded"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock =
    product.stock !== undefined && product.stock > 0 && product.stock <= 3;

  return (
    <button
      type="button"
      onClick={() => onSelect(product.id, name)}
      className="w-full text-left p-2.5 sm:p-3 hover:bg-orange-50/40 border border-slate-200/90 hover:border-orange-300 flex items-center gap-3 group transition-all duration-200 rounded-2xl outline-none bg-white cursor-pointer shadow-2xs hover:shadow-md relative overflow-hidden"
    >
      {/* Product Image */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80 relative">
        <img
          loading="lazy"
          src={getOptimizedImageUrl(product.image, 300)}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discountPercent > 0 && (
          <span className="absolute top-1 left-1 bg-gradient-to-r from-orange-500 to-rose-600 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
            -{discountPercent}%
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute inset-0 bg-slate-900/70 text-white text-[10px] font-bold flex items-center justify-center text-center p-1">
            {t("out_of_stock", "Épuisé")}
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-col text-left overflow-hidden min-w-0 flex-1 py-0.5">
        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-bold">
          <span className="uppercase tracking-wider text-orange-600 font-extrabold truncate max-w-[140px]">
            {t(product.category, product.category)}
          </span>
          {product.wilaya && (
            <span className="flex items-center gap-0.5 text-slate-500 shrink-0">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>W.{product.wilaya}</span>
            </span>
          )}
        </div>

        <h4 className="font-extrabold text-[13px] sm:text-[14px] text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1 sm:line-clamp-2 leading-snug mt-0.5">
          {highlightMatch(name, query)}
        </h4>

        {/* Pricing & Badges */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-sm sm:text-base font-black text-slate-950 tracking-tight">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-slate-400 line-through font-semibold">
              {formatPrice(originalPrice)}
            </span>
          )}
          {product.rating ? (
            <span className="flex items-center gap-0.5 text-amber-600 font-bold text-xs ms-auto">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10.5px] text-emerald-700 font-bold ms-auto">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{t("verified", "Vérifié")}</span>
            </span>
          )}
        </div>

        {/* Delivery / Stock pill */}
        <div className="flex items-center gap-2 mt-1 text-[10.5px] text-slate-500">
          <span className="flex items-center gap-1 text-slate-600 font-semibold">
            <Truck className="w-3 h-3 text-emerald-600" />
            <span>Livraison 58 wilayas</span>
          </span>
          {isLowStock && (
            <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded">
              Plus que {product.stock}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 p-1.5 rounded-full bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-rose-600 text-slate-500 group-hover:text-white transition-all">
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
};
