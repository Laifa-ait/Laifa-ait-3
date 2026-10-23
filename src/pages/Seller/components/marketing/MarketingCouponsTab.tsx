import React from "react";
import { useTranslation } from "react-i18next";
import { Share2, Plus, Copy } from "lucide-react";
import { Coupon } from "../../../../domains/marketing/coupon.types";
import { toast } from "react-hot-toast";

interface MarketingCouponsTabProps {
  coupons: Coupon[];
  shopSlug: string;
  onOpenCouponModal: () => void;
}

export const MarketingCouponsTab: React.FC<MarketingCouponsTabProps> = ({
  coupons,
  shopSlug,
  onOpenCouponModal,
}) => {
  const { t } = useTranslation();

  const copyShareLink = (path: string) => {
    const fullUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Lien copié dans le presse-papier !");
  };

  return (
    <div className="space-y-8 text-start">
      {/* Share Links Generator */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-md">
        <div className="flex items-center gap-3">
          <Share2 className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-bold">{t("Partage Rapide de votre Boutique & Promotions")}</h3>
            <p className="text-xs text-white/90">
              {t("Générez en 1 clic des liens directs prêts à envoyer à vos clients sur WhatsApp, Instagram, Facebook ou TikTok.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{t("Lien Direct Boutique")}</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/store/${shopSlug}`}
                className="w-full bg-black/20 text-white border border-white/20 rounded-xl px-3 py-2 text-xs font-mono outline-none"
              />
              <button
                onClick={() => copyShareLink(`/store/${shopSlug}`)}
                className="p-2.5 bg-white text-orange-600 hover:bg-orange-50 rounded-xl cursor-pointer shadow-sm"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{t("Lien Catalogue Filtres & Promos")}</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/store/${shopSlug}?filter=promo`}
                className="w-full bg-black/20 text-white border border-white/20 rounded-xl px-3 py-2 text-xs font-mono outline-none"
              />
              <button
                onClick={() => copyShareLink(`/store/${shopSlug}?filter=promo`)}
                className="p-2.5 bg-white text-orange-600 hover:bg-orange-50 rounded-xl cursor-pointer shadow-sm"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Seller Coupons Section */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-950 uppercase tracking-wide">{t("Vos Coupons Vendeur Actifs")}</h3>
            <p className="text-xs text-zinc-500">{t("Les coupons créés par votre boutique s'appliquent exclusivement à vos produits.")}</p>
          </div>
          <button
            onClick={onOpenCouponModal}
            className="flex items-center gap-2 bg-zinc-950 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("Créer un Code Promo")}</span>
          </button>
        </div>

        {coupons.length === 0 ? (
          <p className="text-xs text-zinc-400 py-6 text-center">{t("Aucun coupon trouvé pour votre boutique.")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-lg">
                    {c.code}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {c.isActive ? "ACTIF" : "INACTIF"}
                  </span>
                </div>
                <p className="text-xs font-bold text-zinc-800">
                  {c.type === "percentage" ? `-${c.value}%` : `-${c.value} DZD`} de réduction
                </p>
                <p className="text-[10px] text-zinc-500">Utilisé {c.usageCount || 0} fois</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
