import React, { useEffect, useState } from "react";
import { Check, Flame, LayoutTemplate, Palette, RefreshCw, Type } from "lucide-react";
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

interface ThemeInspectorPanelProps {
  storeConfig?: SellerStoreConfig | null;
  currentTheme?: CustomPageTheme;
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
  sector: "mode",
  primaryColor: "#023859",
  secondaryColor: "#011C40",
  accentColor: "#26658C",
  accentBadgeColor: "#54ACBF",
  canvasColor: "#F8FBFC",
  surfaceColor: "#FFFFFF",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  borderRadiusPx: 14,
  spacingYPx: 28,
  titleFontSizePx: 32,
  bodyFontSizePx: 15,
};

type ActiveTab = "architectures" | "colors" | "typography" | "widgets";

/**
 * Strips section-level color overrides (ctaBgColor, badgeBgColor, cardAccentColor)
 * so that applying a new theme palette immediately updates all existing sections.
 */
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
  const [activeTab, setActiveTab] = useState<ActiveTab>("architectures");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentTheme) {
      setTheme((prev) => ({
        ...prev,
        ...currentTheme,
      }));
    } else if (storeConfig?.theme) {
      setTheme((prev) => ({
        ...prev,
        ...storeConfig.theme,
      }));
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
      if (onReplaceSections) {
        onReplaceSections(newSections);
      }
      await onSaveTheme(newTheme);
    }
    setSavedSuccess(true);
    window.setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleApplyThemeOnly = async (newTheme: CustomPageTheme) => {
    setTheme(newTheme);
    onThemeChangeLive?.(newTheme);
    if (sections.length > 0 && onReplaceSections) {
      const cleanedSections = stripHardcodedSectionColors(sections);
      onReplaceSections(cleanedSections);
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
      settings: {
        ...currentSettings,
        imageUrl,
      } as unknown as CustomPageSection["settings"],
    });
  };

  return (
    <div className="flex h-full flex-col bg-white select-none">
      {/* Header */}
      <div className="border-b border-slate-200 p-3.5 flex items-center justify-between shrink-0 bg-[#F8FBFC]">
        <div>
          <h2 className="text-[13px] font-extrabold text-[#011C40]">
            Thèmes & Architectures
          </h2>
          <p className="text-[11px] text-slate-500">
            8 Designs modernes, couleurs & photos personnalisables
          </p>
        </div>
        {savedSuccess && (
          <span className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
            <Check className="h-3 w-3" /> Enregistré
          </span>
        )}
      </div>

      {/* 4 Tabs Segmented Bar */}
      <div className="flex border-b border-slate-200 bg-slate-100/80 p-1 shrink-0 gap-1">
        {[
          { id: "architectures" as const, label: "Thèmes", icon: LayoutTemplate },
          { id: "colors" as const, label: "Couleurs", icon: Palette },
          { id: "typography" as const, label: "Typo & Formes", icon: Type },
          { id: "widgets" as const, label: "Options Vente", icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-[#023859] shadow-2xs border border-slate-200/90"
                  : "text-slate-500 hover:text-[#011C40] hover:bg-white/60"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          <ThemeTypographyTab
            theme={theme}
            onUpdateTheme={updateTheme}
          />
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

      {/* Sticky Footer */}
      <div className="shrink-0 border-t border-slate-200 bg-white p-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || Boolean(error)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#023859] text-xs font-bold text-white shadow-xs transition-all hover:bg-[#011C40] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {saving ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Enregistrement…
            </>
          ) : (
            "Enregistrer les Préférences du Thème"
          )}
        </button>
      </div>
    </div>
  );
};
