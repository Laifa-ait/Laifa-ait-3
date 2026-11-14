import React, { useState } from "react";
import {
  CollectionPageDesignConfig, CustomPageSection, SellerStoreConfig, StoreCustomPageItem,
} from "../../../../../domains/seller/customPage.types";
import { PageEditorDrawer, slugifyPagePath } from "./PageEditorDrawer";
import {
  AlertTriangle, Copy, Edit3, Eye, EyeOff, FileText, FolderKanban, HelpCircle,
  Home, Info, Layers, PhoneCall, Plus, RotateCcw, SlidersHorizontal, Trash2, Truck,
} from "lucide-react";

interface PagesInspectorPanelProps {
  storeConfig?: SellerStoreConfig | null;
  sections?: CustomPageSection[];
  onSaveConfig?: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
}

const DEFAULT_COLLECTION_CONFIG: CollectionPageDesignConfig = {
  headerStyle: "hero-image", headerHeight: "md", headerOverlayOpacity: 40,
  showSearch: true, showSortDropdown: true, showCategoryPills: true,
  columnsDesktop: 4, cardStyle: "modern", cardAspectRatio: "4/5",
  showStockBadge: true, showCtaButton: false, ctaLabel: "Voir le produit",
};

function navigateCanvasTo(detail: { viewMode: "home" | "category" | "collection" | "custom-page"; customPage?: StoreCustomPageItem }) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("studio:navigate-page", { detail }));
}

