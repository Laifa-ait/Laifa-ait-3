import React from "react";
import { Truck, ShieldCheck, Clock, RotateCcw } from "lucide-react";
import { PublicStoreInfo } from "../../pages/Public/StoreProfile";

interface StoreTrustBadgesProps {
  storeInfo: PublicStoreInfo;
}

export const StoreTrustBadges: React.FC<StoreTrustBadgesProps> = ({ storeInfo }) => {
  const prepTime = storeInfo.avgPreparationTime || "Expédition sous 24h - 48h";
  const returnPolicy = storeInfo.returnPolicy || "Selon les modalités de la boutique";

  const badges = [
    { icon: Truck, title: "69 Wilayas", sub: "Livraison à domicile & Stop-Desk" },
    { icon: ShieldCheck, title: "Vendeur Vérifié", sub: "Paiement à la livraison" },
    { icon: Clock, title: "Préparation Soignée", sub: prepTime },
    { icon: RotateCcw, title: "Échanges & Retours", sub: returnPolicy },
  ];

  return (
    <div
      style={{ fontFamily: "var(--store-font-body, inherit)" }}
      className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 py-3 sm:py-4"
    >
      {badges.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            style={{
              backgroundColor: "var(--store-surface, #FFFFFF)",
              borderRadius: "var(--store-border-radius, 12px)",
              color: "var(--store-secondary, #0F172A)",
            }}
            className="flex items-center gap-2.5 p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs transition-colors"
          >
            <div
              style={{
                backgroundColor: "var(--store-canvas, #F8FAFC)",
                color: "var(--store-primary, #0F172A)",
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p
                style={{ fontFamily: "var(--store-font-heading, inherit)" }}
                className="text-[11px] font-black leading-tight"
              >
                {item.title}
              </p>
              <p className="text-[10px] opacity-75 truncate">{item.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
