import React, { useEffect, useRef, useState } from "react";
import {
  SellerStoreConfig,
  StoreAnnouncementBarConfig,
  StoreHeaderNavConfig,
  StoreNavMenuLink,
} from "../../../../../domains/seller/customPage.types";
import { Plus, Trash2, Check, RefreshCw } from "lucide-react";
import { HeaderAnnouncementAndLayoutForm } from "./HeaderAnnouncementAndLayoutForm";

interface HeaderNavigationInspectorPanelProps {
  storeConfig?: SellerStoreConfig | null;
  onLiveChange?: (patch: Partial<SellerStoreConfig>) => void;
  onSaveConfig: (updated: Partial<SellerStoreConfig>) => Promise<void>;
}

const SYSTEM_LINK_TARGETS: Array<{ value: StoreNavMenuLink["target"]; label: string }> = [
  { value: "home", label: "Page d'Accueil" },
  { value: "collection", label: "Catalogue & Collections" },
  { value: "about", label: "À propos / Notre Histoire" },
  { value: "delivery", label: "Livraison 69 Wilayas" },
  { value: "returns", label: "Politique de Retours" },
  { value: "faq", label: "Questions Fréquentes (FAQ)" },
  { value: "contact", label: "Contact & Coordonnées" },
];

export const HeaderNavigationInspectorPanel: React.FC<HeaderNavigationInspectorPanelProps> = ({
  storeConfig,
  onLiveChange,
  onSaveConfig,
}) => {
  const customPages = storeConfig?.customPages || [];
  const onLiveChangeRef = useRef(onLiveChange);
  onLiveChangeRef.current = onLiveChange;

  const [announcement, setAnnouncement] = useState<StoreAnnouncementBarConfig>({
    enabled: storeConfig?.announcementBar?.enabled ?? true,
    text: storeConfig?.announcementBar?.text || "Livraison rapide 69 Wilayas • Paiement à la livraison (COD)",
    bgColor: storeConfig?.announcementBar?.bgColor || "#0F172A",
    textColor: storeConfig?.announcementBar?.textColor || "#FFFFFF",
  });

  const [headerCfg, setHeaderCfg] = useState<StoreHeaderNavConfig>({
    layout: storeConfig?.headerConfig?.layout || "left",
    sticky: storeConfig?.headerConfig?.sticky ?? true,
    showSearch: storeConfig?.headerConfig?.showSearch ?? true,
    showTrustBar: storeConfig?.headerConfig?.showTrustBar ?? true,
    navLinks:
      storeConfig?.headerConfig?.navLinks && storeConfig.headerConfig.navLinks.length > 0
        ? storeConfig.headerConfig.navLinks
        : [
            { id: "nav-home", label: "Accueil", target: "home" },
            { id: "nav-cat", label: "Catalogue", target: "collection" },
          ],
  });

  const [newLabel, setNewLabel] = useState("");
  const [selectedTargetOption, setSelectedTargetOption] = useState<string>("collection");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    onLiveChangeRef.current?.({
      announcementBar: announcement,
      headerConfig: headerCfg,
    });
  }, [announcement, headerCfg]);

  const handleTargetSelectChange = (val: string) => {
    setSelectedTargetOption(val);
    if (!newLabel.trim()) {
      if (val.startsWith("page:")) {
        const cp = customPages.find((p) => p.slug === val.replace("page:", ""));
        if (cp) setNewLabel(cp.title);
      } else {
        const sys = SYSTEM_LINK_TARGETS.find((t) => t.value === val);
        if (sys) setNewLabel(sys.label.split(" ")[0]);
      }
    }
  };

  const handleAddLink = () => {
    const clean = newLabel.trim();
    if (!clean) return;
    const isCustomPage = selectedTargetOption.startsWith("page:");
    const newItem: StoreNavMenuLink = isCustomPage
      ? { id: `nav-${Date.now()}`, label: clean, target: "page", pageSlug: selectedTargetOption.replace("page:", "") }
      : { id: `nav-${Date.now()}`, label: clean, target: selectedTargetOption as StoreNavMenuLink["target"] };
    setHeaderCfg((prev) => ({ ...prev, navLinks: [...prev.navLinks, newItem] }));
    setNewLabel("");
  };

  const handleRemoveLink = (id: string) => {
    setHeaderCfg((prev) => ({ ...prev, navLinks: prev.navLinks.filter((l) => l.id !== id) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await onSaveConfig({ announcementBar: announcement, headerConfig: headerCfg });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white select-none" data-testid="header-nav-inspector-panel">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">En-tête &amp; Navigation</h2>
          <p className="text-[11px] text-slate-500">Barre d&apos;annonce, disposition et liens du menu</p>
        </div>
        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
            <Check className="w-3.5 h-3.5" /> Enregistré
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-[12px]">
        <HeaderAnnouncementAndLayoutForm
          announcement={announcement}
          setAnnouncement={setAnnouncement}
          headerCfg={headerCfg}
          setHeaderCfg={setHeaderCfg}
        />

        <section className="pt-3 border-t border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Menu principal</span>
            <span className="text-[11px] text-slate-400 tabular-nums">{headerCfg.navLinks.length} liens</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white overflow-hidden">
            {headerCfg.navLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50/70">
                <div className="min-w-0">
                  <span className="font-medium text-slate-900 text-[12px] block truncate">{link.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {link.target === "page" ? `/p/${link.pageSlug}` : link.target}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(link.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  aria-label="Supprimer le lien"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-1">
            <select
              value={selectedTargetOption}
              onChange={(e) => handleTargetSelectChange(e.target.value)}
              data-testid="header-nav-target-select"
              className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-[11.5px] text-slate-800 focus:border-slate-900 focus:outline-none"
            >
              <optgroup label="Pages Système">
                {SYSTEM_LINK_TARGETS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </optgroup>
              {customPages.length > 0 && (
                <optgroup label="Pages Personnalisées">
                  {customPages.map((cp) => (
                    <option key={cp.id} value={`page:${cp.slug}`}>
                      {cp.title} (/p/{cp.slug})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Libellé du lien (ex: Nouveautés)"
                className="flex-1 h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-900 focus:border-slate-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddLink}
                data-testid="header-nav-add-link-btn"
                className="px-3 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11.5px] font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </button>
            </div>
          </div>
        </section>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[12.5px] font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Enregistrement…</>
            ) : (
              "Enregistrer l'en-tête"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
