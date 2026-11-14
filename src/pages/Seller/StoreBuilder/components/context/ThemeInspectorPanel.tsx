import React, { useEffect, useState } from "react";
import { Check, Flame, LayoutTemplate, Palette, RefreshCw, RotateCcw, Sparkles, Type } from "lucide-react";
import {
  CustomPageSection, CustomPageTheme, MediaGalleryItem, SellerStoreConfig,
} from "../../../../../domains/seller/customPage.types";
import { ThemeArchetypesTab } from "./ThemeArchetypesTab";
import { ThemeColorPaletteTab } from "./ThemeColorPaletteTab";
import { ThemeTypographyTab } from "./ThemeTypographyTab";
import { ThemeEcommerceWidgetsTab } from "./ThemeEcommerceWidgetsTab";
import { ThemeAtelierMaterialsTab } from "./ThemeAtelierMaterialsTab";

export type ThemeInspectorTabId = "architectures" | "atelier" | "colors" | "typography" | "widgets";

interface ThemeInspectorPanelProps {
  storeConfig?: SellerStoreConfig | null;
  currentTheme?: CustomPageTheme;
  initialTab?: ThemeInspectorTabId;
  sections?: CustomPageSection[];
  mediaGallery?: MediaGalleryItem[];
  onUploadMedia?: (file: File) => Promise<MediaGalleryItem>;
  onUpdateSection?: (id: string, patch: Partial<CustomPageSection>) => void;
  onReplaceSections?: (sections: CustomPageSection[]) => void;
  onSaveTheme: (theme: CustomPageTheme) => Promise<void>;
  onThemeChangeLive?: (theme: CustomPageTheme) => void;
  onApplyFullArchetype?: (sections: CustomPageSection[], theme: CustomPageTheme) => Promise<void> | void;
}

import {
  DEFAULT_GLOBAL_DESIGN_SYSTEM,
  stripHardcodedSectionColors,
} from "./themeInspectorDefaults";

export { DEFAULT_GLOBAL_DESIGN_SYSTEM, stripHardcodedSectionColors };

const THEME_TABS = [
  { id: "atelier" as const, label: "Thèmes", icon: Sparkles },
  { id: "architectures" as const, label: "Templates", icon: LayoutTemplate },
  { id: "colors" as const, label: "Couleurs", icon: Palette },
  { id: "typography" as const, label: "Typo", icon: Type },
  { id: "widgets" as const, label: "Vente", icon: Flame },
];

