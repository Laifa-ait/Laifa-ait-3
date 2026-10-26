import React, { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Globe,
  Trash2,
  ExternalLink,
  Check,
  Eye,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  CollectionPageDesignConfig,
  CustomPageSection,
  SellerStoreConfig,
  StoreCustomPageItem,
} from "../../../../../domains/seller/customPage.types";
import { CollectionPageCustomizer } from "./CollectionPageCustomizer";

interface PagesInspectorPanelProps {
  storeConfig?: SellerStoreConfig | null;
  sections?: CustomPageSection[];
  activePageId?: string;
  onSelectPage?: (pageId: string) => void;
  onSaveConfig?: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
}

const SYSTEM_PAGES: StoreCustomPageItem[] = [
  {
    id: "page-home",
    title: "Page d'Accueil Principale",
    subtitle: "Vitrine principale avec toutes vos sections actives",
    slug: "/",
    isHome: true,
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "page-catalog",
    title: "Page Catalogue & Rayons",
    subtitle: "Page cible ouverte au clic sur un Rayon ou bouton CTA",
    slug: "#catalog",
    isHome: false,
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "page-about",
    title: "Histoire & Atelier",
    subtitle: "Présentation de votre savoir-faire et garanties",
    slug: "#histoire",
    isHome: false,
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "page-contact",
    title: "Livraison 58 Wilayas & Contact",
    subtitle: "Grille des tarifs de livraison, retours et coordonnées",
    slug: "#contact",
    isHome: false,
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },
];

