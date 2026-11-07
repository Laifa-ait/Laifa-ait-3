import React, { useEffect, useState } from "react";
import { Check, Flame, LayoutTemplate, Palette, RefreshCw, Sparkles, Type } from "lucide-react";
import {
  CustomPageSection,
  CustomPageTheme,
  MediaGalleryItem,
  SellerStoreConfig,
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

const DEFAULT_THEME: CustomPageTheme = {
  sector: "artisanat",
  primaryColor: "#B45309",
  secondaryColor: "#18181B",
  accentColor: "#B45309",
  accentBadgeColor: "#B45309",
  canvasColor: "#FAF6F0",
  surfaceColor: "#FFFFFF",
  fontFamily: "'Cormorant Garamond', 'Plus Jakarta Sans', serif",
  borderRadiusPx: 16,
  spacingYPx: 28,
  titleFontSizePx: 36,
  bodyFontSizePx: 15,
  surfaceTexture: "cotton-paper",
  ambientLighting: "golden-hour",
  cardMaterial: "solid-matte",
  frameShape: "casbah-arch",
};

function stripHardcodedSectionColors(sections: CustomPageSection[]): CustomPageSection[] {
  return sections.map((sec) => {
    const rawSettings = { ...((sec.settings || {}) as Record<string, unknown>) };
    delete rawSettings.ctaBgColor;
    delete rawSettings.ctaTextColor;
    delete rawSettings.badgeBgColor;
    delete rawSettings.badgeTextColor;
    delete rawSettings.cardAccentColor;

    const rawStyles = { ...(sec.styles || {}) };
    delete rawStyles.buttonBgColor;
    delete rawStyles.buttonTextColor;

    return {
      ...sec,
      settings: rawSettings as unknown as CustomPageSection["settings"],
      styles: rawStyles,
    };
  });
}

export const ThemeInspectorPanel: React.FC<ThemeInspectorPanelProps> = ({
  storeConfig,
  currentTheme,
  initialTab = "atelier",
  sections = [],
  mediaGallery = [],
  onUploadMedia,
  onUpdateSection,
  onReplaceSections,
  onSaveTheme,
  onThemeChangeLive,
  onApplyFullArchetype,
}) => {
  const [theme, setTheme] = useState<CustomPageTheme>(() => ({
    ...DEFAULT_THEME,
    ...storeConfig?.theme,
    ...currentTheme,
  }));
  const [activeTab, setActiveTab] = useState<ThemeInspectorTabId>(initialTab);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (currentTheme) {
      setTheme((prev) => ({ ...prev, ...currentTheme }));
    } else if (storeConfig?.theme) {
      setTheme((prev) => ({ ...prev, ...storeConfig.theme }));
    }
  }, [currentTheme, storeConfig?.theme]);

  const updateTheme = (patch: Partial<CustomPageTheme>) => {
    setSavedSuccess(false);
    setError(null);
    const next = { ...theme, ...patch };
    setTheme(next);
    onThemeChangeLive?.(next);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setError(null);
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
    setTheme(newTheme);
    onThemeChangeLive?.(newTheme);
    if (onApplyFullArchetype) {
      await onApplyFullArchetype(newSections, newTheme);
    } else {
      if (onReplaceSections) onReplaceSections(newSections);
      await onSaveTheme(newTheme);
    }
    setSavedSuccess(true);
    window.setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleApplyThemeOnly = async (newTheme: CustomPageTheme) => {
    setTheme(newTheme);
    onThemeChangeLive?.(newTheme);
    if (sections.length > 0 && onReplaceSections) {
      onReplaceSections(stripHardcodedSectionColors(sections));
    }
    await onSaveTheme(newTheme);
    setSavedSuccess(true);
    window.setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleUpdateActiveHeroPhoto = (imageUrl: string) => {
    const heroSec = sections.find((s) => s.type === "hero_banner");
    if (!heroSec || !onUpdateSection) return;
    const currentSettings = (heroSec.settings || {}) as Record<string, unknown>;
    onUpdateSection(heroSec.id, {
      settings: { ...currentSettings, imageUrl } as unknown as CustomPageSection["settings"],
    });
  };

  return (
    <div className="flex h-full flex-col bg-white select-none">
      <div className="border-b border-slate-200 p-3.5 flex items-center justify-between shrink-0 bg-[#FAF6F0]">
        <div>
          <h2 className="text-[13px] font-extrabold text-zinc-900">
            Atelier d&apos;Art & Scénographie
          </h2>
          <p className="text-[11px] text-zinc-500">
            5 Presets 60-30-10, textures, silhouettes & typographie
          </p>
        </div>
        {savedSuccess && (
          <span className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
            <Check className="h-3 w-3" /> Synchronisé
          </span>
        )}
      </div>

      <div className="flex border-b border-slate-200 bg-slate-100/80 p-1 shrink-0 gap-0.5 overflow-x-auto">
        {[
          { id: "atelier" as const, label: "✨ Atelier", icon: Sparkles },
          { id: "architectures" as const, label: "Thèmes", icon: LayoutTemplate },
          { id: "colors" as const, label: "60-30-10", icon: Palette },
          { id: "typography" as const, label: "Typo", icon: Type },
          { id: "widgets" as const, label: "Vente", icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-zinc-900 shadow-2xs border border-slate-200/90"
                  : "text-slate-500 hover:text-zinc-900 hover:bg-white/60"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
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
            onApplyPresetWithFiveActs={(newSecs, newTheme) =>
              void handleApplyFullArchetype(newSecs, newTheme)
            }
          />
        )}
        {activeTab === "architectures" && (
          <ThemeArchetypesTab
            currentTheme={theme}
            mediaGallery={mediaGallery}
            onUploadMedia={onUploadMedia}
            onUpdateActiveHeroPhoto={handleUpdateActiveHeroPhoto}
            onApplyThemeOnly={(newTheme) => void handleApplyThemeOnly(newTheme)}
            onApplyFullArchetype={(newSecs, newTheme) => void handleApplyFullArchetype(newSecs, newTheme)}
          />
        )}
        {activeTab === "colors" && (
          <ThemeColorPaletteTab
            theme={theme}
            onUpdateTheme={(patch) => {
              updateTheme(patch);
              if (sections.length > 0 && onReplaceSections) {
                onReplaceSections(stripHardcodedSectionColors(sections));
              }
            }}
            onErrorChange={setError}
          />
        )}
        {activeTab === "typography" && (
          <ThemeTypographyTab theme={theme} onUpdateTheme={updateTheme} />
        )}
        {activeTab === "widgets" && (
          <ThemeEcommerceWidgetsTab
            sections={sections}
            onUpdateSection={onUpdateSection || (() => undefined)}
            onReplaceSections={onReplaceSections}
          />
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 p-3 text-[11px] font-medium text-rose-700">
            {error}
          </p>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white p-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || Boolean(error)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-xs font-bold text-white shadow-xs transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {saving ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Enregistrement…
            </>
          ) : (
            "Enregistrer les Matières & le Thème"
          )}
        </button>
      </div>
    </div>
  );
};
