import React, { useState } from "react";
import {
  CustomPageSection,
  CustomPageTheme,
  MediaGalleryItem,
  StoreThemeSector,
} from "../../../../../domains/seller/customPage.types";
import { MASTER_THEME_ARCHETYPES, MasterThemeArchetype } from "./themeArchetypes";
import { EXTRA_UNIVERSE_ARCHETYPES } from "./extraThemeArchetypes";
import { AlertTriangle, Check, Eye, LayoutTemplate, Palette, X } from "lucide-react";

export type StoreArchetype = MasterThemeArchetype;

interface ThemeArchetypesTabProps {
  theme?: CustomPageTheme;
  currentTheme?: CustomPageTheme;
  activeArchetypeId?: string | null;
  sections?: CustomPageSection[];
  mediaGallery?: MediaGalleryItem[];
  onUploadMedia?: (file: File) => Promise<MediaGalleryItem>;
  onUpdateSection?: (id: string, updatedData: Partial<CustomPageSection>) => void;
  onUpdateActiveHeroPhoto?: (imageUrl: string) => void;
  onSelectArchetype?: (arch: MasterThemeArchetype) => void;
  onApplyThemeOnly?: (newTheme: CustomPageTheme) => Promise<void> | void;
  onApplyFullArchetype?: (sections: CustomPageSection[], theme: CustomPageTheme) => Promise<void> | void;
}

const UNIVERSE_FILTERS: Array<{ id: "all" | StoreThemeSector; label: string }> = [
  { id: "all", label: "Tous" },
  { id: "mode", label: "Mode Élégance" },
  { id: "tech", label: "Technologie" },
  { id: "beaute", label: "Beauté" },
  { id: "artisanat", label: "Artisanat algérien" },
  { id: "maison", label: "Maison & Décoration" },
  { id: "alimentation", label: "Alimentation" },
  { id: "sport", label: "Sport" },
  { id: "accessoires", label: "Accessoires" },
  { id: "enfants", label: "Produits Enfants" },
];

export const ALL_ARCHETYPES: MasterThemeArchetype[] = [
  ...MASTER_THEME_ARCHETYPES,
  ...EXTRA_UNIVERSE_ARCHETYPES,
];

