import React from "react";
import { Megaphone, Compass } from "lucide-react";
import type {
  StoreAnnouncementBarConfig,
  StoreHeaderNavConfig,
} from "../../../../../domains/seller/customPage.types";

interface HeaderAnnouncementAndLayoutFormProps {
  announcement: StoreAnnouncementBarConfig;
  setAnnouncement: React.Dispatch<React.SetStateAction<StoreAnnouncementBarConfig>>;
  headerCfg: StoreHeaderNavConfig;
  setHeaderCfg: React.Dispatch<React.SetStateAction<StoreHeaderNavConfig>>;
}

const LAYOUT_OPTIONS = [
  { id: "left", label: "Classique" },
  { id: "center", label: "Centré" },
  { id: "minimal", label: "Minimal" },
] as const;

export const HeaderAnnouncementAndLayoutForm: React.FC<HeaderAnnouncementAndLayoutFormProps> = ({
  announcement,
  setAnnouncement,
  headerCfg,
  setHeaderCfg,
}) => (
  <div className="divide-y divide-slate-200">
    <section className="pb-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-[12px]">
          <Megaphone className="w-3.5 h-3.5 text-slate-500" />
          <span>Barre d&apos;annonce</span>
        </span>
        <input
          type="checkbox"
          checked={announcement.enabled}
          onChange={(e) => setAnnouncement((p) => ({ ...p, enabled: e.target.checked }))}
          className="w-4 h-4 accent-slate-900 cursor-pointer"
        />
      </div>

      {announcement.enabled && (
        <div className="space-y-2.5">
          <input
            type="text"
            value={announcement.text}
            onChange={(e) => setAnnouncement((p) => ({ ...p, text: e.target.value }))}
            placeholder="Message promotionnel..."
            className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-900 focus:border-slate-900 focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 bg-slate-50/70 px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="color"
                value={announcement.bgColor || "#0F172A"}
                onChange={(e) => setAnnouncement((p) => ({ ...p, bgColor: e.target.value }))}
                className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="text-[11px] font-medium text-slate-700">Fond</span>
            </label>
            <label className="flex items-center gap-2 bg-slate-50/70 px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="color"
                value={announcement.textColor || "#FFFFFF"}
                onChange={(e) => setAnnouncement((p) => ({ ...p, textColor: e.target.value }))}
                className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="text-[11px] font-medium text-slate-700">Texte</span>
            </label>
          </div>
        </div>
      )}
    </section>

    <section className="py-4 space-y-3">
      <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-[12px]">
        <Compass className="w-3.5 h-3.5 text-slate-500" />
        <span>Disposition de l&apos;en-tête</span>
      </span>

      <div className="grid grid-cols-3 gap-1.5">
        {LAYOUT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setHeaderCfg((p) => ({ ...p, layout: opt.id }))}
            className={`h-8 rounded-lg text-[11.5px] font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              headerCfg.layout === opt.id
                ? "bg-slate-900 text-white border-slate-900 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 pt-1">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-[12px] text-slate-700">En-tête fixe au défilement</span>
          <input
            type="checkbox"
            checked={headerCfg.sticky}
            onChange={(e) => setHeaderCfg((p) => ({ ...p, sticky: e.target.checked }))}
            className="w-4 h-4 accent-slate-900 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-[12px] text-slate-700">Barre de recherche</span>
          <input
            type="checkbox"
            checked={headerCfg.showSearch}
            onChange={(e) => setHeaderCfg((p) => ({ ...p, showSearch: e.target.checked }))}
            className="w-4 h-4 accent-slate-900 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-[12px] text-slate-700">Bandeau confiance (COD & 69W)</span>
          <input
            type="checkbox"
            checked={headerCfg.showTrustBar}
            onChange={(e) => setHeaderCfg((p) => ({ ...p, showTrustBar: e.target.checked }))}
            className="w-4 h-4 accent-slate-900 cursor-pointer"
          />
        </label>
      </div>
    </section>
  </div>
);
