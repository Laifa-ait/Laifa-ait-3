import React, { useState, useRef } from "react";
import {
  Camera,
  Check,
  Image as ImageIcon,
  Link2,
  Palette,
  RotateCcw,
  Upload,
  X,
  Zap,
} from "lucide-react";
import {
  CustomPageSection,
  CustomPageTheme,
  MediaGalleryItem,
} from "../../../../../domains/seller/customPage.types";
import {
  MASTER_THEME_ARCHETYPES,
  MasterThemeArchetype,
} from "./themeArchetypes";

const CUSTOM_PHOTOS_STORAGE_KEY = "olmart_studio_theme_custom_photos_v1";

function loadSavedThemePhotos(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CUSTOM_PHOTOS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, string>;
    }
    return {};
  } catch {
    return {};
  }
}

function saveThemePhotosMap(map: Record<string, string>): void {
  try {
    localStorage.setItem(CUSTOM_PHOTOS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

interface ThemeArchetypesTabProps {
  currentTheme: CustomPageTheme;
  mediaGallery?: MediaGalleryItem[];
  onUploadMedia?: (file: File) => Promise<MediaGalleryItem>;
  onUpdateActiveHeroPhoto?: (imageUrl: string) => void;
  onApplyThemeOnly: (theme: CustomPageTheme) => void;
  onApplyFullArchetype: (sections: CustomPageSection[], theme: CustomPageTheme) => void;
}

export const ThemeArchetypesTab: React.FC<ThemeArchetypesTabProps> = ({
  currentTheme,
  mediaGallery = [],
  onUploadMedia,
  onUpdateActiveHeroPhoto,
  onApplyThemeOnly,
  onApplyFullArchetype,
}) => {
  const [selectedId, setSelectedId] = useState<string>("azur-prestige");
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>(() =>
    loadSavedThemePhotos()
  );
  const [photoEditorThemeId, setPhotoEditorThemeId] = useState<string | null>(null);
  const [urlInputValue, setUrlInputValue] = useState<string>("");
  const [uploadingThemeId, setUploadingThemeId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadTargetRef = useRef<string | null>(null);

  const showFeedback = (text: string) => {
    setAppliedNotice(text);
    window.setTimeout(() => setAppliedNotice(null), 3200);
  };

  const setCustomPhotoForTheme = (themeId: string, url: string | null) => {
    setCustomPhotos((prev) => {
      const next = { ...prev };
      if (!url) {
        delete next[themeId];
      } else {
        next[themeId] = url;
      }
      saveThemePhotosMap(next);
      return next;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetThemeId = activeUploadTargetRef.current;
    e.target.value = "";
    if (!file || !targetThemeId) return;

    setUploadingThemeId(targetThemeId);
    try {
      if (onUploadMedia) {
        const uploaded = await onUploadMedia(file);
        if (uploaded?.url) {
          setCustomPhotoForTheme(targetThemeId, uploaded.url);
          if (onUpdateActiveHeroPhoto) {
            onUpdateActiveHeroPhoto(uploaded.url);
          }
          showFeedback("Photo importée et appliquée avec succès !");
          setUploadingThemeId(null);
          return;
        }
      }

      // Fallback local Data URL reader so user photo import always works
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setCustomPhotoForTheme(targetThemeId, reader.result);
          if (onUpdateActiveHeroPhoto) {
            onUpdateActiveHeroPhoto(reader.result);
          }
          showFeedback("Photo importée depuis votre appareil !");
        }
        setUploadingThemeId(null);
      };
      reader.onerror = () => {
        setUploadingThemeId(null);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingThemeId(null);
    }
  };

  const triggerDeviceUpload = (themeId: string) => {
    activeUploadTargetRef.current = themeId;
    fileInputRef.current?.click();
  };

  const handleApplyFull = (archetype: MasterThemeArchetype) => {
    const customHeroUrl = customPhotos[archetype.id];
    const newSections = archetype.generateSections(customHeroUrl);
    onApplyFullArchetype(newSections, archetype.theme);
    showFeedback(`Thème complet « ${archetype.name} » appliqué à votre boutique !`);
  };

  const handleApplyColors = (archetype: MasterThemeArchetype) => {
    onApplyThemeOnly(archetype.theme);
    showFeedback(`Palette & typographie « ${archetype.name} » appliquées !`);
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input for Direct Photo Upload from Phone or PC */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />

      {appliedNotice && (
        <div className="sticky top-0 z-30 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-900 shadow-sm">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Header Intro Card */}
      <div className="rounded-xl border border-slate-200 bg-[#F8FBFC] p-3.5 text-[#011C40]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-[#011C40]">
            8 Architectures Modernes & Photos Personnalisables
          </p>
          <span className="text-[11px] font-semibold text-[#26658C] shrink-0">
            100% Éditable
          </span>
        </div>
        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
          Choisissez un design complet ou cliquez sur <strong>« Photo »</strong> sur n'importe quel thème pour importer vos propres images depuis votre téléphone ou ordinateur.
        </p>
      </div>

      <div className="space-y-4">
        {MASTER_THEME_ARCHETYPES.map((arch) => {
          const isSelected = selectedId === arch.id;
          const isPrimaryActive =
            currentTheme.primaryColor.toLowerCase() === arch.theme.primaryColor.toLowerCase() &&
            (currentTheme.secondaryColor || "").toLowerCase() ===
              (arch.theme.secondaryColor || "").toLowerCase();
          const activePreviewPhoto = customPhotos[arch.id] || arch.thumbnailUrl;
          const hasCustomPhoto = Boolean(customPhotos[arch.id]);
          const isPhotoEditorOpen = photoEditorThemeId === arch.id;
          const isUploadingThis = uploadingThemeId === arch.id;

          return (
            <div
              key={arch.id}
              onClick={() => setSelectedId(arch.id)}
              className={`overflow-hidden rounded-2xl border transition-all cursor-pointer bg-white ${
                isSelected
                  ? "border-[#023859] ring-2 ring-[#023859]/15 shadow-md"
                  : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
              }`}
            >
              {/* Visual Preview Header */}
              <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden group">
                <img
                  src={activePreviewPhoto}
                  alt={arch.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/25" />

                {/* Top Left: Editorial Index & Sector */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="rounded-lg bg-black/65 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/15">
                    {arch.badge}
                  </span>
                  {isPrimaryActive && (
                    <span className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-xs">
                      <Check className="h-3 w-3" /> Actif
                    </span>
                  )}
                </div>

                {/* Top Right: Direct Photo Import / Manage Button */}
                <div
                  className="absolute top-2.5 right-2.5 flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoEditorThemeId(isPhotoEditorOpen ? null : arch.id);
                      setUrlInputValue(customPhotos[arch.id] || "");
                    }}
                    className={`h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border backdrop-blur-md ${
                      isPhotoEditorOpen || hasCustomPhoto
                        ? "bg-white text-[#011C40] border-white shadow-sm"
                        : "bg-black/65 text-white border-white/25 hover:bg-black/80"
                    }`}
                    title="Importer ou changer la photo de ce thème"
                  >
                    <Camera className="h-3.5 w-3.5 text-[#54ACBF]" />
                    <span>{hasCustomPhoto ? "Photo Perso" : "Changer Photo"}</span>
                  </button>
                </div>

                {/* Mini Architectural Wireframe Preview Strip at Bottom Right */}
                <div
                  className="absolute bottom-2.5 right-2.5 hidden sm:flex items-center gap-1 rounded-lg p-1 border border-white/20 backdrop-blur-md"
                  style={{ backgroundColor: `${arch.theme.canvasColor}E6` }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-sm"
                    style={{ backgroundColor: arch.theme.primaryColor }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-sm"
                    style={{ backgroundColor: arch.theme.secondaryColor }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-sm"
                    style={{ backgroundColor: arch.theme.accentColor }}
                  />
                </div>

                {/* Bottom Left: Theme Title & Tagline */}
                <div className="absolute bottom-2.5 left-3 right-3 sm:right-28 text-white">
                  <h4
                    className="text-sm font-extrabold tracking-tight drop-shadow-xs"
                    style={{ fontFamily: arch.theme.fontFamily }}
                  >
                    {arch.name}
                  </h4>
                  <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5">
                    {arch.tagline}
                  </p>
                </div>
              </div>

              {/* Inline Custom Photo Manager Drawer (When "Changer Photo" is clicked) */}
              {isPhotoEditorOpen && (
                <div
                  className="bg-[#F8FBFC] border-b border-slate-200 p-3.5 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#011C40] flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-[#023859]" />
                      <span>Personnaliser la photo du thème « {arch.name} »</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPhotoEditorThemeId(null)}
                      className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Action 1: Upload directly from phone/PC */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingThis}
                      onClick={() => triggerDeviceUpload(arch.id)}
                      className="flex-1 min-w-[160px] h-9 px-3 rounded-xl bg-[#023859] hover:bg-[#011C40] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>
                        {isUploadingThis
                          ? "Importation en cours..."
                          : "Importer depuis mon appareil"}
                      </span>
                    </button>

                    {hasCustomPhoto && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomPhotoForTheme(arch.id, null);
                          setUrlInputValue("");
                          showFeedback("Visuel par défaut restauré.");
                        }}
                        className="h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Réinitialiser la photo par défaut"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Réinitialiser</span>
                      </button>
                    )}
                  </div>

                  {/* Action 2: Paste custom Image URL */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                      <Link2 className="h-3 w-3 text-[#26658C]" />
                      <span>Ou coller le lien (URL) d'une photo :</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        value={urlInputValue}
                        onChange={(e) => setUrlInputValue(e.target.value)}
                        placeholder="https://exemple.com/ma-banniere.jpg"
                        className="h-8 flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:border-[#023859] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = urlInputValue.trim();
                          if (!trimmed) return;
                          setCustomPhotoForTheme(arch.id, trimmed);
                          if (onUpdateActiveHeroPhoto) {
                            onUpdateActiveHeroPhoto(trimmed);
                          }
                          showFeedback("Lien photo enregistré et appliqué !");
                        }}
                        className="h-8 px-3 rounded-lg bg-[#26658C] hover:bg-[#023859] text-white text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Valider
                      </button>
                    </div>
                  </div>

                  {/* Action 3: Pick from Seller's Studio Media Gallery if available */}
                  {mediaGallery.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                      <span className="text-[11px] font-semibold text-slate-600 block">
                        Ou choisir depuis votre Médiathèque Studio ({mediaGallery.length}) :
                      </span>
                      <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto pr-1">
                        {mediaGallery.slice(0, 8).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setCustomPhotoForTheme(arch.id, item.url);
                              setUrlInputValue(item.url);
                              if (onUpdateActiveHeroPhoto) {
                                onUpdateActiveHeroPhoto(item.url);
                              }
                              showFeedback("Photo de la médiathèque appliquée !");
                            }}
                            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              customPhotos[arch.id] === item.url
                                ? "border-[#023859] ring-2 ring-[#54ACBF]/40"
                                : "border-slate-200 hover:border-slate-400"
                            }`}
                          >
                            <img
                              src={item.url}
                              alt={item.name || "Média"}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasCustomPhoto && onUpdateActiveHeroPhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateActiveHeroPhoto(customPhotos[arch.id]);
                        showFeedback("Photo appliquée directement sur votre bannière Hero actuelle !");
                      }}
                      className="w-full h-8 rounded-lg border border-[#54ACBF] bg-white hover:bg-[#F8FBFC] text-[#023859] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5 text-[#26658C]" />
                      <span>Utiliser cette photo sur ma bannière actuelle uniquement</span>
                    </button>
                  )}
                </div>
              )}

              {/* Card Body */}
              <div className="p-3.5 space-y-3">
                {/* Palette Swatches & Typography Preview */}
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 min-w-0 truncate">
                    <span className="font-semibold text-slate-700">Palette & Typo</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">
                      {arch.theme.fontFamily.split(",")[0].replace(/'/g, "")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {[
                      { color: arch.theme.primaryColor, label: "Primaire" },
                      { color: arch.theme.secondaryColor, label: "Secondaire" },
                      { color: arch.theme.accentColor, label: "Accent" },
                      { color: arch.theme.canvasColor, label: "Fond" },
                    ].map((swatch, idx) => (
                      <span
                        key={idx}
                        className="h-4 w-4 rounded-full border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: swatch.color }}
                        title={swatch.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
                <div className="text-[11px] text-slate-500 leading-relaxed flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  {arch.features.map((feat, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span aria-hidden="true" className="text-slate-300">·</span>}
                      <span>{feat}</span>
                    </React.Fragment>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyFull(arch);
                    }}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#023859] px-3 text-xs font-bold text-white shadow-2xs transition-all hover:bg-[#011C40] cursor-pointer whitespace-nowrap"
                  >
                    <Zap className="h-3.5 w-3.5 text-[#54ACBF]" />
                    <span>Appliquer Design Complet</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyColors(arch);
                    }}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 hover:text-[#011C40] cursor-pointer whitespace-nowrap"
                  >
                    <Palette className="h-3.5 w-3.5 text-[#26658C]" />
                    <span>Couleurs Seules</span>
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
