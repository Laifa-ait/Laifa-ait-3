import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Plus, Monitor, Tablet, Smartphone, Sparkles, Layers,
  Home, QrCode, Play, Edit3, Rocket, Undo2, Redo2, Palette,
  Settings, FileText, LayoutTemplate,
} from "lucide-react";
import { CustomPageSectionType } from "../../../../../domains/seller/customPage.types";
import { SECTION_CATALOG } from "../../constants/sectionCatalog";
import { StudioNavMode } from "./studio.types";

interface StudioCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
  onSetViewport: (vp: "desktop" | "tablet" | "mobile") => void;
  onNavigatePage: (viewMode: "home" | "collection" | "category", slug?: string) => void;
  onToggleInteractiveMode: () => void;
  isInteractiveMode: boolean;
  onOpenAuditModal: () => void;
  onOpenQrModal: () => void;
  onPublish?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onSelectNavMode?: (mode: StudioNavMode) => void;
}

export const StudioCommandPalette: React.FC<StudioCommandPaletteProps> = ({
  isOpen, onClose, onAddSection, onSetViewport, onNavigatePage,
  onToggleInteractiveMode, isInteractiveMode, onOpenAuditModal, onOpenQrModal,
  onPublish, onUndo, onRedo, canUndo, canRedo, onSelectNavMode,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent("studio:open-command-palette"));
      }
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const quickActions = useMemo(() => [
    { id: "publish", label: "Publier la vitrine en ligne", keywords: "publier mettre en ligne sauvegarder", icon: Rocket, run: () => onPublish?.(), primary: true },
    { id: "undo", label: "Annuler la dernière modification (Ctrl+Z)", keywords: "annuler undo retour arriere", icon: Undo2, run: () => onUndo?.(), disabled: !canUndo },
    { id: "redo", label: "Rétablir la modification (Ctrl+Y)", keywords: "retablir redo", icon: Redo2, run: () => onRedo?.(), disabled: !canRedo },
    { id: "audit", label: "Ouvrir l'Audit Qualité & Accessibilité WCAG", keywords: "audit qualite contraste seo accessibilite", icon: Sparkles, run: onOpenAuditModal },
    { id: "theme", label: "Ouvrir Design, Thème & Typographie (Polices)", keywords: "theme couleurs polices typographie design sliders", icon: Palette, run: () => onSelectNavMode?.("theme") },
    { id: "header", label: "Ouvrir En-tête, Logo & Identité Boutique", keywords: "entete header logo banniere identite", icon: LayoutTemplate, run: () => onSelectNavMode?.("header") },
    { id: "settings", label: "Ouvrir Réglages, SEO & Pixels Marketing", keywords: "reglages parametres seo meta pixels tiktok facebook", icon: Settings, run: () => onSelectNavMode?.("settings") },
    { id: "pages", label: "Ouvrir Pages, Livraison 69 Wilayas & Politiques", keywords: "pages politiques livraison retour 69 wilayas", icon: FileText, run: () => onSelectNavMode?.("pages") },
  ], [onPublish, onUndo, onRedo, canUndo, canRedo, onOpenAuditModal, onSelectNavMode]);

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quickActions;
    return quickActions.filter((a) => a.label.toLowerCase().includes(q) || a.keywords.includes(q));
  }, [query, quickActions]);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTION_CATALOG;
    return SECTION_CATALOG.filter(
      (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#011C40]/70 backdrop-blur-xs flex items-start justify-center pt-14 sm:pt-20 p-4 select-none" onClick={onClose}>
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[82vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3 bg-[#F8FBFC]">
          <Search className="w-5 h-5 text-[#023859] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher : publier, annuler, thème, SEO, audit, mobile, section..."
            autoFocus
            className="w-full bg-transparent text-sm font-semibold text-[#011C40] placeholder:text-slate-400 focus:outline-none"
          />
          <button type="button" onClick={onClose} className="px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 hover:text-[#011C40] bg-white border border-slate-200 rounded-md shrink-0 cursor-pointer">
            ESC
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {filteredActions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block px-1">
                Actions Studio & Réglages Rapides
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      disabled={act.disabled}
                      onClick={() => { act.run(); onClose(); }}
                      className={`p-2 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        act.primary
                          ? "bg-[#023859] text-white border-[#023859] hover:bg-[#011C40]"
                          : "bg-slate-50 hover:bg-[#F0F7FA] border-slate-200 hover:border-[#54ACBF] text-[#011C40]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${act.primary ? "text-amber-300" : "text-[#023859]"}`} />
                      <span className="truncate">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!query.trim() && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block px-1">
                Aperçu Appareil & Navigation
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { id: "desktop" as const, label: "PC (Desktop)", icon: Monitor },
                  { id: "tablet" as const, label: "Tablette", icon: Tablet },
                  { id: "mobile" as const, label: "Téléphone", icon: Smartphone },
                ]).map((vp) => {
                  const Icon = vp.icon;
                  return (
                    <button key={vp.id} type="button" onClick={() => { onSetViewport(vp.id); onClose(); }} className="p-2 bg-slate-50 hover:bg-[#F0F7FA] border border-slate-200 hover:border-[#54ACBF] rounded-xl text-xs font-bold text-[#011C40] flex items-center justify-center gap-1.5 cursor-pointer">
                      <Icon className="w-3.5 h-3.5 text-[#023859]" />
                      <span>{vp.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <button type="button" onClick={() => { onNavigatePage("home"); onClose(); }} className="p-2 bg-slate-50 hover:bg-[#F0F7FA] border border-slate-200 rounded-xl text-[11px] font-bold text-[#011C40] flex items-center justify-center gap-1 cursor-pointer">
                  <Home className="w-3.5 h-3.5 text-[#023859]" /><span>Accueil</span>
                </button>
                <button type="button" onClick={() => { onNavigatePage("collection"); onClose(); }} className="p-2 bg-slate-50 hover:bg-[#F0F7FA] border border-slate-200 rounded-xl text-[11px] font-bold text-[#011C40] flex items-center justify-center gap-1 cursor-pointer">
                  <Layers className="w-3.5 h-3.5 text-[#023859]" /><span>Catalogue</span>
                </button>
                <button type="button" onClick={() => { onToggleInteractiveMode(); onClose(); }} className="p-2 bg-[#F0F7FA] hover:bg-[#023859] hover:text-white border border-[#54ACBF]/50 rounded-xl text-[11px] font-bold text-[#023859] flex items-center justify-center gap-1 cursor-pointer">
                  {isInteractiveMode ? <Edit3 className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isInteractiveMode ? "Édition" : "Test Client"}</span>
                </button>
                <button type="button" onClick={() => { onOpenQrModal(); onClose(); }} className="p-2 bg-slate-50 hover:bg-[#F0F7FA] border border-slate-200 rounded-xl text-[11px] font-bold text-[#011C40] flex items-center justify-center gap-1 cursor-pointer">
                  <QrCode className="w-3.5 h-3.5 text-[#023859]" /><span>QR Mobile</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block px-1">
              Ajouter une Section ({filteredSections.length})
            </span>
            <div className="space-y-1">
              {filteredSections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.type}
                    type="button"
                    onClick={() => { onAddSection(sec.type, sec.defaultSettings, sec.title); onClose(); }}
                    className="w-full p-2.5 bg-slate-50 hover:bg-[#F0F7FA] border border-slate-200 hover:border-[#54ACBF] rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#023859] flex items-center justify-center shrink-0 group-hover:bg-[#023859] group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-[#011C40] block truncate group-hover:text-[#023859]">{sec.title}</span>
                        <span className="text-[10px] text-slate-500 truncate block">{sec.category} • {sec.description}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-white group-hover:bg-[#023859] group-hover:text-white border border-slate-200 rounded-md text-[10px] font-bold text-[#011C40] shrink-0 transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3" /><span>Ajouter</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
