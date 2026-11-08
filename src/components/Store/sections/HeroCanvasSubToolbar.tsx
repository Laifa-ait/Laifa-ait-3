import React from "react";
import {
  Image as ImageIcon, Type, Sparkles, MousePointerClick, AlignLeft, FolderOpen, Link2,
} from "lucide-react";
import type { HeroBannerSettings, HeroSubElement } from "../../../domains/seller/customPage.types";
import { safeNavigationHref } from "./safeNavigationHref";

interface HeroCanvasSubToolbarProps {
  sectionId?: string;
  settings?: HeroBannerSettings;
  activeSubElement: HeroSubElement | null;
  activeObjectPosition: string;
  onSelectSubElement: (el: HeroSubElement, e: React.MouseEvent) => void;
}

const SUB_TOOLBAR_ITEMS = [
  { id: "background" as const, label: "Image & Cadrage", icon: ImageIcon },
  { id: "badge" as const, label: "Badge", icon: Sparkles },
  { id: "title" as const, label: "Titre", icon: Type },
  { id: "subtitle" as const, label: "Sous-titre", icon: AlignLeft },
  { id: "ctaPrimary" as const, label: "Bouton 1", icon: MousePointerClick },
  { id: "ctaSecondary" as const, label: "Bouton 2", icon: MousePointerClick },
];

const OLMART_CTA_DESTINATIONS = [
  { label: "Catalogue produits", value: "#catalog" },
  { label: "Rayons & Catégories", value: "#categories" },
  { label: "Collections vedettes", value: "#collections" },
  { label: "Contact vendeur", value: "#contact" },
];

function emitPatch(sectionId: string | undefined, patch: Record<string, unknown>) {
  if (!sectionId || typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("studio:patch-section-settings", { detail: { sectionId, patch } }));
}

