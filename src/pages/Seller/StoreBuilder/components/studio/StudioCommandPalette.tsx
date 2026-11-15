import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Plus, Monitor, Tablet, Smartphone, Sparkles, Layers,
  Home, QrCode, Play, Edit3, UploadCloud, Undo2, Redo2, Palette,
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
    { id: "publish", label: "Publier la vitrine", keywords: "publier mettre en ligne", icon: UploadCloud, run: () => onPublish?.(), primary: true },
    { id: "undo", label: "Annuler (Ctrl+Z)", keywords: "annuler undo", icon: Undo2, run: () => onUndo?.(), disabled: !canUndo },
    { id: "redo", label: "Rétablir (Ctrl+Y)", keywords: "retablir redo", icon: Redo2, run: () => onRedo?.(), disabled: !canRedo },
    { id: "audit", label: "Audit qualité & SEO", keywords: "audit qualite contraste seo", icon: Sparkles, run: onOpenAuditModal },
    { id: "identity", label: "Identité & Charte de marque", keywords: "identite nom slogan logo marque", icon: Sparkles, run: () => onSelectNavMode?.("identity") },
    { id: "theme", label: "Thème, couleurs & polices", keywords: "theme couleurs polices design", icon: Palette, run: () => onSelectNavMode?.("theme") },
    { id: "atelier", label: "Atelier & Matières créatives", keywords: "atelier matieres effets", icon: Palette, run: () => onSelectNavMode?.("atelier") },
    { id: "sections", label: "Structure & Sections de page", keywords: "sections structure blocs accueil", icon: Layers, run: () => onSelectNavMode?.("sections") },
    { id: "catalog", label: "Catalogue produits", keywords: "catalogue produits articles stock", icon: Layers, run: () => onSelectNavMode?.("catalog") },
    { id: "media", label: "Médiathèque & Images", keywords: "medias images photos bannières", icon: LayoutTemplate, run: () => onSelectNavMode?.("media") },
    { id: "header", label: "En-tête & navigation", keywords: "entete header logo menu", icon: LayoutTemplate, run: () => onSelectNavMode?.("header") },
    { id: "pages", label: "Pages personnalisées", keywords: "pages politiques livraison", icon: FileText, run: () => onSelectNavMode?.("pages") },
    { id: "settings", label: "Livraison, SEO & pixels", keywords: "reglages parametres seo pixels", icon: Settings, run: () => onSelectNavMode?.("settings") },
    { id: "launchpad", label: "Check-list de lancement", keywords: "launchpad checklist guide etapes", icon: Sparkles, run: () => onSelectNavMode?.("launchpad") },
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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-14 sm:pt-20 p-4 select-none" data-testid="studio-command-palette" onClick={onClose}>
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[82vh]" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            data-testid="command-palette-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tapez une commande ou une section..."
            autoFocus
            className="w-full bg-transparent text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button type="button" onClick={onClose} className="px-1.5 py-0.5 text-[10.5px] font-mono text-slate-500 hover:text-slate-900 bg-slate-100 rounded shrink-0 cursor-pointer">
            ESC
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {filteredActions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400 block px-1">Actions rapides</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {filteredActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      disabled={act.disabled}
                      onClick={() => { act.run(); onClose(); }}
                      className={`px-2.5 py-2 rounded-lg text-left text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        act.primary
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!query.trim() && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block px-1">Aperçu &amp; Navigation</span>
              <div className="grid grid-cols-3 gap-1">
                {([
                  { id: "desktop" as const, label: "Bureau", icon: Monitor },
                  { id: "tablet" as const, label: "Tablette", icon: Tablet },
                  { id: "mobile" as const, label: "Mobile", icon: Smartphone },
                ]).map((vp) => {
                  const Icon = vp.icon;
                  return (
                    <button key={vp.id} type="button" onClick={() => { onSetViewport(vp.id); onClose(); }} className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-[12px] font-medium text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{vp.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-4 gap-1">
                <button type="button" onClick={() => { onNavigatePage("home"); onClose(); }} className="px-2 py-1.5 hover:bg-slate-100 rounded-lg text-[11.5px] font-medium text-slate-700 flex items-center justify-center gap-1 cursor-pointer">
                  <Home className="w-3.5 h-3.5" /><span>Accueil</span>
                </button>
                <button type="button" onClick={() => { onNavigatePage("collection"); onClose(); }} className="px-2 py-1.5 hover:bg-slate-100 rounded-lg text-[11.5px] font-medium text-slate-700 flex items-center justify-center gap-1 cursor-pointer">
                  <Layers className="w-3.5 h-3.5" /><span>Catalogue</span>
                </button>
                <button type="button" onClick={() => { onToggleInteractiveMode(); onClose(); }} className="px-2 py-1.5 hover:bg-slate-100 rounded-lg text-[11.5px] font-medium text-slate-700 flex items-center justify-center gap-1 cursor-pointer">
                  {isInteractiveMode ? <Edit3 className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isInteractiveMode ? "Édition" : "Tester"}</span>
                </button>
                <button type="button" onClick={() => { onOpenQrModal(); onClose(); }} className="px-2 py-1.5 hover:bg-slate-100 rounded-lg text-[11.5px] font-medium text-slate-700 flex items-center justify-center gap-1 cursor-pointer">
                  <QrCode className="w-3.5 h-3.5" /><span>QR Mobile</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 block px-1 tabular-nums">
              Ajouter une section ({filteredSections.length})
            </span>
            <div className="divide-y divide-slate-100">
              {filteredSections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.type}
                    type="button"
                    onClick={() => { onAddSection(sec.type, sec.defaultSettings, sec.title); onClose(); }}
                    className="w-full px-2.5 py-2 hover:bg-slate-50 rounded-lg text-left transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-[12px] text-slate-900 block truncate">{sec.title}</span>
                        <span className="text-[11px] text-slate-500 truncate block">{sec.category} · {sec.description}</span>
                      </div>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 shrink-0" />
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