export const ThemeArchetypesTab: React.FC<ThemeArchetypesTabProps> = ({
  theme: propTheme,
  currentTheme,
  activeArchetypeId = null,
  sections = [],
  onSelectArchetype,
  onApplyThemeOnly,
  onApplyFullArchetype,
}) => {
  const theme = propTheme || currentTheme || ALL_ARCHETYPES[0].theme;
  const applyColorsOnly = (arch: MasterThemeArchetype) => {
    if (onSelectArchetype) onSelectArchetype(arch);
    if (onApplyThemeOnly) void onApplyThemeOnly(arch.theme);
  };
  const [selectedUniverse, setSelectedUniverse] = useState<"all" | StoreThemeSector>("all");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [previewArchetype, setPreviewArchetype] = useState<MasterThemeArchetype | null>(null);
  const [pendingConfirmArchetype, setPendingConfirmArchetype] = useState<MasterThemeArchetype | null>(null);

  const filteredArchetypes =
    selectedUniverse === "all"
      ? ALL_ARCHETYPES
      : ALL_ARCHETYPES.filter((a) => a.sector === selectedUniverse);

  const executeApplyFull = async (arch: MasterThemeArchetype) => {
    setApplyingId(arch.id);
    setPendingConfirmArchetype(null);
    applyColorsOnly(arch);

    const existingHero = sections.find((s) => s.type === "hero_banner");
    const existingHeroSettings = existingHero?.settings as Record<string, unknown> | undefined;
    const rawExistingUrl = String(
      existingHeroSettings?.imageUrl || existingHeroSettings?.backgroundImage || ""
    ).trim();
    const isCustomUserPhoto =
      Boolean(rawExistingUrl) && !rawExistingUrl.startsWith("data:image/svg+xml");

    if (onApplyFullArchetype) {
      await onApplyFullArchetype(
        arch.generateSections(isCustomUserPhoto ? rawExistingUrl : undefined),
        arch.theme
      );
    }
    setTimeout(() => setApplyingId(null), 600);
  };

  return (
    <div className="space-y-3" data-testid="theme-archetypes-tab">
      <div className="pb-2.5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[12px] font-semibold text-slate-900">Templates par secteur</span>
          <p className="text-[11px] text-slate-500">Appliquez une palette ou remplacez la mise en page</p>
        </div>
        <span className="text-[11px] font-medium text-slate-400 tabular-nums shrink-0">{ALL_ARCHETYPES.length} modèles</span>
      </div>

      <div className="flex flex-wrap gap-1" data-testid="universe-filter-bar">
        {UNIVERSE_FILTERS.map((u) => (
          <button
            key={u.id}
            type="button"
            data-testid={`universe-filter-${u.id}`}
            onClick={() => setSelectedUniverse(u.id)}
            className={`px-2 py-1 rounded-md text-[10.5px] font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              selectedUniverse === u.id
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>

      {previewArchetype && (
        <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 space-y-2" data-testid="archetype-preview-modal">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-900">Aperçu : {previewArchetype.name}</h4>
            <button type="button" onClick={() => setPreviewArchetype(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-600">{previewArchetype.tagline}</p>
          <div className="space-y-1">
            {previewArchetype.generateSections().map((sec, i) => (
              <div key={sec.id} className="px-2 py-1 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700">
                {i + 1}. {sec.title || sec.type} <span className="text-slate-400 font-mono text-[10px]">({sec.type})</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => applyColorsOnly(previewArchetype)} className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
              Palette seule
            </button>
            <button type="button" onClick={() => { setPendingConfirmArchetype(previewArchetype); setPreviewArchetype(null); }} className="flex-1 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-medium hover:bg-slate-800 cursor-pointer">
              Appliquer le template...
            </button>
          </div>
        </div>
      )}

      {pendingConfirmArchetype && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2" data-testid="confirm-apply-archetype-banner">
          <div className="flex items-start gap-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="text-[11px]">
              <p className="font-semibold">Remplacer la mise en page actuelle ?</p>
              <p className="mt-0.5 text-amber-800">
                « {pendingConfirmArchetype.name} » remplacera vos {sections.length} section(s).
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" data-testid="cancel-apply-archetype-btn" onClick={() => setPendingConfirmArchetype(null)} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 cursor-pointer">
              Annuler
            </button>
            <button type="button" data-testid="confirm-apply-archetype-btn" onClick={() => executeApplyFull(pendingConfirmArchetype)} className="px-3 py-1 rounded-md bg-slate-900 text-white text-[11px] font-semibold cursor-pointer">
              Confirmer
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5">
        {filteredArchetypes.map((arch) => {
          const isSelected =
            activeArchetypeId === arch.id ||
            (theme.primaryColor.toLowerCase() === arch.theme.primaryColor.toLowerCase() &&
              theme.sector === arch.theme.sector);
          const isApplying = applyingId === arch.id;

          return (
            <div key={arch.id} data-testid={`archetype-card-${arch.id}`} className={`rounded-xl border overflow-hidden transition-colors ${isSelected ? "border-slate-900 ring-1 ring-slate-900/15 bg-white" : "border-slate-200 bg-white"}`}>
              <div className="relative h-20 bg-slate-900 overflow-hidden">
                <img src={arch.thumbnailUrl} alt={arch.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block text-[9px] font-medium text-white/75 truncate">{arch.badge}</span>
                    <span className="text-white font-semibold text-[12px] truncate block">{arch.name}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {[arch.theme.primaryColor, arch.theme.secondaryColor || "#111", arch.theme.canvasColor || "#FFF"].map((c, i) => (
                      <span key={i} className="w-2.5 h-2.5 rounded-full border border-white/60" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-2.5 space-y-2">
                <p className="text-[11px] text-slate-500 line-clamp-2">{arch.tagline}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button type="button" data-testid={`preview-archetype-${arch.id}`} onClick={() => setPreviewArchetype(arch)} className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10.5px] font-medium text-slate-700 cursor-pointer whitespace-nowrap">
                    <Eye className="w-3 h-3" /><span>Aperçu</span>
                  </button>
                  <button type="button" data-testid={`colors-only-archetype-${arch.id}`} onClick={() => applyColorsOnly(arch)} className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10.5px] font-medium text-slate-700 cursor-pointer whitespace-nowrap">
                    <Palette className="w-3 h-3" /><span>Couleurs</span>
                  </button>
                  <button type="button" data-testid={`apply-full-archetype-${arch.id}`} onClick={() => setPendingConfirmArchetype(arch)} className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10.5px] font-medium cursor-pointer whitespace-nowrap">
                    {isApplying ? <Check className="w-3 h-3" /> : <LayoutTemplate className="w-3 h-3" />}
                    <span>Template</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
