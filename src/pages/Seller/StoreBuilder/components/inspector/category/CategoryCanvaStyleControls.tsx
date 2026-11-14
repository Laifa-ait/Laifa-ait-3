import React from "react";
import { Palette, Maximize2, Focus, Lock } from "lucide-react";
import {
  CATEGORY_LAYOUT_OPTIONS,
  CATEGORY_RADIUS_OPTIONS,
  getCategoryLayoutCapabilities,
} from "../../../constants/categoryCanvaOptions";
import { CategoryDeviceViewport } from "../../../constants/categoryPresetTypes";
import { resolveCategoryDeviceProfile } from "../../../../../../components/Store/sections/category/categoryResponsiveHelper";
import { useStudioStore } from "../../../store/useStudioStore";
import { VisualLayoutPicker } from "../controls/VisualLayoutPicker";
import { CategoryOverlayAndFinishControls } from "./CategoryOverlayAndFinishControls";
import { CategoryDeviceSelectorBar } from "./CategoryDeviceSelectorBar";

interface CategoryCanvaStyleControlsProps {
  step?: 2 | 3 | 4;
  settings: Record<string, unknown>;
  onSettingsChange: (fieldOrPatch: string | Record<string, unknown>, value?: unknown) => void;
}

const SHOPIFY_CARD_SKINS = [
  { id: "editorial", label: "Standard Épuré", desc: "Sans cadre" },
  { id: "framed", label: "Carte Encadrée", desc: "Bordure fine" },
  { id: "soft-tint", label: "Pastel Doux", desc: "Fond poudré" },
  { id: "dark-glass", label: "Mode Sombre", desc: "Fond anthracite" },
];
const CARD_SIZES = [
  { id: "compact", label: "Compacte", desc: "Denses" },
  { id: "balanced", label: "Équilibrée", desc: "Standard" },
  { id: "large", label: "Grande", desc: "Impact" },
];
const PHOTO_POSITIONS = [{ id: "top", label: "Haut" }, { id: "center", label: "Centre" }, { id: "bottom", label: "Bas" }];
const LOCKED_SIGNATURE_SKINS: Record<string, { title: string; desc: string }> = {
  polaroid: { title: "Tirage Polaroïd Studio", desc: "Cadre blanc asymétrique et ombre portée intégrée." },
  grid: { title: "Passe-partout Grille Prestige", desc: "Bordure fine et cadre intérieur éditorial." },
  overlay: { title: "Poster Affiche Cinéma", desc: "Plein cadre sans bordure et vignettage." },
  arch: { title: "Dôme Arche Palace", desc: "Découpe plein cintre et filet architectural." },
  "glass-dock": { title: "Capsule Glass Dock 3D", desc: "Dock flottant en verre dépoli." },
};

