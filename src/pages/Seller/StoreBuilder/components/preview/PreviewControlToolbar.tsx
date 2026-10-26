import React from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  QrCode,
  Sparkles,
  Play,
  Edit3,
  Grid,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

export type PreviewDevice = "mobile" | "tablet" | "desktop";
export type PreviewOrientation = "portrait" | "landscape";

interface PreviewControlToolbarProps {
  device: PreviewDevice;
  setDevice: (device: PreviewDevice) => void;
  orientation: PreviewOrientation;
  toggleOrientation: () => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  isInteractiveMode: boolean;
  setIsInteractiveMode: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  onOpenQrModal: () => void;
  onOpenAuditModal: () => void;
  showLeftSidebar?: boolean;
  onToggleLeftSidebar?: () => void;
  showRightSidebar?: boolean;
  onToggleRightSidebar?: () => void;
}

export const PreviewControlToolbar: React.FC<PreviewControlToolbarProps> = ({
  device,
  setDevice,
  orientation,
  toggleOrientation,
  zoom,
  setZoom,
  isInteractiveMode,
  setIsInteractiveMode,
  showGrid,
  setShowGrid,
  isFullscreen,
  toggleFullscreen,
  onOpenQrModal,
  onOpenAuditModal,
  showLeftSidebar = true,
  onToggleLeftSidebar,
  showRightSidebar = true,
  onToggleRightSidebar,
}) => {
  const handleZoomIn = () =>
    setZoom((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 1.4));
  const handleZoomOut = () =>
    setZoom((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.6));
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="w-full h-11 min-h-[44px] bg-white border-b border-slate-200 px-3 flex items-center justify-between gap-2 z-20 select-none overflow-x-auto no-scrollbar">
      {/* Left: Desktop Sidebar Toggle + Interactive Viewport Selector */}
      <div className="flex items-center gap-2 shrink-0">
        {onToggleLeftSidebar && (
          <button
            type="button"
            onClick={onToggleLeftSidebar}
            className={`hidden md:inline-flex h-8 px-2.5 rounded-lg border text-xs font-semibold items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              !showLeftSidebar
                ? "bg-[#F8FBFC] border-[#54ACBF] text-[#023859]"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            title={showLeftSidebar ? "Masquer le panneau gauche" : "Afficher les sections"}
          >
            {showLeftSidebar ? (
              <PanelLeftClose className="w-3.5 h-3.5 text-[#023859]" />
            ) : (
              <PanelLeftOpen className="w-3.5 h-3.5 text-[#023859]" />
            )}
            <span className="hidden xl:inline">Sections</span>
          </button>
        )}

        {/* Segmented Viewport Switcher */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`h-7 px-2 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
              device === "mobile"
                ? "bg-white text-[#011C40] shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Aperçu Mobile (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>

          <button
            type="button"
            onClick={() => setDevice("tablet")}
            className={`h-7 px-2 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
              device === "tablet"
                ? "bg-white text-[#011C40] shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Aperçu Tablette (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablette</span>
          </button>

          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`h-7 px-2 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
              device === "desktop"
                ? "bg-white text-[#011C40] shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Aperçu Ordinateur"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PC</span>
          </button>

          {device !== "desktop" && (
            <button
              type="button"
              onClick={toggleOrientation}
              className="h-7 px-2 rounded-md text-xs font-semibold text-[#023859] hover:bg-white/60 flex items-center gap-1 cursor-pointer"
              title="Pivoter Portrait / Paysage"
            >
              <RotateCw className="w-3 h-3" />
              <span className="hidden lg:inline">
                {orientation === "landscape" ? "Paysage" : "Portrait"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Center: Mode Édition vs Test Client */}
      <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shrink-0">
        <button
          type="button"
          onClick={() => setIsInteractiveMode(false)}
          className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            !isInteractiveMode
              ? "bg-[#023859] text-white shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Edit3 className="w-3 h-3" />
          <span>Édition</span>
        </button>
        <button
          type="button"
          onClick={() => setIsInteractiveMode(true)}
          className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            isInteractiveMode
              ? "bg-emerald-600 text-white shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Test Client</span>
        </button>
      </div>

      {/* Right: Clean Helpers & Inspector Toggle */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded cursor-pointer"
            title="Zoom arrière"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="px-1.5 text-[11px] font-mono font-bold text-slate-800 hover:text-[#023859] cursor-pointer tabular-nums"
            title="Réinitialiser zoom (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded cursor-pointer"
            title="Zoom avant"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowGrid(!showGrid)}
          className={`h-7 px-2 rounded-lg flex items-center gap-1 border text-xs font-semibold transition-colors cursor-pointer ${
            showGrid
              ? "bg-[#F8FBFC] border-[#54ACBF] text-[#023859]"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
          title="Afficher la grille d'alignement"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onOpenQrModal}
          className="h-7 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          title="Tester sur téléphone via QR Code"
        >
          <QrCode className="w-3.5 h-3.5 text-[#023859]" />
        </button>

        <button
          type="button"
          onClick={onOpenAuditModal}
          className="h-7 px-2.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          title="Audit Qualité de la vitrine"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Audit</span>
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className={`h-7 px-2 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
            isFullscreen
              ? "bg-[#F8FBFC] border-[#54ACBF] text-[#023859]"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
          title={isFullscreen ? "Quitter Plein Écran" : "Aperçu Plein Écran"}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {onToggleRightSidebar && (
          <button
            type="button"
            onClick={onToggleRightSidebar}
            className={`hidden md:inline-flex h-8 px-2.5 rounded-lg border text-xs font-semibold items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              !showRightSidebar
                ? "bg-[#F8FBFC] border-[#54ACBF] text-[#023859]"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            title={showRightSidebar ? "Masquer l'inspecteur" : "Afficher l'inspecteur"}
          >
            <span className="hidden xl:inline">Inspecteur</span>
            {showRightSidebar ? (
              <PanelRightClose className="w-3.5 h-3.5 text-[#023859]" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5 text-[#023859]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