export const ThemeInspectorPanel: React.FC<ThemeInspectorPanelProps> = ({
  storeConfig, currentTheme, initialTab = "atelier", sections = [],
  mediaGallery = [], onUploadMedia, onUpdateSection, onReplaceSections,
  onSaveTheme, onThemeChangeLive, onApplyFullArchetype,
}) => {
  const [theme, setTheme] = useState<CustomPageTheme>(() => ({
    ...DEFAULT_GLOBAL_DESIGN_SYSTEM, ...storeConfig?.theme, ...currentTheme,
  }));
  const [activeTab, setActiveTab] = useState<ThemeInspectorTabId>(initialTab);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setActiveTab(initialTab), [initialTab]);
  useEffect(() => {
    if (currentTheme) setTheme((prev) => ({ ...prev, ...currentTheme }));
    else if (storeConfig?.theme) setTheme((prev) => ({ ...prev, ...storeConfig.theme }));
  }, [currentTheme, storeConfig?.theme]);

  const updateTheme = (patch: Partial<CustomPageTheme>) => {
    setSavedSuccess(false); setError(null);
    const next = { ...theme, ...patch };
    setTheme(next);
    onThemeChangeLive?.(next);
  };

  const handleResetGlobalTheme = () => {
    setSavedSuccess(false); setError(null);
    setTheme(DEFAULT_GLOBAL_DESIGN_SYSTEM);
    onThemeChangeLive?.(DEFAULT_GLOBAL_DESIGN_SYSTEM);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true); setSavedSuccess(false); setError(null);
    try {
      await onSaveTheme(theme);
      setSavedSuccess(true);
      window.setTimeout(() => setSavedSuccess(false), 2500);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Échec de l'enregistrement du thème.");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyFullArchetype = async (newSections: CustomPageSection[], newTheme: CustomPageTheme) => {
    const cleanedSections = stripHardcodedSectionColors(newSections);
    setTheme(newTheme); onThemeChangeLive?.(newTheme);
    if (onApplyFullArchetype) await onApplyFullArchetype(cleanedSections, newTheme);
    else { if (onReplaceSections) onReplaceSections(cleanedSections); await onSaveTheme(newTheme); }
    setSavedSuccess(true); window.setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleApplyThemeOnly = async (newTheme: CustomPageTheme) => {
    setTheme(newTheme); onThemeChangeLive?.(newTheme);
    if (sections.length > 0 && onReplaceSections) onReplaceSections(stripHardcodedSectionColors(sections));
    await onSaveTheme(newTheme);
    setSavedSuccess(true); window.setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleUpdateActiveHeroPhoto = (imageUrl: string) => {
    const heroSec = sections.find((s) => s.type === "hero_banner");
    if (!heroSec || !onUpdateSection) return;
    const currentSettings = (heroSec.settings || {}) as Record<string, unknown>;
    onUpdateSection(heroSec.id, { settings: { ...currentSettings, imageUrl } as unknown as CustomPageSection["settings"] });
  };

  return (
    <div className="flex h-full flex-col bg-white select-none" data-testid="theme-inspector-panel">
      <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">Design System Global</h2>
          <p className="text-[11px] text-slate-500">Thèmes, couleurs globales, typographies &amp; matières</p>
        </div>
        <div className="flex items-center gap-1.5">
          {savedSuccess && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5" /> Synchronisé
            </span>
          )}
          <button
            type="button"
            title="Réinitialiser le thème global"
            data-testid="reset-global-theme-btn"
            onClick={handleResetGlobalTheme}
            className="h-7 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" /><span>Réinitialiser</span>
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 bg-white px-2 shrink-0 gap-1 overflow-x-auto">
        {THEME_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={`theme-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 px-1.5 border-b-2 text-[11px] transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-slate-900 text-slate-900 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "atelier" && (
          <ThemeAtelierMaterialsTab
            theme={theme}
            storeConfig={storeConfig}
            sections={sections}
            onUpdateTheme={updateTheme}
            onApplyPresetWithFiveActs={(newSecs, newTheme) => void handleApplyFullArchetype(newSecs, newTheme)}
          />
        )}
        {activeTab === "architectures" && (
          <ThemeArchetypesTab
            currentTheme={theme}
            sections={sections}
            mediaGallery={mediaGallery}
            onUploadMedia={onUploadMedia}
            onUpdateActiveHeroPhoto={handleUpdateActiveHeroPhoto}
            onApplyThemeOnly={(newTheme) => void handleApplyThemeOnly(newTheme)}
            onApplyFullArchetype={(newSecs, newTheme) => void handleApplyFullArchetype(newSecs, newTheme)}
          />
        )}
        {activeTab === "colors" && <ThemeColorPaletteTab theme={theme} onUpdateTheme={(patch) => updateTheme(patch)} onErrorChange={setError} />}
        {activeTab === "typography" && <ThemeTypographyTab theme={theme} onUpdateTheme={updateTheme} />}
        {activeTab === "widgets" && <ThemeEcommerceWidgetsTab sections={sections} onUpdateSection={onUpdateSection || (() => undefined)} onReplaceSections={onReplaceSections} />}
        {error && <p role="alert" className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-[11px] font-medium text-rose-700">{error}</p>}
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white p-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || Boolean(error)}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {saving ? (<><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Enregistrement…</>) : "Enregistrer le thème global"}
        </button>
      </div>
    </div>
  );
};
