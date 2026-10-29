import React from "react";
import { Zap, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../../utils/format";
import { getOptimizedImageUrl } from "../../../../utils/imageUtils";
import { SellerOverviewTopProduct } from "../../../../types/seller";

interface OverviewTopProductsProps {
  topProducts: SellerOverviewTopProduct[];
}

export const OverviewTopProducts: React.FC<OverviewTopProductsProps> = ({ topProducts }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 shadow-2xs p-6 sm:p-8" id="seller-top-products-card">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-base sm:text-lg font-extrabold flex items-center gap-2.5 text-[#1A1836]">
          <Zap className="w-5 h-5 text-[#E99856]" />
          <span>{t("seller.overview.top_products", "Produits les plus vendus")}</span>
        </h4>
        <button
          type="button"
          id="seller-manage-inventory-btn"
          onClick={() => navigate("/dashboard/seller/catalog")}
          className="text-xs font-extrabold text-[#A54055] hover:text-[#622347] cursor-pointer border-none bg-transparent"
        >
          {t("seller.overview.manage_inventory", "Gérer l'inventaire")} →
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topProducts.map((p, i) => (
          <div
            key={p.id || i}
            onClick={() => navigate("/dashboard/seller/catalog")}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#FAF7F8] hover:bg-[#E0B4B2]/20 border border-[#E0B4B2]/30 transition-colors group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-white border border-[#E0B4B2]/40 overflow-hidden shrink-0 shadow-2xs">
              <img
                loading="lazy"
                src={getOptimizedImageUrl(p.image, 200) || "/images/placeholders/product.svg"}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#1A1836] truncate mb-0.5">{p.name}</p>
              <p className="text-[11px] text-[#622347] font-bold tabular-nums">
                {p.count} {t("seller.overview.sales_separators", "Ventes • ")}
                {formatPrice(p.total)}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E0B4B2]/40 text-[#A54055]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        ))}
        {topProducts.length === 0 && (
          <p className="col-span-2 text-center text-xs font-semibold text-zinc-400 py-8">
            {t("seller.overview.no_products_sold", "Aucun produit vendu ce mois-ci.")}
          </p>
        )}
      </div>
    </div>
  );
};