export const PagesInspectorPanel: React.FC<PagesInspectorPanelProps> = ({
  storeConfig,
  sections = [],
  activePageId = "page-home",
  onSelectPage,
  onSaveConfig,
}) => {
  const persistedPages = useMemo(() => {
    if (Array.isArray(storeConfig?.customPages) && storeConfig.customPages.length > 0) {
      return storeConfig.customPages;
    }
    return SYSTEM_PAGES;
  }, [storeConfig?.customPages]);

  const [selectedId, setSelectedId] = useState<string>(activePageId);
  const [isAddingPage, setIsAddingPage] = useState<boolean>(false);
  const [newPageTitle, setNewPageTitle] = useState<string>("");
  const [newPageSubtitle, setNewPageSubtitle] = useState<string>("");
  const [newPageSlug, setNewPageSlug] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const visibleSectionsCount = sections.filter((s) => s.isVisible).length;

  const triggerCanvasPageNavigation = (page: StoreCustomPageItem) => {
    if (page.isHome || page.id === "page-home") {
      window.dispatchEvent(
        new CustomEvent("studio:navigate-page", {
          detail: { viewMode: "home", pageId: page.id },
        })
      );
    } else if (page.id === "page-catalog" || page.slug === "#catalog") {
      window.dispatchEvent(
        new CustomEvent("studio:navigate-page", {
          detail: {
            viewMode: "collection",
            pageId: page.id,
            pageTitle: page.title,
            pageSubtitle: page.subtitle,
          },
        })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("studio:navigate-page", {
          detail: {
            viewMode: "custom-page",
            pageId: page.id,
            customPage: page,
          },
        })
      );
    }
  };

  const handleSelect = (page: StoreCustomPageItem) => {
    setSelectedId(page.id);
    onSelectPage?.(page.id);
    triggerCanvasPageNavigation(page);
  };

  const persistPages = async (nextPages: StoreCustomPageItem[]) => {
    if (!onSaveConfig) return;
    setSaving(true);
    try {
      await onSaveConfig({ customPages: nextPages });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCollectionConfig = (nextConfig: CollectionPageDesignConfig) => {
    if (!onSaveConfig) return;
    void onSaveConfig({ collectionPageConfig: nextConfig });
    window.dispatchEvent(
      new CustomEvent("studio:collection-config-updated", {
        detail: { collectionPageConfig: nextConfig },
      })
    );
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    const cleanSlug =
      newPageSlug.trim() ||
      `#${newPageTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`;

    const newPage: StoreCustomPageItem = {
      id: `page-${Date.now()}`,
      title: newPageTitle.trim(),
      subtitle: newPageSubtitle.trim() || "Page personnalisée de la boutique",
      slug: cleanSlug.startsWith("/") || cleanSlug.startsWith("#") ? cleanSlug : `#${cleanSlug}`,
      isHome: false,
      isPublished: true,
      sectionIds: sections.map((s) => s.id),
      updatedAt: new Date().toISOString(),
    };

    const nextPages = [...persistedPages, newPage];
    setSelectedId(newPage.id);
    setNewPageTitle("");
    setNewPageSubtitle("");
    setNewPageSlug("");
    setIsAddingPage(false);
    await persistPages(nextPages);
    triggerCanvasPageNavigation(newPage);
  };

  const handleDeletePage = async (id: string, isHome?: boolean) => {
    if (isHome) return;
    const nextPages = persistedPages.filter((p) => p.id !== id);
    if (selectedId === id) {
      setSelectedId("page-home");
      triggerCanvasPageNavigation(SYSTEM_PAGES[0]);
    }
    await persistPages(nextPages);
  };

  const selectedPage =
    persistedPages.find((p) => p.id === selectedId) || persistedPages[0];

  return (
    <div className="w-full bg-[#FFFFFF] flex flex-col h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#E4E7EC] space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-[#17191C]">
              Architecture des Pages ({persistedPages.length})
            </h2>
            <p className="text-[11px] text-[#667085]">
              Cliquez sur une page pour la voir et la customiser sur le Canvas
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => setIsAddingPage(!isAddingPage)}
            className="h-8 px-3 bg-[#F97316] hover:bg-[#EA580C] text-white text-[12px] font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvelle</span>
          </button>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FFF7ED] border border-[#FDBA74]/60 text-[11px] text-[#9A3412] flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
          <span>
            <strong>Utilité :</strong> L'onglet <em>Pages</em> relie vos boutons (« Découvrir la collection ») et vos cartes <em>Rayons Populaires</em> à leur page de destination dédiée.
          </span>
        </div>
      </div>

      {/* Add Page Form */}
      {isAddingPage && (
        <form
          onSubmit={(e) => void handleCreatePage(e)}
          className="p-4 bg-[#FFF7ED] border-b border-[#FDBA74] space-y-2.5"
        >
          <h3 className="text-[12px] font-bold text-[#17191C]">
            Créer une nouvelle page ou collection
          </h3>
          <input
            type="text"
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            placeholder="Titre (ex: Collection Ramadan / Promos)"
            required
            className="w-full h-9 px-3 bg-white border border-[#E4E7EC] rounded-lg text-[12px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
          />
          <input
            type="text"
            value={newPageSubtitle}
            onChange={(e) => setNewPageSubtitle(e.target.value)}
            placeholder="Sous-titre descriptif..."
            className="w-full h-9 px-3 bg-white border border-[#E4E7EC] rounded-lg text-[12px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
          />
          <input
            type="text"
            value={newPageSlug}
            onChange={(e) => setNewPageSlug(e.target.value)}
            placeholder="Identifiant (ex: #ramadan)"
            className="w-full h-9 px-3 bg-white border border-[#E4E7EC] rounded-lg text-[12px] font-mono text-[#17191C] focus:border-[#F97316] focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-8 bg-[#F97316] hover:bg-[#EA580C] text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Créer & Ouvrir</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddingPage(false)}
              className="h-8 px-3 bg-white border border-[#E4E7EC] text-[#667085] text-[12px] font-medium rounded-lg cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Pages List */}
      <div className="p-4 space-y-2.5 flex-1">
        {persistedPages.map((p) => {
          const isSelected = p.id === selectedId;
          const isCatalogTarget = p.id === "page-catalog" || p.slug === "#catalog";
          return (
            <div
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#FFF7ED] border-[#F97316] shadow-xs"
                  : "bg-[#FFFFFF] border-[#E4E7EC] hover:bg-[#F8FAFC]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 truncate">
                  {isCatalogTarget ? (
                    <Layers className="w-4 h-4 shrink-0 text-[#F97316]" />
                  ) : (
                    <FileText
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? "text-[#F97316]" : "text-[#667085]"
                      }`}
                    />
                  )}
                  <span className="font-bold text-[12px] text-[#17191C] truncate">
                    {p.title}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                    p.isHome
                      ? "bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]"
                      : isCatalogTarget
                      ? "bg-[#FFF7ED] text-[#EA580C] border border-[#FDBA74]"
                      : "bg-[#F5F6F8] text-[#475467]"
                  }`}
                >
                  {p.isHome
                    ? `${visibleSectionsCount} sections`
                    : isCatalogTarget
                    ? "Cible Rayons & CTA"
                    : "Page dédiée"}
                </span>
              </div>

              {p.subtitle && (
                <p className="text-[11px] text-[#667085] mb-2 line-clamp-1">
                  {p.subtitle}
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#667085]">
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <Globe className="w-3 h-3" />
                  <span>{p.slug}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(p);
                    }}
                    className="px-2 py-0.5 rounded bg-white border border-[#E4E7EC] hover:border-[#F97316] text-[10px] font-bold text-[#17191C] flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-[#F97316]" />
                    <span>Voir sur Canvas</span>
                  </button>
                  {!p.isHome && p.id !== "page-catalog" && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDeletePage(p.id, p.isHome);
                      }}
                      className="p-1 text-[#667085] hover:text-[#B42318] rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Contextual Customizer for Category / Collection / Custom Pages */}
        {!selectedPage?.isHome && (
          <CollectionPageCustomizer
            config={storeConfig?.collectionPageConfig}
            onChange={handleUpdateCollectionConfig}
            onPreviewCollectionPage={() => triggerCanvasPageNavigation(selectedPage)}
          />
        )}
      </div>

      {storeConfig?.shopSlug && (
        <div className="p-3 border-t border-[#E4E7EC] bg-[#F8FAFC]">
          <a
            href={`/store/${storeConfig.shopSlug}`}
            target="_blank"
            rel="noreferrer"
            className="w-full h-9 px-3 rounded-lg border border-[#E4E7EC] bg-white hover:bg-[#F9FAFB] text-[#17191C] text-[12px] font-semibold flex items-center justify-between transition-colors"
          >
            <span>Ouvrir la vitrine publique</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#F97316]" />
          </a>
        </div>
      )}
    </div>
  );
};
