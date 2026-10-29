import React from "react";
import { Columns, ChevronRight, Palette, Maximize2 } from "lucide-react";
import {
  CATEGORY_LAYOUT_OPTIONS,
  CATEGORY_RADIUS_OPTIONS,
} from "../../../constants/categoryCanvaOptions";
import { VisualLayoutPicker } from "../controls/VisualLayoutPicker";
import { CategoryOverlayAndFinishControls } from "./CategoryOverlayAndFinishControls";

interface CategoryCanvaStyleControlsProps {
  settings: Record<string, unknown>;
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
}

const SHOPIFY_CARD_SKINS = [
  { id: "editorial", label: "Standard Épuré", desc: "Sans cadre (Norme)" },
  { id: "framed", label: "Carte Encadrée", desc: "Bordure fine & fond blanc" },
  { id: "soft-tint", label: "Pastel Doux", desc: "Fond poudré léger" },
  { id: "dark-glass", label: "Mode Sombre", desc: "Fond anthracite" },
];

const CARD_SIZES = [
  { id: "compact", label: "Compacte", desc: "Fines & 2 col. mobile" },
  { id: "balanced", label: "Équilibrée", desc: "Proportion standard" },
  { id: "large", label: "Grande", desc: "Impact lookbook" },
];

export const CategoryCanvaStyleControls: React.FC<CategoryCanvaStyleControlsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const currentLayout = String(settings.layout || "grid");
  const currentAspect = String(settings.aspectRatio || "4/5");
  const currentRadius = String(settings.borderRadius || "md");
  const currentHover = String(settings.hoverEffect || "zoom");
  const currentTextPos = String(settings.textPosition || "below");
  const overlayOpacity = Number(settings.overlayOpacity ?? 40);
  const columnsDesktop = Number(settings.columnsDesktop ?? 4);
  const columnsMobile = Number(settings.columnsMobile ?? 2);
  const bubbleRing = String(settings.bubbleRing || "gradient");
  const pillShowImage = settings.pillShowImage !== false;
  const cardSkin = String(settings.cardSkin || "editorial");
  const cardSize = String(settings.cardSize || "balanced");

  const handleSelectLayout = (newLayout: string) => {
    const patch: Record<string, unknown> = { layout: newLayout };
    if (newLayout === "bubbles") {
      patch.aspectRatio = "circle";
      patch.borderRadius = "full";
      if (currentTextPos !== "none") patch.textPosition = "below";
      patch.glassmorphism = false;
    } else if (newLayout === "pills") {
      patch.borderRadius = "full";
      patch.textPosition = "card-inside";
      patch.glassmorphism = false;
    } else if (
      newLayout === "overlay" ||
      newLayout === "bento" ||
      newLayout === "accordion" ||
      newLayout === "glass-dock"
    ) {
      if (currentAspect === "circle") patch.aspectRatio = "4/5";
      if (currentRadius === "full" || currentRadius === "lg") patch.borderRadius = "md";
      if (currentTextPos === "below") patch.textPosition = "overlay-bottom";
      if (newLayout === "glass-dock") patch.glassmorphism = true;
    } else {
      if (currentAspect === "circle") patch.aspectRatio = "4/5";
      if (currentRadius === "full" || currentRadius === "lg") patch.borderRadius = "md";
      if (currentTextPos !== "none") patch.textPosition = "below";
    }
    onSettingsChange(patch);
  };

  const selectedLayoutMeta =
    CATEGORY_LAYOUT_OPTIONS.find((o) => o.id === currentLayout) || CATEGORY_LAYOUT_OPTIONS[0];

  const isOverlayActive =
    currentLayout === "overlay" ||
    currentLayout === "bento" ||
    currentLayout === "accordion" ||
    currentLayout === "glass-dock" ||
    ((currentLayout === "grid" || currentLayout === "carousel") &&
      (currentTextPos === "overlay-bottom" || currentTextPos === "overlay-center"));

  const harmoniousCardRadii = CATEGORY_RADIUS_OPTIONS.filter((o) => o.id !== "full");
  const showColumnsGrid =
    currentLayout !== "carousel" &&
    currentLayout !== "mesh-3d" &&
    currentLayout !== "accordion" &&
    currentLayout !== "magazine";

  return (
    <div className="space-y-3.5 select-none">
      {/* ÉTAPE 1 : MODÈLE DE CARTE, DIMENSION & FINITION */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#023859] text-white text-[10px] font-black flex items-center justify-center">
              1
            </span>
            Modèle & Dimension ({CATEGORY_LAYOUT_OPTIONS.length})
          </span>
          <span className="text-[10px] font-bold text-[#023859] bg-[#F0F7FA] px-2.5 py-0.5 rounded-full border border-[#B8D8E8]">
            {selectedLayoutMeta.label}
          </span>
        </div>

        <VisualLayoutPicker
          mode="category"
          activeLayout={currentLayout}
          aspectRatio={currentAspect}
          columnsDesktop={columnsDesktop}
          onSelectLayout={handleSelectLayout}
          onChangeAspectRatio={(r) => onSettingsChange("aspectRatio", r)}
          onChangeColumnsDesktop={(cols) => onSettingsChange("columnsDesktop", cols)}
        />

        <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Maximize2 className="w-3 h-3 text-[#26658C]" />
            <span>Dimension & Taille des Cartes</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {CARD_SIZES.map((sz) => (
              <button
                key={sz.id}
                type="button"
                onClick={() => onSettingsChange("cardSize", sz.id)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  cardSize === sz.id
                    ? "border-[#023859] bg-[#023859] text-white shadow-2xs"
                    : "border-slate-200 bg-slate-50/70 hover:bg-white text-slate-700"
                }`}
              >
                <span className="block text-[10px] font-extrabold leading-tight">{sz.label}</span>
                <span className={`block text-[9px] mt-0.5 ${cardSize === sz.id ? "text-white/80" : "text-slate-500"}`}>
                  {sz.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3 h-3 text-[#26658C]" />
            <span>Style de Bordure & Fond</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {SHOPIFY_CARD_SKINS.map((skin) => (
              <button
                key={skin.id}
                type="button"
                onClick={() => onSettingsChange("cardSkin", skin.id)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  cardSkin === skin.id
                    ? "border-[#023859] bg-[#F0F7FA] text-[#011C40] ring-1 ring-[#023859]/20"
                    : "border-slate-200 bg-slate-50/70 hover:bg-white text-slate-700"
                }`}
              >
                <span className="block text-[10px] font-extrabold leading-tight">{skin.label}</span>
                <span className="block text-[9px] text-slate-500 mt-0.5">{skin.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ÉTAPE 2 : GRILLE & COINS */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#011C40] text-white text-[10px] font-black flex items-center justify-center">
              2
            </span>
            Grille & Arrondi ({selectedLayoutMeta.label})
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#26658C]" />
        </div>

        {currentLayout === "bubbles" ? (
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "gradient", label: "Bague Luxe" },
              { id: "solid", label: "Anneau Fin" },
              { id: "none", label: "Épuré" },
            ].map((ring) => (
              <button
                key={ring.id}
                type="button"
                onClick={() => onSettingsChange("bubbleRing", ring.id)}
                className={`py-2 px-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                  bubbleRing === ring.id
                    ? "border-[#023859] bg-[#F0F7FA] text-[#011C40]"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {ring.label}
              </button>
            ))}
          </div>
        ) : currentLayout === "pills" ? (
          <label className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer">
            <span>Miniature photo dans la capsule</span>
            <input
              type="checkbox"
              checked={pillShowImage}
              onChange={(e) => onSettingsChange("pillShowImage", e.target.checked)}
              className="w-4 h-4 accent-[#023859] cursor-pointer"
            />
          </label>
        ) : (
          <div className="space-y-2">
            {showColumnsGrid && (
              <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                  <Columns className="w-3 h-3 text-[#26658C]" />
                  Affichage Mobile
                </span>
                <div className="grid grid-cols-2 gap-1 w-32">
                  {[1, 2].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => onSettingsChange("columnsMobile", col)}
                      className={`py-1 rounded-md border text-[10px] font-bold cursor-pointer ${
                        columnsMobile === col
                          ? "border-[#023859] bg-[#023859] text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {col} Col.
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-1">
              {harmoniousCardRadii.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSettingsChange("borderRadius", opt.id)}
                  className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                    currentRadius === opt.id
                      ? "border-[#023859] bg-[#F0F7FA] text-[#011C40]"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {opt.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <CategoryOverlayAndFinishControls
        settings={settings}
        currentLayout={currentLayout}
        currentTextPos={currentTextPos}
        currentHover={currentHover}
        overlayOpacity={overlayOpacity}
        isOverlayActive={isOverlayActive}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
};