export const CategoryCanvaStyleControls: React.FC<CategoryCanvaStyleControlsProps> = ({
  step = 2,
  settings,
  onSettingsChange,
}) => {
  const viewport = useStudioStore((s) => s.viewport);
  const setViewport = useStudioStore((s) => s.setViewport);

  const activeDevice: CategoryDeviceViewport = viewport || "desktop";
  const deviceProfile = resolveCategoryDeviceProfile(settings, activeDevice);
  const tabletProfile = resolveCategoryDeviceProfile(settings, "tablet");
  const mobileProfile = resolveCategoryDeviceProfile(settings, "mobile");

  const currentLayout = deviceProfile.layout;
  const currentAspect = deviceProfile.aspectRatio;
  const currentCardSize = deviceProfile.cardSize;
  const currentDeviceCols = deviceProfile.columns;

  const currentRadius = String(settings.borderRadius || "md");
  const currentHover = String(settings.hoverEffect || "zoom");
  const currentTextPos = String(settings.textPosition || "below");
  const overlayOpacity = Number(settings.overlayOpacity ?? 40);
  const bubbleRing = String(settings.bubbleRing || "gradient");
  const pillShowImage = settings.pillShowImage !== false;
  const cardSkin = String(settings.cardSkin || "editorial");
  const imagePosition = String(settings.imagePosition || "center");
  const imageFit = String(settings.imageFit || "cover");
  const showTitle = settings.showTitle !== false && currentTextPos !== "none";

  const caps = getCategoryLayoutCapabilities(currentLayout, currentTextPos, showTitle);
  const lockedSkinMeta = LOCKED_SIGNATURE_SKINS[currentLayout];

  const handleSelectLayout = (newLayout: string) => {
    if (activeDevice === "tablet") return onSettingsChange({ layoutTablet: newLayout });
    if (activeDevice === "mobile") return onSettingsChange({ layoutMobile: newLayout });

    const patch: Record<string, unknown> = { layout: newLayout };
    if (newLayout === "bubbles") { patch.aspectRatio = "circle"; patch.borderRadius = "full"; }
    else if (newLayout === "pills") { patch.borderRadius = "full"; }
    else if (newLayout === "polaroid" || newLayout === "grid") { patch.cardSkin = "framed"; }
    else if (newLayout === "overlay") { patch.cardSkin = "editorial"; }
    else if (newLayout === "mesh-3d" && Number(settings.columnsDesktop ?? 2) > 2) { patch.columnsDesktop = 2; }
    onSettingsChange(patch);
  };

  const handleSelectAspectRatio = (r: string) =>
    onSettingsChange(activeDevice === "tablet" ? "aspectRatioTablet" : activeDevice === "mobile" ? "aspectRatioMobile" : "aspectRatio", r);
  const handleSelectColumns = (c: number) =>
    onSettingsChange(activeDevice === "tablet" ? "columnsTablet" : activeDevice === "mobile" ? "columnsMobile" : "columnsDesktop", c);
  const handleSelectCardSize = (sz: string) =>
    onSettingsChange(activeDevice === "tablet" ? "cardSizeTablet" : activeDevice === "mobile" ? "cardSizeMobile" : "cardSize", sz);
  const handleResetDeviceToPc = () =>
    onSettingsChange(
      activeDevice === "tablet"
        ? { layoutTablet: "inherit", cardSizeTablet: "inherit", aspectRatioTablet: "inherit" }
        : { layoutMobile: "inherit", cardSizeMobile: "inherit", aspectRatioMobile: "inherit" }
    );

  const selectedLayoutMeta = CATEGORY_LAYOUT_OPTIONS.find((o) => o.id === currentLayout) || CATEGORY_LAYOUT_OPTIONS[0];
  const harmoniousCardRadii = CATEGORY_RADIUS_OPTIONS.filter((o) => o.id !== "full");

  if (step === 2) {
    return (
      <div className="space-y-3 select-none" data-testid="category-step-panel-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-900">
              Modèle actif : {selectedLayoutMeta.label}
            </span>
          </div>

          <CategoryDeviceSelectorBar
            activeDevice={activeDevice}
            desktopLayout={String(settings.layout || "grid")}
            tabletProfile={tabletProfile}
            mobileProfile={mobileProfile}
            activeProfile={deviceProfile}
            onSelectDevice={setViewport}
            onResetToPc={handleResetDeviceToPc}
          />

          <VisualLayoutPicker
            mode="category"
            activeLayout={currentLayout}
            activeDevice={activeDevice}
            aspectRatio={currentAspect}
            columnsDesktop={currentDeviceCols}
            onSelectLayout={handleSelectLayout}
            onChangeAspectRatio={handleSelectAspectRatio}
            onChangeColumnsDesktop={handleSelectColumns}
          />

          <div className="pt-2.5 border-t border-slate-200 space-y-1.5">
            <label className="text-[10.5px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Maximize2 className="w-3 h-3 text-slate-500" />
              <span>Taille des cartes ({activeDevice === "desktop" ? "PC" : activeDevice === "tablet" ? "Tablette" : "Mobile"})</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CARD_SIZES.map((sz) => (
                <button key={sz.id} type="button" onClick={() => handleSelectCardSize(sz.id)} className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${currentCardSize === sz.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"}`}>
                  <span className="block text-[10.5px] font-semibold">{sz.label}</span>
                  <span className={`block text-[9.5px] mt-0.5 ${currentCardSize === sz.id ? "text-white/75" : "text-slate-400"}`}>{sz.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-200 space-y-1.5">
            <label className="text-[10.5px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3 h-3 text-slate-500" /><span>Style de bordure</span>
            </label>
            {lockedSkinMeta ? (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[10.5px] font-semibold text-slate-900">{lockedSkinMeta.title}</span>
                  <span className="block text-[10px] text-slate-500 leading-snug mt-0.5">{lockedSkinMeta.desc}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {SHOPIFY_CARD_SKINS.map((skin) => (
                  <button key={skin.id} type="button" onClick={() => onSettingsChange("cardSkin", skin.id)} className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${cardSkin === skin.id ? "border-slate-900 bg-slate-50 text-slate-900" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"}`}>
                    <span className="block text-[10.5px] font-semibold">{skin.label}</span>
                    <span className="block text-[9.5px] text-slate-400">{skin.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-3 select-none" data-testid="category-step-panel-3">
        <div className="space-y-2.5">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5"><Focus className="w-3.5 h-3.5 text-slate-500" />Cadrage photo</span>
              <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-100">
                {[{ id: "cover", label: "Remplir" }, { id: "contain", label: "Entier" }].map((fit) => (
                  <button key={fit.id} type="button" onClick={() => onSettingsChange("imageFit", fit.id)} className={`px-2 py-0.5 rounded text-[9.5px] font-medium cursor-pointer ${imageFit === fit.id ? "bg-slate-900 text-white" : "text-slate-600"}`}>{fit.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {PHOTO_POSITIONS.map((pos) => (
                <button key={pos.id} type="button" onClick={() => onSettingsChange("imagePosition", pos.id)} className={`py-1 rounded-md border text-[10.5px] font-medium cursor-pointer ${imagePosition === pos.id ? "border-slate-900 bg-slate-50 text-slate-900 font-semibold" : "border-slate-200 bg-white text-slate-600"}`}>Focus {pos.label}</button>
              ))}
            </div>
          </div>

          {currentLayout === "bubbles" && (
            <div className="grid grid-cols-3 gap-1.5">
              {[{ id: "gradient", label: "Bague Luxe" }, { id: "solid", label: "Anneau Fin" }, { id: "none", label: "Or Doré" }].map((ring) => (
                <button key={ring.id} type="button" onClick={() => onSettingsChange("bubbleRing", ring.id)} className={`py-2 px-1.5 rounded-lg border text-[10.5px] font-medium cursor-pointer ${bubbleRing === ring.id ? "border-slate-900 bg-slate-50 text-slate-900 font-semibold" : "border-slate-200 bg-white text-slate-700"}`}>{ring.label}</button>
              ))}
            </div>
          )}

          {currentLayout === "pills" && (
            <label className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer">
              <span>Miniature photo dans la pilule</span>
              <input type="checkbox" checked={pillShowImage} onChange={(e) => onSettingsChange("pillShowImage", e.target.checked)} className="w-4 h-4 accent-slate-900 cursor-pointer" />
            </label>
          )}

          {caps.supportsBorderRadius && (
            <div className="grid grid-cols-4 gap-1">
              {harmoniousCardRadii.map((opt) => (
                <button key={opt.id} type="button" onClick={() => onSettingsChange("borderRadius", opt.id)} className={`py-1.5 rounded-lg border text-[10.5px] font-medium cursor-pointer ${currentRadius === opt.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{opt.label.split(" ")[0]}</button>
              ))}
            </div>
          )}
        </div>

        <CategoryOverlayAndFinishControls
          mode="title-only"
          settings={settings}
          currentLayout={currentLayout}
          currentTextPos={currentTextPos}
          currentHover={currentHover}
          overlayOpacity={overlayOpacity}
          isOverlayActive={caps.supportsOverlayContrast}
          onSettingsChange={onSettingsChange}
        />
      </div>
    );
  }

  return (
    <CategoryOverlayAndFinishControls
      mode="finish-only"
      settings={settings}
      currentLayout={currentLayout}
      currentTextPos={currentTextPos}
      currentHover={currentHover}
      overlayOpacity={overlayOpacity}
      isOverlayActive={caps.supportsOverlayContrast}
      onSettingsChange={onSettingsChange}
    />
  );
};
