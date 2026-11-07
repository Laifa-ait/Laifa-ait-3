import React, { useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Rocket,
  Store,
  Palette,
  PanelTop,
  Layers,
  ShoppingBag,
  Settings,
  ArrowRight,
  Sparkles,
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
          "Définissez le nom officiel, le logo, la bannière et votre adresse olmart.dz/boutique.",
        completed: hasCustomIdentity,
        targetMode: "identity",
        ctaLabel: "Personnaliser l'identité",
        icon: Store,
      },
      {
        id: "header",
        title: "2. Barre d'annonce & Menu de navigation",
        description:
          "Configurez votre bandeau promotionnel en haut de page et les liens du menu principal.",
        completed: hasCustomHeaderOrAnnouncement,
        targetMode: "header",
        ctaLabel: "Configurer l'en-tête",
        icon: PanelTop,
      },
      {
        id: "theme",
        title: "3. Direction artistique & Typographie",
        description:
          "Choisissez un archétype sectoriel ou ajustez vos couleurs, rayons de bordure et polices.",
        completed: hasThemeConfigured,
        targetMode: "theme",
        ctaLabel: "Ajuster le thème",
        icon: Palette,
      },
      {
        id: "sections",
        title: "4. Architecture OS 2.0 (Sections & Blocs)",
        description: `Composez au moins 3 sections visibles sur votre page d'accueil (${visibleSectionsCount}/3 actives).`,
        completed: hasRichArchitecture,
        targetMode: "sections",
        ctaLabel: "Éditer les sections",
        icon: Layers,
      },
      {
        id: "catalog",
        title: "5. Catalogue & Collections produits",
        description: `Associez vos produits actifs aux grilles de votre vitrine (${products.length} produit(s) détecté(s)).`,
        completed: hasActiveCatalog,
        targetMode: "catalog",
        ctaLabel: "Gérer le catalogue",
        icon: ShoppingBag,
      },
      {
        id: "commerce",
        title: "6. Livraison 69 Wilayas, COD & Pixels",
        description:
          "Seuil de livraison gratuite, commande WhatsApp, statut boutique et pixels Meta/TikTok.",
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
    <div className="flex flex-col h-full bg-[#FFFFFF] select-none">
      <div className="p-4 border-b border-[#E4E7EC] bg-gradient-to-br from-[#011C40] to-[#023859] text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#A7EBF2]">
            <Rocket className="w-3.5 h-3.5" />
            Studio Vendeur 3.0 • Launchpad
          </span>
          <span className="text-[12px] font-extrabold bg-white/15 px-2 py-0.5 rounded-full">
            {completedCount}/{steps.length} étapes
          </span>
        </div>
        <h2 className="text-[15px] font-bold text-white leading-snug">
          Guide de création de boutique
        </h2>
        <p className="text-[12px] text-white/80 mt-0.5">
          Contrôle total inspiré de Shopify Online Store 2.0
        </p>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
            <span className="text-[#A7EBF2]">Progression de configuration</span>
            <span className="text-white font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#54ACBF] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all ${
                step.completed
                  ? "bg-[#F8FAFC] border-[#E2E8F0]"
                  : "bg-white border-[#CBD5E1] shadow-2xs"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#023859]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-[12.5px] font-bold text-[#0F172A] leading-snug">
                      {step.title}
                    </h3>
                    <Icon className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                  </div>
                  <p className="text-[11.5px] text-[#475569] mt-1 leading-relaxed">
                    {step.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectNavMode(step.targetMode)}
                    className={`mt-2.5 h-7 px-2.5 rounded-lg text-[11.5px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                      step.completed
                        ? "bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#F1F5F9]"
                        : "bg-[#023859] text-white hover:bg-[#011C40]"
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

        <div className="p-3 rounded-xl bg-[#F0F7FA] border border-[#B8DCE8] flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#023859] shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-[#011C40] leading-relaxed">
            <strong>Astuce Raccourci :</strong> Appuyez sur <kbd className="px-1.5 py-0.5 bg-white border border-[#CBD5E1] rounded text-[10px] font-bold">⌘K</kbd> ou <kbd className="px-1.5 py-0.5 bg-white border border-[#CBD5E1] rounded text-[10px] font-bold">Ctrl+K</kbd> à tout moment pour ouvrir la palette de commandes rapide.
          </p>
        </div>
      </div>
    </div>
  );
};
