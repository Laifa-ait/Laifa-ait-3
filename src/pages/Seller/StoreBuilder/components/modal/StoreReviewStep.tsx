import React from "react";
import { Sparkles, Layers, Palette, Store, ArrowRight, CheckCircle2 } from "lucide-react";
import { StoreConfig, CustomPageSection } from "../../../../../domains/seller/customPage.types";

interface StoreReviewStepProps {
  storeConfig: StoreConfig | null;
  sections: CustomPageSection[];
  onNext: () => void;
}

export const StoreReviewStep: React.FC<StoreReviewStepProps> = ({
  storeConfig,
  sections,
  onNext,
}) => {
  const activeSectionsCount = sections.filter((s) => s.isVisible).length;
  const theme = storeConfig?.theme;

  return (
    <div className="space-y-5">
      {/* Visual Header Banner */}
      <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200/80 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-orange-500 text-white shadow-xs shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">
            Votre vitrine personnalisée est prête pour la publication
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Vous avez configuré l'agencement et l'identité visuelle de votre boutique. Vous pouvez maintenant soumettre votre dossier à l'administration Olmart pour vérification et activation officielle.
          </p>
        </div>
      </div>

      {/* Recap Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Store className="w-4 h-4 text-orange-500" />
            <span className="font-semibold uppercase text-[10px] tracking-wider">Identité Boutique</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 truncate">
              {storeConfig?.shopName || "Ma Boutique Olmart"}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
              olmart.dz/store/{storeConfig?.shopSlug || "vendeur"}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Layers className="w-4 h-4 text-amber-500" />
            <span className="font-semibold uppercase text-[10px] tracking-wider">Structure Vitrine</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {activeSectionsCount} section{activeSectionsCount > 1 ? "s" : ""} active{activeSectionsCount > 1 ? "s" : ""}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sections prêtes et prévisualisées en haute fidélité
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 sm:col-span-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Palette className="w-4 h-4 text-orange-500" />
            <span className="font-semibold uppercase text-[10px] tracking-wider">Charte Graphique</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-600">Palette 60-30-10 :</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                  style={{ backgroundColor: theme?.canvasColor || "#F8FAFC" }}
                  title="Canvas"
                />
                <span
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                  style={{ backgroundColor: theme?.surfaceColor || "#FFFFFF" }}
                  title="Surface"
                />
                <span
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                  style={{ backgroundColor: theme?.accentColor || "#EA580C" }}
                  title="Accent CTA"
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-700 font-medium">
              Typographie : <span className="font-bold text-slate-900">{theme?.fontFamily?.split(",")[0]?.replace(/'/g, "") || "Plus Jakarta Sans"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Bullet Points */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Ce qui se passe après votre demande :
        </span>
        <ul className="space-y-1.5 text-xs text-slate-700">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Votre dossier et votre design sont transmis en temps réel à l'administration Olmart.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Votre accès complet au Studio reste actif pour continuer vos ajustements.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Après rapprochement financier du forfait DZD, votre boutique passe en ligne automatiquement.</span>
          </li>
        </ul>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Continuer vers le Choix de Formule</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
