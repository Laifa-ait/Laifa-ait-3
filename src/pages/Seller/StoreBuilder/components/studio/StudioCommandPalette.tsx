import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Layers,
  Home,
  QrCode,
} from "lucide-react";
import { CustomPageSectionType } from "../../../../../domains/seller/customPage.types";
import { SECTION_CATALOG } from "../../constants/sectionCatalog";

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
}

export const StudioCommandPalette: React.FC<StudioCommandPaletteProps> = ({
  isOpen,
  onClose,
  onAddSection,
  onSetViewport,
  onNavigatePage,
  onToggleInteractiveMode: _onToggleInteractiveMode,
  isInteractiveMode: _isInteractiveMode,
  onOpenAuditModal,
  onOpenQrModal,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or trigger
          window.dispatchEvent(new CustomEvent("studio:open-command-palette"));
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTION_CATALOG;
    return SECTION_CATALOG.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-orange-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une section, un outil ou changer de vue (ex: hero, mobile, audit)..."
            autoFocus
            className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-200 rounded-md shrink-0 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions & Viewports */}
          {!query.trim() && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block px-1">
                Aperçu Appareil & Mode
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onSetViewport("desktop");
                    onClose();
                  }}
                  className="p-2 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Monitor className="w-3.5 h-3.5 text-orange-500" />
                  <span>PC (Desktop)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetViewport("tablet");
                    onClose();
                  }}
                  className="p-2 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Tablet className="w-3.5 h-3.5 text-orange-500" />
                  <span>Tablette</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetViewport("mobile");
                    onClose();
                  }}
                  className="p-2 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-orange-500" />
                  <span>Téléphone</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onNavigatePage("home");
                    onClose();
                  }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Home className="w-4 h-4 text-orange-500" />
                  <span>Page d'Accueil Vitrine</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigatePage("collection");
                    onClose();
                  }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-orange-500" />
                  <span>Page Catalogue & Rayons</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuditModal();
                    onClose();
                  }}
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Lancer l'Audit de Vitrine</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenQrModal();
                    onClose();
                  }}
                  className="p-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl text-xs font-bold text-orange-800 flex items-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-orange-600" />
                  <span>Tester QR Code Téléphone</span>
                </button>
              </div>
            </div>
          )}

          {/* Section Library */}
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
                    onClick={() => {
                      onAddSection(sec.type, sec.defaultSettings, sec.title);
                      onClose();
                    }}
                    className="w-full p-2.5 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-900 block truncate group-hover:text-orange-700">
                          {sec.title}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {sec.category} • {sec.description}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-white group-hover:bg-orange-500 group-hover:text-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-700 shrink-0 transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      <span>Ajouter</span>
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
