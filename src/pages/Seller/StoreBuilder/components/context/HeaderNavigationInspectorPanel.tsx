import React, { useState } from "react";
import { Check, Plus, Trash2, RefreshCw, Megaphone, PanelTop, Navigation } from "lucide-react";
import {
  SellerStoreConfig,
  StoreAnnouncementBarConfig,
  StoreHeaderNavConfig,
  StoreNavMenuLink,
} from "../../../../../domains/seller/customPage.types";

interface HeaderNavigationInspectorPanelProps {
  storeConfig?: SellerStoreConfig | null;
  onSaveConfig: (updated: Partial<SellerStoreConfig>) => Promise<void>;
}

const DEFAULT_NAV_LINKS: StoreNavMenuLink[] = [
  { id: "nav-home", label: "Accueil", target: "home" },
  { id: "nav-catalog", label: "Catalogue", target: "collection" },
  { id: "nav-promos", label: "Nouveautés", target: "collection" },
];

export const HeaderNavigationInspectorPanel: React.FC<HeaderNavigationInspectorPanelProps> = ({
  storeConfig,
  onSaveConfig,
}) => {
  const [announcement, setAnnouncement] = useState<StoreAnnouncementBarConfig>({
    enabled: storeConfig?.announcementBar?.enabled ?? true,
    text:
      storeConfig?.announcementBar?.text ||
      "Livraison rapide 69 Wilayas • Paiement à la livraison (COD) disponible",
    link: storeConfig?.announcementBar?.link || "",
    bgColor: storeConfig?.announcementBar?.bgColor || "#011C40",
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
        : DEFAULT_NAV_LINKS,
  });

  const [newLabel, setNewLabel] = useState("");
  const [newTarget, setNewTarget] = useState<"home" | "collection">("collection");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAddLink = () => {
    const clean = newLabel.trim();
    if (!clean || headerCfg.navLinks.length >= 8) return;
    setHeaderCfg((prev) => ({
      ...prev,
      navLinks: [...prev.navLinks, { id: `nav-${Date.now()}`, label: clean, target: newTarget }],
    }));
    setNewLabel("");
  };

  const handleRemoveLink = (id: string) => {
    setHeaderCfg((prev) => ({
      ...prev,
      navLinks: prev.navLinks.filter((l) => l.id !== id),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await onSaveConfig({ announcementBar: announcement, headerConfig: headerCfg });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] select-none">
      <div className="p-4 border-b border-[#E4E7EC] flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-[#17191C]">En-tête & Navigation OS 2.0</h2>
          <p className="text-[12px] text-[#667085]">Barre d'annonce, disposition et menus</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-[12px] text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-lg border border-[#15803D]/20 font-semibold">
            <Check className="w-3.5 h-3.5" /> Enregistré
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-4 text-[13px]">
        <div className="space-y-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-[#0F172A]">
              <Megaphone className="w-4 h-4 text-[#023859]" />
              Barre d'annonce supérieure
            </span>
            <input
              type="checkbox"
              checked={announcement.enabled}
              onChange={(e) => setAnnouncement((p) => ({ ...p, enabled: e.target.checked }))}
              className="w-4 h-4 accent-[#023859] cursor-pointer"
            />
          </div>

          <input
            type="text"
            value={announcement.text}
            onChange={(e) => setAnnouncement((p) => ({ ...p, text: e.target.value }))}
            className="w-full h-9 px-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[12.5px]"
            placeholder="Livraison offerte dès 8 000 DA..."
          />

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-[#475569] block mb-1">Fond</label>
              <input
                type="color"
                value={announcement.bgColor}
                onChange={(e) => setAnnouncement((p) => ({ ...p, bgColor: e.target.value }))}
                className="w-full h-8 rounded cursor-pointer border border-[#CBD5E1]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#475569] block mb-1">Texte</label>
              <input
                type="color"
                value={announcement.textColor}
                onChange={(e) => setAnnouncement((p) => ({ ...p, textColor: e.target.value }))}
                className="w-full h-8 rounded cursor-pointer border border-[#CBD5E1]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <span className="flex items-center gap-1.5 font-bold text-[#0F172A]">
            <PanelTop className="w-4 h-4 text-[#023859]" />
            Disposition de l'En-tête
          </span>

          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: "left", label: "Classique" },
                { id: "center", label: "Logo Centré" },
                { id: "minimal", label: "Minimaliste" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setHeaderCfg((p) => ({ ...p, layout: opt.id }))}
                className={`h-8 rounded-lg text-[11.5px] font-bold border cursor-pointer transition-all ${
                  headerCfg.layout === opt.id
                    ? "bg-[#023859] text-white border-[#023859]"
                    : "bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label className="flex items-center justify-between text-[12px] font-medium text-[#334155] cursor-pointer pt-1">
            <span>Barre de recherche boutique</span>
            <input
              type="checkbox"
              checked={headerCfg.showSearch}
              onChange={(e) => setHeaderCfg((p) => ({ ...p, showSearch: e.target.checked }))}
              className="w-4 h-4 accent-[#023859]"
            />
          </label>

          <label className="flex items-center justify-between text-[12px] font-medium text-[#334155] cursor-pointer">
            <span>Badges de confiance sous le header</span>
            <input
              type="checkbox"
              checked={headerCfg.showTrustBar}
              onChange={(e) => setHeaderCfg((p) => ({ ...p, showTrustBar: e.target.checked }))}
              className="w-4 h-4 accent-[#023859]"
            />
          </label>
        </div>

        <div className="space-y-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <span className="flex items-center gap-1.5 font-bold text-[#0F172A]">
            <Navigation className="w-4 h-4 text-[#023859]" />
            Menu principal ({headerCfg.navLinks.length}/8)
          </span>

          <div className="space-y-1.5">
            {headerCfg.navLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[12px]"
              >
                <div className="truncate">
                  <span className="font-bold text-[#0F172A]">{link.label}</span>
                  <span className="ml-2 text-[10.5px] text-[#64748B] uppercase">
                    ({link.target === "home" ? "Accueil" : "Catalogue"})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(link.id)}
                  className="text-[#EF4444] hover:bg-[#FEF2F2] p-1 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Ex: Promotions"
              className="flex-1 h-8 px-2.5 bg-white border border-[#CBD5E1] rounded-lg text-[12px]"
            />
            <select
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value as "home" | "collection")}
              className="h-8 px-2 bg-white border border-[#CBD5E1] rounded-lg text-[11.5px]"
            >
              <option value="home">Accueil</option>
              <option value="collection">Catalogue</option>
            </select>
            <button
              type="button"
              onClick={handleAddLink}
              className="h-8 px-2.5 bg-[#023859] text-white rounded-lg text-[12px] font-bold flex items-center cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full h-10 bg-[#023859] hover:bg-[#011C40] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <span>Appliquer l'en-tête & les menus</span>
          )}
        </button>
      </form>
    </div>
  );
};
