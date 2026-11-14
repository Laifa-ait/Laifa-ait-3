import React, { useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Store,
  Palette,
  PanelTop,
  Layers,
  ShoppingBag,
  Settings,
  ArrowRight,
  Command,
} from "lucide-react";
import {
  CustomPageSection,
  SellerStoreConfig,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { StudioNavMode } from "../studio/studio.types";

interface SetupGuideInspectorPanelProps {
  storeConfig?: SellerStoreConfig | null;
  sections: CustomPageSection[];
  products: Product[];
  onSelectNavMode: (mode: StudioNavMode) => void;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  targetMode: StudioNavMode;
  ctaLabel: string;
  icon: React.ElementType;
}

export const SetupGuideInspectorPanel: React.FC<SetupGuideInspectorPanelProps> = ({
  storeConfig,
  sections,
  products,
  onSelectNavMode,
}) => {
  const steps = useMemo<SetupStep[]>(() => {
    const hasCustomIdentity = Boolean(
      storeConfig?.shopName &&
        storeConfig.shopName.trim().length > 2 &&
        storeConfig.shopName !== "Ma Boutique" &&
        storeConfig.shopSlug
    );
    const hasCustomHeaderOrAnnouncement = Boolean(
      storeConfig?.announcementBar?.enabled ||
        (storeConfig?.headerConfig?.navLinks && storeConfig.headerConfig.navLinks.length > 0)
    );
    const hasThemeConfigured = Boolean(
      storeConfig?.theme?.primaryColor && storeConfig?.theme?.fontFamily
    );
    const visibleSectionsCount = sections.filter((s) => s.isVisible !== false).length;
    const hasRichArchitecture = visibleSectionsCount >= 3;
    const hasActiveCatalog = products.length >= 1;
    const hasCommerceAndSeoConfigured = Boolean(
      (storeConfig?.commerceConfig?.codEnabled !== undefined ||
        storeConfig?.pixelsConfig?.metaPixelId ||
        storeConfig?.seo?.metaTitle) &&
        storeConfig?.wilaya
    );

    return [
      {
        id: "identity",
        title: "1. Identité de marque & Domaine URL",
        description:
          "Nom officiel, logo, bannière et votre adresse olmart.dz/store.",
        completed: hasCustomIdentity,
        targetMode: "identity",
        ctaLabel: "Personnaliser l'identité",
        icon: Store,
      },
      {
        id: "header",
        title: "2. Barre d'annonce & Menu",
        description:
          "Bandeau promotionnel en haut de page et liens du menu principal.",
        completed: hasCustomHeaderOrAnnouncement,
        targetMode: "header",
        ctaLabel: "Configurer l'en-tête",
        icon: PanelTop,
      },
      {
        id: "theme",
        title: "3. Direction artistique & Typographie",
        description:
          "Choisissez un template sectoriel ou ajustez couleurs et polices.",
        completed: hasThemeConfigured,
        targetMode: "theme",
        ctaLabel: "Ajuster le thème",
        icon: Palette,
      },
      {
        id: "sections",
        title: "4. Sections de la vitrine",
        description: `Composez au moins 3 sections visibles sur votre page d'accueil (${visibleSectionsCount}/3 actives).`,
        completed: hasRichArchitecture,
        targetMode: "sections",
        ctaLabel: "Éditer les sections",
        icon: Layers,
      },
      {
        id: "catalog",
        title: "5. Catalogue & Collections produits",
        description: `Associez vos produits actifs aux grilles de votre vitrine (${products.length} produit(s)).`,
        completed: hasActiveCatalog,
        targetMode: "catalog",
        ctaLabel: "Gérer le catalogue",
        icon: ShoppingBag,
      },
      {
        id: "commerce",
        title: "6. Livraison 69 Wilayas, COD & Pixels",
        description:
          "Seuil de livraison gratuite, commande WhatsApp, statut et pixels de suivi.",
        completed: hasCommerceAndSeoConfigured,
        targetMode: "settings",
        ctaLabel: "Configurer Commerce & SEO",
        icon: Settings,
      },
    ];
  }, [storeConfig, sections, products]);

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="flex flex-col h-full bg-white select-none">
      <div className="px-4 py-3.5 border-b border-slate-200 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-slate-900">
              Check-list de lancement
            </h2>
            <p className="text-[11px] text-slate-500">
              Complétez ces étapes avant de publier
            </p>
          </div>
          <span className="text-[11.5px] font-semibold text-slate-900 tabular-nums">
            {completedCount}/{steps.length}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
            <span>Progression globale</span>
            <span className="font-semibold text-slate-900">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-colors ${
                step.completed
                  ? "bg-slate-50/70 border-slate-200"
                  : "bg-white border-slate-300"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-[12px] font-semibold text-slate-900 leading-snug">
                      {step.title}
                    </h3>
                    <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectNavMode(step.targetMode)}
                    className={`mt-2.5 h-7 px-2.5 rounded-lg text-[11px] font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                      step.completed
                        ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <span>{step.ctaLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
          <Command className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Appuyez sur <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono font-semibold text-slate-800">⌘K</kbd> pour naviguer rapidement entre les outils.
          </p>
        </div>
      </div>
    </div>
  );
};
