import React, { useEffect } from "react";
import {
  Sliders,
  Type,
  SlidersHorizontal,
  Layout,
  Smartphone,
  Settings,
  ChevronRight,
  X,
} from "lucide-react";
import {
  CustomPageSection,
  CustomPageSectionStyles,
  CustomPageTheme,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import { SectionContentTab } from "./SectionContentTab";
import { SectionStyleTab } from "./SectionStyleTab";
import { SectionLayoutTab } from "./SectionLayoutTab";
import { SectionResponsiveTab } from "./SectionResponsiveTab";
import { SectionAdvancedTab } from "./SectionAdvancedTab";
import { useStudioStore } from "../../store/useStudioStore";

interface SectionInspectorPanelProps {
  section: CustomPageSection | null;
  sections?: CustomPageSection[];
  products: Product[];
  currentTheme?: CustomPageTheme;
  onUpdateSection: (sectionId: string, updates: Partial<CustomPageSection>) => void;
}

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero_banner: "Bannière Principale",
  promo_carousel: "Carrousel Promotionnel",
  featured_categories: "Rayons & Catégories",
  curated_collections: "Collections Privées",
  new_arrivals: "Nouveautés",
  featured_products: "Sélection de Produits",
  best_sellers: "Meilleures Ventes",
  product_grid: "Catalogue Produits",
  brand_story: "Histoire de la Maison",
  showcase_video: "Vidéo de Présentation",
  verified_reviews: "Avis Clients Vérifiés",
  delivery_info: "Tarifs de Livraison",
  return_policy: "Politique de Retour",
  faq_accordion: "Questions Fréquentes",
  contact_footer: "Pied de Page & Contact",
};

const SUB_ELEMENT_LABELS: Record<string, string> = {
  background: "Fond & Image",
  badge: "Badge Sur-titre",
  title: "En-tête & Titre",
  subtitle: "Sous-titre",
  cta: "Bouton Principal",
  ctaPrimary: "Bouton Principal",
  ctaSecondary: "Bouton Secondaire",
  "category-style": "Style & Grille",
  "category-presets": "Modèles",
  "product-layout": "Disposition Grille",
  "product-card-design": "Design des Cartes",
  "countdown-card": "Chrono Offre",
  countdown: "Chrono Offre",
  selection: "Sélection Produits",
  cascade: "Disposition & Grille",
};

function formatSubElementLabel(sub: string): string {
  if (SUB_ELEMENT_LABELS[sub]) return SUB_ELEMENT_LABELS[sub];
  if (sub.startsWith("slide-")) return `Slide ${parseInt(sub.replace("slide-", ""), 10) + 1}`;
  if (sub.startsWith("cat-") || sub.startsWith("category-items:")) {
    const raw = sub.includes(":") ? sub.split(":")[1] : sub.replace("cat-", "");
    return `Catégorie #${parseInt(raw, 10) + 1}`;
  }
  if (sub.startsWith("faq-")) return `Question FAQ #${parseInt(sub.replace("faq-", ""), 10) + 1}`;
  return sub;
}

