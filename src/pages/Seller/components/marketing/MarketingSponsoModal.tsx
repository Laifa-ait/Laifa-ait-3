import React from "react";
import { useTranslation } from "react-i18next";
import { CreditCard } from "lucide-react";
import { Product } from "../../../../domains/product/product.types";
import { AdSpotConfig } from "../../../../domains/seller/services/sellerMarketing.service";
import { SponsorshipTier } from "../../../../domains/seller/sponsorship.types";

interface MarketingSponsoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSpot: AdSpotConfig | null;
  products: Product[];
  sponsoForm: {
    productId: string;
    tier: SponsorshipTier;
    durationDays: number;
    paymentProofReference: string;
  };
  setSponsoForm: React.Dispatch<
    React.SetStateAction<{
      productId: string;
      tier: SponsorshipTier;
      durationDays: number;
      paymentProofReference: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
}

export const MarketingSponsoModal: React.FC<MarketingSponsoModalProps> = ({
  isOpen,
  onClose,
  selectedSpot,
  products,
  sponsoForm,
  setSponsoForm,
  onSubmit,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 max-h-[90vh] overflow-y-auto text-start">
        <h3 className="text-xl font-bold text-zinc-950">
          {selectedSpot ? `Réserver: ${selectedSpot.title}` : t("Demande de Publicité Sponsorisée")}
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">{t("Produit à mettre en avant")}</label>
            <select
              required
              value={sponsoForm.productId}
              onChange={(e) => setSponsoForm({ ...sponsoForm, productId: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold outline-none"
            >
              <option value="">-- Choisir un produit --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.price} DZD)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">{t("Sélectionner un Pack")}</label>
            <select
              value={sponsoForm.tier}
              onChange={(e) => setSponsoForm({ ...sponsoForm, tier: e.target.value as SponsorshipTier })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold outline-none"
            >
              <option value="bronze">Pack Bronze (7 jours)</option>
              <option value="silver">Pack Silver (14 jours)</option>
              <option value="gold">Pack Gold (30 jours)</option>
            </select>
          </div>

          {/* Payment Instructions CCP / BaridiMob */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-amber-900 text-xs">
            <p className="font-bold flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Instructions de Règlement (CCP / BaridiMob / RIB) :</span>
            </p>
            <p className="font-mono text-[11px]">
              CCP: 0021948123-98 • RIP: 00799999002194812398<br />
              BaridiMob: 00799999002194812398
            </p>
            <p className="text-[10px] text-amber-700">
              Après virement, indiquez la référence du récépissé ci-dessous pour validation administrative Olmart.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">{t("Référence du Virement / Reçu")}</label>
            <input
              type="text"
              required
              placeholder="Ex: CCP-928104 / BM-819203"
              value={sponsoForm.paymentProofReference}
              onChange={(e) => setSponsoForm({ ...sponsoForm, paymentProofReference: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 cursor-pointer"
            >
              {t("Annuler")}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 cursor-pointer"
            >
              {t("Soumettre la Demande")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