export const HeroCanvasSubToolbar: React.FC<HeroCanvasSubToolbarProps> = ({
  sectionId, settings, activeSubElement, activeObjectPosition, onSelectSubElement,
}) => {
  const isPrimaryBtn = activeSubElement === "cta" || activeSubElement === "ctaPrimary";
  const isSecondaryBtn = activeSubElement === "ctaSecondary";
  const isImageActive = activeSubElement === "background";
  const rawSettings = (settings || {}) as Record<string, unknown>;
  const imageAlt = typeof rawSettings.imageAlt === "string" ? rawSettings.imageAlt : "";

  const btnText = isPrimaryBtn ? settings?.ctaText || "" : settings?.secondaryCtaText || "";
  const btnLink = (isPrimaryBtn ? settings?.ctaLink : settings?.secondaryCtaLink) || "#catalog";
  const btnStyle = isPrimaryBtn ? settings?.ctaStyle || "solid" : settings?.secondaryCtaStyle || "outline";
  const btnColor = (isPrimaryBtn ? settings?.ctaBgColor : settings?.secondaryCtaBgColor) || "#023859";

  return (
    <div
      className="bg-[#F8FBFC] border-b border-slate-200 px-3 py-1.5 flex flex-col gap-1.5 select-none"
      onClick={(e) => e.stopPropagation()}
      data-testid="hero-canvas-sub-toolbar"
    >
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 pr-1">Sous-bloc :</span>
          {SUB_TOOLBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isAct = activeSubElement === item.id || (item.id === "ctaPrimary" && activeSubElement === "cta");
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => onSelectSubElement(item.id, e)}
                className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                  isAct
                    ? "bg-[#023859] text-white border-[#023859] shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-[#011C40]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <span className="text-[11px] font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0 whitespace-nowrap">
          Cadrage : {activeObjectPosition}
        </span>
      </div>

      {sectionId && settings && isImageActive && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/70 text-[11px]" data-testid="hero-subtoolbar-image-controls">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("studio:open-inspector-tab", { detail: { sectionId, tab: "content" } }))}
            className="h-7 px-2.5 rounded-md bg-[#023859] text-white font-bold flex items-center gap-1 cursor-pointer"
          >
            <FolderOpen className="w-3 h-3" />
            <span>Remplacer l&apos;image</span>
          </button>

          <div className="flex items-center bg-white rounded-md border border-slate-200 p-0.5">
            {([{ id: "cover", label: "Remplir" }, { id: "contain", label: "Entière" }] as const).map((fit) => (
              <button
                key={fit.id}
                type="button"
                onClick={() => emitPatch(sectionId, { imageFit: fit.id })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  (settings.imageFit || "cover") === fit.id ? "bg-[#023859] text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {fit.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white rounded-md border border-slate-200 p-0.5">
            {([{ pos: "50% 15%", label: "Haut" }, { pos: "50% 50%", label: "Centre" }, { pos: "50% 85%", label: "Bas" }] as const).map((p) => (
              <button
                key={p.pos}
                type="button"
                onClick={() => emitPatch(sectionId, { imagePositionDesktop: p.pos, backgroundPosition: p.pos })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  activeObjectPosition === p.pos ? "bg-[#26658C] text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={imageAlt}
            placeholder="Texte alternatif SEO (alt)..."
            onChange={(e) => emitPatch(sectionId, { imageAlt: e.target.value })}
            className="h-7 px-2 rounded-md border border-slate-200 bg-white text-slate-800 text-[11px] min-w-[170px] flex-1 max-w-xs outline-none focus:border-[#023859]"
          />
        </div>
      )}

      {sectionId && settings && (isPrimaryBtn || isSecondaryBtn) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/70 text-[11px]" data-testid="hero-subtoolbar-button-controls">
          <input
            type="text"
            value={btnText}
            placeholder="Texte du bouton..."
            onChange={(e) => emitPatch(sectionId, isPrimaryBtn ? { ctaText: e.target.value, showCta: true } : { secondaryCtaText: e.target.value, showSecondaryCta: true })}
            className="h-7 px-2 rounded-md border border-slate-200 bg-white text-slate-900 font-bold text-[11px] w-40 outline-none focus:border-[#023859]"
          />

          <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 px-2 h-7">
            <Link2 className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={OLMART_CTA_DESTINATIONS.some((d) => d.value === btnLink) ? btnLink : "custom"}
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  emitPatch(sectionId, isPrimaryBtn ? { ctaLink: e.target.value } : { secondaryCtaLink: e.target.value });
                }
              }}
              className="text-[11px] font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              {OLMART_CTA_DESTINATIONS.map((dest) => (
                <option key={dest.value} value={dest.value}>Action : {dest.label}</option>
              ))}
              <option value="custom">Lien personnalisé</option>
            </select>
          </div>

          <input
            type="text"
            value={btnLink}
            placeholder="URL ou #ancre..."
            onChange={(e) => {
              const safeUrl = safeNavigationHref(e.target.value);
              emitPatch(sectionId, isPrimaryBtn ? { ctaLink: safeUrl } : { secondaryCtaLink: safeUrl });
            }}
            className="h-7 px-2 rounded-md border border-slate-200 bg-white text-slate-700 font-mono text-[11px] w-36 outline-none focus:border-[#023859]"
          />

          <div className="flex items-center bg-white rounded-md border border-slate-200 p-0.5">
            {(["solid", "outline", "glass", "pill"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => emitPatch(sectionId, isPrimaryBtn ? { ctaStyle: st } : { secondaryCtaStyle: st })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                  btnStyle === st ? "bg-[#023859] text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 h-7 cursor-pointer" title="Couleur du bouton">
            <span className="text-[10px] font-bold text-slate-600">Fond</span>
            <input
              type="color"
              value={btnColor}
              onChange={(e) => emitPatch(sectionId, isPrimaryBtn ? { ctaBgColor: e.target.value } : { secondaryCtaBgColor: e.target.value })}
              className="w-4 h-4 border-0 p-0 bg-transparent cursor-pointer"
            />
          </label>
        </div>
      )}
    </div>
  );
};