export const SectionInspectorPanel: React.FC<SectionInspectorPanelProps> = ({
  section,
  sections = [],
  products,
  currentTheme,
  onUpdateSection,
}) => {
  const activeTab = useStudioStore((s) => s.activeInspectorTab);
  const setActiveTab = useStudioStore((s) => s.setActiveInspectorTab);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const selectSection = useStudioStore((s) => s.selectSection);

  useEffect(() => {
    if (selectedSubElement && activeTab !== "content") {
      setActiveTab("content");
    }
  }, [selectedSubElement, activeTab, setActiveTab]);

  if (!section) {
    return (
      <div className="w-full bg-white p-6 text-center text-[14px] flex flex-col items-center justify-center h-full space-y-3 min-w-0 min-h-0">
        <div className="w-12 h-12 rounded-xl bg-[#F8FBFC] text-[#023859] border border-slate-200 flex items-center justify-center">
          <Sliders className="w-5 h-5" />
        </div>
        <p className="font-bold text-[14px] text-[#011C40]">Inspecteur de Propriétés</p>
        <p className="text-[13px] text-slate-500 leading-relaxed max-w-xs">
          Cliquez directement sur une section dans l&apos;aperçu ou dans la liste pour la personnaliser.
        </p>
      </div>
    );
  }

  const handleSettingsChange = (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => {
    onUpdateSection(section.id, {
      settings:
        typeof fieldOrPatch === "string"
          ? { ...section.settings, [fieldOrPatch]: value }
          : { ...section.settings, ...fieldOrPatch },
    });
  };

  const handleStylesChange = (
    fieldOrPatch: keyof CustomPageSectionStyles | Partial<CustomPageSectionStyles>,
    value?: unknown
  ) => {
    onUpdateSection(section.id, {
      styles:
        typeof fieldOrPatch === "string"
          ? { ...section.styles, [fieldOrPatch]: value }
          : { ...section.styles, ...fieldOrPatch },
    });
  };

  const settings = (section.settings || {}) as Record<string, unknown>;
  const styles = section.styles || {};
  const sectionTypeLabel = SECTION_TYPE_LABELS[section.type] || section.type.replace(/_/g, " ");
  const sectionDisplayName = section.title || sectionTypeLabel;

  return (
    <aside className="w-full bg-white flex flex-col h-full shrink-0 min-w-0 min-h-0">
      <div className="p-3 border-b border-slate-200 bg-white space-y-2">
        <div className="min-w-0">
          <input
            type="text"
            value={section.title || ""}
            onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
            placeholder={sectionTypeLabel}
            className="font-bold text-[13px] text-[#011C40] w-full bg-transparent hover:bg-slate-50 focus:bg-white focus:border-[#023859] border border-transparent rounded px-1.5 py-0.5 focus:outline-none truncate"
          />
          <span className="text-[11px] text-[#26658C] font-semibold px-1.5 block">
            Outils dédiés • {sectionTypeLabel}
          </span>
        </div>

        {selectedSubElement && (
          <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F8FBFC] border border-slate-200 text-[11px]">
            <div className="flex items-center gap-1 min-w-0">
              <button
                type="button"
                onClick={() => selectSection(section.id, null)}
                className="font-semibold text-slate-500 hover:text-[#011C40] truncate max-w-[110px] cursor-pointer"
              >
                {sectionDisplayName}
              </button>
              <ChevronRight className="w-3 h-3 text-[#26658C] shrink-0" />
              <span className="font-extrabold text-[#023859] truncate">
                {formatSubElementLabel(selectedSubElement)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => selectSection(section.id, null)}
              className="p-0.5 rounded hover:bg-slate-200/70 text-[#023859] cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex p-1 bg-slate-100 border-b border-slate-200 text-[11px] font-medium gap-0.5">
        {[
          { id: "content" as const, label: "Contenu", icon: Type },
          { id: "style" as const, label: "Couleurs", icon: SlidersHorizontal },
          { id: "layout" as const, label: "Espace", icon: Layout },
          { id: "responsive" as const, label: "Écrans", icon: Smartphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 px-1.5 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                isAct
                  ? "bg-white text-[#011C40] font-bold shadow-2xs"
                  : "text-slate-500 hover:text-[#011C40]"
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-[#023859] shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setActiveTab("advanced")}
          className={`p-1.5 rounded-lg cursor-pointer flex items-center justify-center shrink-0 ${
            activeTab === "advanced" ? "bg-white text-[#011C40] font-bold shadow-2xs" : "text-slate-500"
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-[13px]">
        {activeTab === "content" && (
          <SectionContentTab
            sectionType={section.type}
            settings={settings}
            sections={sections}
            products={products}
            onSettingsChange={handleSettingsChange}
          />
        )}
        {activeTab === "style" && (
          <SectionStyleTab styles={styles} theme={currentTheme} onStylesChange={handleStylesChange} />
        )}
        {activeTab === "layout" && (
          <SectionLayoutTab styles={styles} settings={settings} onStylesChange={handleStylesChange} onSettingsChange={handleSettingsChange} />
        )}
        {activeTab === "responsive" && (
          <SectionResponsiveTab settings={settings} onSettingsChange={handleSettingsChange} />
        )}
        {activeTab === "advanced" && (
          <SectionAdvancedTab sectionId={section.id} settings={settings} onSettingsChange={handleSettingsChange} />
        )}
      </div>
    </aside>
  );
};
