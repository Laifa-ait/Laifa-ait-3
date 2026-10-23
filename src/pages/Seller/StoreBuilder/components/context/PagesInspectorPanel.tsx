import React, { useState } from "react";
import { FileText, Plus, Globe, Trash2 } from "lucide-react";

export interface StorePageItem {
  id: string;
  title: string;
  slug: string;
  isHome?: boolean;
  isPublished?: boolean;
  sectionsCount: number;
  updatedAt: string;
}

const DEFAULT_PAGES: StorePageItem[] = [
  {
    id: "page-home",
    title: "Page d'Accueil",
    slug: "/",
    isHome: true,
    isPublished: true,
    sectionsCount: 4,
    updatedAt: "Aujourd'hui",
  },
  {
    id: "page-catalog",
    title: "Catalogue Produits",
    slug: "/produits",
    isHome: false,
    isPublished: true,
    sectionsCount: 2,
    updatedAt: "Hier",
  },
  {
    id: "page-about",
    title: "À Propos & Histoire",
    slug: "/a-propos",
    isHome: false,
    isPublished: true,
    sectionsCount: 1,
    updatedAt: "Il y a 3 jours",
  },
  {
    id: "page-contact",
    title: "Contact & Livraison",
    slug: "/contact",
    isHome: false,
    isPublished: true,
    sectionsCount: 1,
    updatedAt: "La semaine dernière",
  },
];

interface PagesInspectorPanelProps {
  activePageId?: string;
  onSelectPage?: (pageId: string) => void;
}

export const PagesInspectorPanel: React.FC<PagesInspectorPanelProps> = ({
  activePageId = "page-home",
  onSelectPage,
}) => {
  const [pages, setPages] = useState<StorePageItem[]>(DEFAULT_PAGES);
  const [selectedId, setSelectedId] = useState<string>(activePageId);
  const [isAddingPage, setIsAddingPage] = useState<boolean>(false);
  const [newPageTitle, setNewPageTitle] = useState<string>("");
  const [newPageSlug, setNewPageSlug] = useState<string>("");

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (onSelectPage) onSelectPage(id);
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    const slugFormatted =
      newPageSlug.trim() ||
      `/${newPageTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

    const newPage: StorePageItem = {
      id: `page-${Date.now()}`,
      title: newPageTitle.trim(),
      slug: slugFormatted.startsWith("/") ? slugFormatted : `/${slugFormatted}`,
      isHome: false,
      isPublished: true,
      sectionsCount: 0,
      updatedAt: "À l'instant",
    };

    setPages((prev) => [...prev, newPage]);
    setSelectedId(newPage.id);
    setNewPageTitle("");
    setNewPageSlug("");
    setIsAddingPage(false);
  };

  const handleDeletePage = (id: string, isHome?: boolean) => {
    if (isHome) return;
    setPages((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) {
      setSelectedId("page-home");
    }
  };

  return (
    <aside className="w-[320px] bg-[#FFFFFF] border-l border-[#E4E7EC] flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-[#E4E7EC]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-[600] text-[#17191C]">
              Pages de la boutique ({pages.length})
            </h2>
            <p className="text-[13px] text-[#667085]">
              Structure et arborescence du site
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingPage(!isAddingPage)}
            className="h-[36px] px-3 bg-[#F97316] hover:bg-[#EA580C] text-white text-[13px] font-[500] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvelle</span>
          </button>
        </div>
      </div>

      {/* Add Page Form */}
      {isAddingPage && (
        <form onSubmit={handleCreatePage} className="p-4 bg-[#FFF7ED] border-b border-[#FDBA74] space-y-3">
          <h3 className="text-[13px] font-[600] text-[#17191C]">
            Ajouter une page sur-mesure
          </h3>
          <div>
            <label className="block text-[13px] font-[500] text-[#17191C] mb-1">
              Titre de la page
            </label>
            <input
              type="text"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="Ex: FAQ & Retours"
              required
              className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[14px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[13px] font-[500] text-[#17191C] mb-1">
              URL (Slug)
            </label>
            <input
              type="text"
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              placeholder="Ex: /faq-retours"
              className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[14px] text-[#17191C] focus:border-[#F97316] focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 h-[40px] bg-[#F97316] hover:bg-[#EA580C] text-white text-[13px] font-[500] rounded-lg transition-colors cursor-pointer"
            >
              Créer la page
            </button>
            <button
              type="button"
              onClick={() => setIsAddingPage(false)}
              className="h-[40px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] text-[#667085] hover:bg-[#F5F6F8] text-[13px] font-[500] rounded-lg transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Pages List */}
      <div className="p-4 space-y-2.5 flex-1">
        {pages.map((p) => {
          const isSelected = p.id === selectedId;
          return (
            <div
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={`p-3 rounded-[10px] border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#FFF7ED] border-[#FDBA74] shadow-xs"
                  : "bg-[#FFFFFF] border-[#E4E7EC] hover:bg-[#F5F6F8]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 truncate">
                  <FileText
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? "text-[#F97316]" : "text-[#667085]"
                    }`}
                  />
                  <span className="font-[600] text-[14px] text-[#17191C] truncate">
                    {p.title}
                  </span>
                </div>

                {p.isHome ? (
                  <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[11px] font-[500] rounded-full border border-[#DCFCE7]">
                    Accueil
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-[#F5F6F8] text-[#667085] text-[11px] font-[500] rounded-full">
                    Standard
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[13px] text-[#667085]">
                <div className="flex items-center gap-1 text-[12px] text-[#667085]">
                  <Globe className="w-3.5 h-3.5 text-[#667085]" />
                  <span>{p.slug}</span>
                </div>

                <div className="flex items-center gap-1">
                  {!p.isHome && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(p.id, p.isHome);
                      }}
                      className="p-1 text-[#667085] hover:text-[#B42318] hover:bg-[#FEF2F2] rounded transition-colors"
                      title="Supprimer la page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
