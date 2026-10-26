import React from "react";
import { Clock, Flame, Heart, ShieldCheck } from "lucide-react";
import { CustomPageSection } from "../../../../../domains/seller/customPage.types";

interface ThemeEcommerceWidgetsTabProps {
  sections: CustomPageSection[];
  onUpdateSection: (id: string, patch: Partial<CustomPageSection>) => void;
  onReplaceSections?: (sections: CustomPageSection[]) => void;
}

export const ThemeEcommerceWidgetsTab: React.FC<ThemeEcommerceWidgetsTabProps> = ({
  sections,
  onUpdateSection,
  onReplaceSections,
}) => {
  const productFeedSections = sections.filter((s) =>
    ["featured_products", "new_arrivals", "best_sellers", "product_grid"].includes(s.type)
  );

  const heroSections = sections.filter((s) => s.type === "hero_banner");

  const patchAllFeeds = (patchSettings: Record<string, unknown>) => {
    if (onReplaceSections) {
      const nextSections = sections.map((sec) => {
        if (!["featured_products", "new_arrivals", "best_sellers", "product_grid"].includes(sec.type)) {
          return sec;
        }
        const currentSettings = (sec.settings || {}) as Record<string, unknown>;
        return {
          ...sec,
          settings: {
            ...currentSettings,
            ...patchSettings,
          } as unknown as CustomPageSection["settings"],
        };
      });
      onReplaceSections(nextSections);
      return;
    }

    productFeedSections.forEach((sec) => {
      const currentSettings = (sec.settings || {}) as Record<string, unknown>;
      onUpdateSection(sec.id, {
        settings: {
          ...currentSettings,
          ...patchSettings,
        } as unknown as CustomPageSection["settings"],
      });
    });
  };

  const hasCountdown = productFeedSections.some((s) => (s.settings as Record<string, unknown>)?.showCountdown === true);
  const hasStockProgress = productFeedSections.some((s) => (s.settings as Record<string, unknown>)?.showStockProgress === true);
  const hasWishlist = productFeedSections.some((s) => (s.settings as Record<string, unknown>)?.showWishlistButton !== false);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-[#F8FBFC] p-3 text-[12px] text-[#011C40]">
        <p className="font-bold flex items-center gap-1.5 text-[#011C40]">
          <Flame className="w-3.5 h-3.5 text-[#023859]" />
          <span>Options E-Commerce Globales</span>
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Activez ou désactivez en un clic les indicateurs réels sur toutes vos grilles de produits.
        </p>
      </div>

      {/* Widget 1: Flash Countdown */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#023859]">
              <Clock className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-[#011C40]">Compte à Rebours Offre</h5>
              <p className="text-[11px] text-slate-500 truncate">Bannière timer (Jours : Heures : Min : Sec)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => patchAllFeeds({ showCountdown: !hasCountdown })}
            className={`h-7 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              hasCountdown
                ? "bg-[#023859] text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {hasCountdown ? "Activé" : "Désactivé"}
          </button>
        </div>
      </div>

      {/* Widget 2: Stock Progress Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#023859]">
              <Flame className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-[#011C40]">Jauges de Stock Réel</h5>
              <p className="text-[11px] text-slate-500 truncate">Barre de disponibilité basée sur le stock réel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => patchAllFeeds({ showStockProgress: !hasStockProgress })}
            className={`h-7 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              hasStockProgress
                ? "bg-[#023859] text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {hasStockProgress ? "Activé" : "Désactivé"}
          </button>
        </div>
      </div>

      {/* Widget 3: Wishlist & Real Star Ratings */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#023859]">
              <Heart className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-[#011C40]">Boutons Favoris & Avis Réels</h5>
              <p className="text-[11px] text-slate-500 truncate">Cœur favoris et note client vérifiée</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              patchAllFeeds({
                showWishlistButton: !hasWishlist,
                showRatingStars: !hasWishlist,
              })
            }
            className={`h-7 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              hasWishlist
                ? "bg-[#023859] text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {hasWishlist ? "Activé" : "Désactivé"}
          </button>
        </div>
      </div>

      {/* Widget 4: Social Proof Badge */}
      {heroSections.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#023859]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h5 className="text-xs font-bold text-[#011C40]">Mention de Confiance sur la Bannière</h5>
              <p className="text-[11px] text-slate-500">Texte de réassurance affiché sur la bannière Hero</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="Ex: Qualité garantie · Livraison rapide 58 Wilayas"
            value={((heroSections[0]?.settings as Record<string, unknown>)?.socialProofBadge as string) || ""}
            onChange={(e) => {
              const val = e.target.value;
              heroSections.forEach((h) => {
                const s = (h.settings || {}) as Record<string, unknown>;
                onUpdateSection(h.id, {
                  settings: { ...s, socialProofBadge: val } as unknown as CustomPageSection["settings"],
                });
              });
            }}
            className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:border-[#023859] focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