export const PagesInspectorPanel: React.FC<PagesInspectorPanelProps> = ({
  storeConfig, sections = [], onSaveConfig,
}) => {
  const shopSlug = storeConfig?.shopSlug || "ma-boutique";
  const customPages = storeConfig?.customPages || [];
  const [collectionConfig, setCollectionConfig] = useState<CollectionPageDesignConfig>(
    storeConfig?.collectionPageConfig || DEFAULT_COLLECTION_CONFIG
  );
  const [showEditor, setShowEditor] = useState(false);
  const [editingPage, setEditingPage] = useState<StoreCustomPageItem | null>(null);
  const [pendingDeletePageId, setPendingDeletePageId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const visibleCount = sections.filter((s) => s.isVisible).length;
  const systemPages = [
    { id: "home", title: "Accueil", path: `/store/${shopSlug}`, status: `${visibleCount} sections`, icon: Home, view: "home" as const },
    { id: "catalogue", title: "Catalogue", path: `/store/${shopSlug}#catalog`, status: "Actif", icon: FolderKanban, view: "collection" as const },
    { id: "collections", title: "Collections", path: `/store/${shopSlug}/collections`, status: "Rayons", icon: Layers, view: "collection" as const },
    { id: "about", title: "À propos", path: `/store/${shopSlug}#story`, status: "Actif", icon: Info, view: "home" as const },
    { id: "contact", title: "Contact", path: `/store/${shopSlug}#contact`, status: storeConfig?.wilaya || "Actif", icon: PhoneCall, view: "home" as const },
    { id: "faq", title: "FAQ", path: `/store/${shopSlug}#faq`, status: "Actif", icon: HelpCircle, view: "home" as const },
    { id: "delivery", title: "Livraison", path: `/store/${shopSlug}#delivery`, status: "69 Wilayas", icon: Truck, view: "home" as const },
    { id: "returns", title: "Retours", path: `/store/${shopSlug}#returns`, status: "Actif", icon: RotateCcw, view: "home" as const },
  ];

  const persistPages = async (nextPages: StoreCustomPageItem[]) => {
    if (!onSaveConfig) return;
    setIsSaving(true);
    try { await onSaveConfig({ customPages: nextPages }); } finally { setIsSaving(false); }
  };

  const handleSavePage = async (page: StoreCustomPageItem) => {
    const exists = customPages.some((p) => p.id === page.id);
    await persistPages(exists ? customPages.map((p) => (p.id === page.id ? page : p)) : [...customPages, page]);
    setShowEditor(false); setEditingPage(null);
    navigateCanvasTo({ viewMode: "custom-page", customPage: page });
  };

  const handleDuplicatePage = async (page: StoreCustomPageItem) => {
    await persistPages([
      ...customPages,
      { ...page, id: `page_${Date.now()}`, title: `${page.title} (Copie)`, slug: slugifyPagePath(`${page.slug}-copie`), updatedAt: new Date().toISOString() },
    ]);
  };

  const handleTogglePublish = async (pageId: string) => {
    await persistPages(customPages.map((p) => (p.id === pageId ? { ...p, isPublished: !(p.isPublished ?? true), updatedAt: new Date().toISOString() } : p)));
  };

  const handleConfirmDelete = async (pageId: string) => {
    await persistPages(customPages.filter((p) => p.id !== pageId));
    setPendingDeletePageId(null);
    navigateCanvasTo({ viewMode: "home" });
  };

  const updateCollectionField = async <K extends keyof CollectionPageDesignConfig>(key: K, val: CollectionPageDesignConfig[K]) => {
    const next = { ...collectionConfig, [key]: val };
    setCollectionConfig(next);
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("studio:collection-config-updated", { detail: { collectionPageConfig: next } }));
    if (onSaveConfig) await onSaveConfig({ collectionPageConfig: next });
  };

  return (
    <div className="p-4 space-y-4 select-none" data-testid="pages-inspector-panel">
      <div className="pb-3 border-b border-slate-200">
        <h3 className="text-[13px] font-semibold text-slate-900">Pages &amp; Architecture</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">8 pages système, pages personnalisées et SEO</p>
      </div>

      <div className="space-y-1.5">
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
          Pages système ({systemPages.length})
        </span>
        <div className="grid grid-cols-2 gap-1.5" data-testid="system-pages-grid">
          {systemPages.map((page) => {
            const Icon = page.icon;
            return (
              <button key={page.id} type="button" onClick={() => navigateCanvasTo({ viewMode: page.view })} className="p-2 rounded-lg border border-slate-200 hover:border-slate-400 bg-white flex items-center gap-2 text-left transition-colors cursor-pointer">
                <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11.5px] font-semibold text-slate-900 truncate">{page.title}</span>
                    <span className="text-[10px] font-medium text-emerald-700 shrink-0 tabular-nums">{page.status}</span>
                  </div>
                  <p className="text-[9.5px] font-mono text-slate-400 truncate">{page.path}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-[12px] font-semibold text-slate-900">Pages personnalisées ({customPages.length})</h4>
          <button type="button" data-testid="open-create-page-btn" onClick={() => { setEditingPage(null); setShowEditor(true); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium cursor-pointer">
            <Plus className="w-3.5 h-3.5" /><span>Nouvelle page</span>
          </button>
        </div>

        {showEditor && (
          <PageEditorDrawer initialPage={editingPage} shopSlug={shopSlug} sections={sections} isSaving={isSaving} onSave={handleSavePage} onCancel={() => { setShowEditor(false); setEditingPage(null); }} />
        )}

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white" data-testid="custom-pages-list">
          {customPages.length === 0 ? (
            <p className="p-4 text-center text-[11.5px] text-slate-400">Aucune page personnalisée</p>
          ) : (
            customPages.map((cp) => {
              const isPublished = cp.isPublished ?? true;
              const isPendingDelete = pendingDeletePageId === cp.id;
              return (
                <div key={cp.id} className="p-2.5 bg-white space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <button type="button" onClick={() => navigateCanvasTo({ viewMode: "custom-page", customPage: cp })} className="flex items-center gap-2 min-w-0 text-left cursor-pointer">
                      <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-semibold text-slate-900 truncate">{cp.title}</span>
                          <span className={`text-[10px] font-medium ${isPublished ? "text-emerald-700" : "text-slate-400"}`}>
                            · {isPublished ? "Publiée" : "Masquée"}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate">/p/{cp.slug} · {cp.templateId || "default"}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button type="button" onClick={() => handleTogglePublish(cp.id)} data-testid={`toggle-page-visibility-${cp.id}`} className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">{isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                      <button type="button" onClick={() => { setEditingPage(cp); setShowEditor(true); }} data-testid={`edit-page-${cp.id}`} className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => handleDuplicatePage(cp)} data-testid={`duplicate-page-${cp.id}`} className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => setPendingDeletePageId(cp.id)} data-testid={`request-delete-page-${cp.id}`} className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {isPendingDelete && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 space-y-2" data-testid={`confirm-delete-page-banner-${cp.id}`}>
                      <div className="flex items-start gap-2 text-rose-900">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                        <p className="text-[11px] font-medium">
                          {isPublished ? `La page « ${cp.title} » est actuellement publiée. Sa suppression désactivera son URL publique.` : `Confirmer la suppression de « ${cp.title} » ?`}
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setPendingDeletePageId(null)} className="px-2.5 py-1 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700 cursor-pointer">Annuler</button>
                        <button type="button" data-testid={`confirm-delete-page-btn-${cp.id}`} onClick={() => handleConfirmDelete(cp.id)} className="px-2.5 py-1 rounded bg-rose-600 text-white text-[11px] font-semibold cursor-pointer">Supprimer</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 space-y-2">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <h4 className="text-[12px] font-semibold text-slate-900">En-tête des pages collections</h4>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(["hero-image", "split-banner", "minimal"] as const).map((style) => (
            <button key={style} type="button" onClick={() => updateCollectionField("headerStyle", style)} className={`py-1.5 px-2 rounded-lg text-[10.5px] font-medium border cursor-pointer ${collectionConfig.headerStyle === style ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>{style}</button>
          ))}
        </div>
      </div>
    </div>
  );
};
