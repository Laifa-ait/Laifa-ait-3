import React, { useState, useMemo } from "react";
import { FileText, Plus, Globe, Trash2, ExternalLink, Check } from "lucide-react";
import {
  CustomPageSection,
  SellerStoreConfig,
  StoreCustomPageItem,
} from "../../../../../domains/seller/customPage.types";

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
    slug: "/",
    isHome: true,
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "page-catalog",
    title: "Catalogue & Rayons",
    slug: "#catalog",
    isHome: false,
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "page-about",
    title: "Histoire & Atelier",
    slug: "#histoire",
    isHome: false,
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "page-contact",
    title: "Livraison 58 Wilayas & Contact",
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
  const [newPageSlug, setNewPageSlug] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const visibleSectionsCount = sections.filter((s) => s.isVisible).length;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectPage?.(id);
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

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    const cleanSlug =
      newPageSlug.trim() ||
      `/${newPageTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`;

    const newPage: StoreCustomPageItem = {
      id: `page-${Date.now()}`,
      title: newPageTitle.trim(),
      slug: cleanSlug.startsWith("/") || cleanSlug.startsWith("#") ? cleanSlug : `/${cleanSlug}`,
      isHome: false,
      isPublished: true,
      sectionIds: sections.map((s) => s.id),
      updatedAt: new Date().toISOString(),
    };

    const nextPages = [...persistedPages, newPage];
    setSelectedId(newPage.id);
    setNewPageTitle("");
    setNewPageSlug("");
    setIsAddingPage(false);
    await persistPages(nextPages);
  };

  const handleDeletePage = async (id: string, isHome?: boolean) => {
    if (isHome) return;
    const nextPages = persistedPages.filter((p) => p.id !== id);
    if (selectedId === id) {
      setSelectedId("page-home");
    }
    await persistPages(nextPages);
  };

  return (
    <div className="w-full bg-[#FFFFFF] flex flex-col h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#E4E7EC]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-[#17191C]">
              Pages & Navigation ({persistedPages.length})
            </h2>
            <p className="text-[12px] text-[#667085]">
              Liens d'accès rapide et structure vitrine
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
      </div>

      {/* Add Page Form */}
      {isAddingPage && (
        <form
          onSubmit={(e) => void handleCreatePage(e)}
          className="p-4 bg-[#FFF7ED] border-b border-[#FDBA74] space-y-3"
        >
          <h3 className="text-[13px] font-semibold text-[#17191C]">
            Ajouter une entrée de page ou ancre
          </h3>
          <div>
            <label className="block text-[12px] font-medium text-[#17191C] mb-1">
              Titre de la page
            </label>
            <input
              type="text"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="Ex: Conditions de Garantie"
              required
              className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[13px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#17191C] mb-1">
              Lien ou Ancre (#section ou /slug)
            </label>
            <input
              type="text"
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              placeholder="Ex: #faq ou /garantie"
              className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[13px] text-[#17191C] font-mono focus:border-[#F97316] focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-9 bg-[#F97316] hover:bg-[#EA580C] text-white text-[12px] font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Enregistrer</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddingPage(false)}
              className="h-9 px-3 bg-[#FFFFFF] border border-[#E4E7EC] text-[#667085] hover:bg-[#F5F6F8] text-[12px] font-medium rounded-lg transition-colors cursor-pointer"
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
          const count = p.isHome ? visibleSectionsCount : (p.sectionIds?.length ?? 1);
          return (
            <div
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#FFF7ED] border-[#FDBA74] shadow-2xs"
                  : "bg-[#FFFFFF] border-[#E4E7EC] hover:bg-[#F8FAFC]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 truncate">
                  <FileText
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? "text-[#F97316]" : "text-[#667085]"
                    }`}
                  />
                  <span className="font-semibold text-[13px] text-[#17191C] truncate">
                    {p.title}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                    p.isHome
                      ? "bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]"
                      : "bg-[#F5F6F8] text-[#475467]"
                  }`}
                >
                  {p.isHome ? `${count} sections actives` : "Navigation"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[12px] text-[#667085]">
                <div className="flex items-center gap-1 font-mono text-[11px] text-[#667085]">
                  <Globe className="w-3 h-3 text-[#667085]" />
                  <span>
                    {storeConfig?.shopSlug ? `/store/${storeConfig.shopSlug}${p.slug === "/" ? "" : p.slug}` : p.slug}
                  </span>
                </div>

                {!p.isHome && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDeletePage(p.id, p.isHome);
                    }}
                    className="p-1 text-[#667085] hover:text-[#B42318] hover:bg-[#FEF2F2] rounded transition-colors cursor-pointer"
                    title="Supprimer cette page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
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
