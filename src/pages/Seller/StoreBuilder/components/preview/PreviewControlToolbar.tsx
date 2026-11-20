import React from "react";
import {
  Smartphone, Tablet, RotateCw, ZoomIn, ZoomOut, Maximize2, QrCode,
  ShieldCheck, Play, Edit3, Grid, PanelLeftClose, PanelLeftOpen,
  PanelRightClose, PanelRightOpen, Monitor,
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
  pageSwitcherSlot?: React.ReactNode;
}

const ZOOM_PRESETS = [
  { label: "50 %", value: 0.5 },
  { label: "75 %", value: 0.75 },
  { label: "100 %", value: 1 },
  { label: "125 %", value: 1.25 },
];

export const PreviewControlToolbar: React.FC<PreviewControlToolbarProps> = ({
  device, setDevice, orientation, toggleOrientation, zoom, setZoom,
  isInteractiveMode, setIsInteractiveMode, showGrid, setShowGrid,
  isFullscreen, toggleFullscreen, onOpenQrModal, onOpenAuditModal,
  showLeftSidebar = true, onToggleLeftSidebar, showRightSidebar = true, onToggleRightSidebar,
  pageSwitcherSlot,
}) => {
  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.5));
  const handleFitToWindow = () => {
    const winW = typeof window !== "undefined" ? window.innerWidth : 1280;
    const fitScale = winW < 1100 ? 0.75 : winW < 1360 ? 0.88 : 1;
    setZoom(fitScale);
  };

  return (
    <div
      data-testid="studio-canvas-chrome-bar"
      className="w-full h-10 min-h-[40px] bg-white border-b border-[#E3E5E8] px-2.5 flex items-center justify-between gap-2 z-20 select-none overflow-x-auto no-scrollbar"
    >
      {/* Left: Panel Toggles & Orientation/Device in Fullscreen */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onToggleLeftSidebar && (
          <button
            type="button"
            onClick={onToggleLeftSidebar}
            className={`hidden md:inline-flex h-7 px-2 rounded-md text-[11.5px] font-medium items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
              !showLeftSidebar ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            title={showLeftSidebar ? "Masquer le panneau gauche" : "Afficher les sections"}
          >
            {showLeftSidebar ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline">Structure</span>
          </button>
        )}

        {isFullscreen && (
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md">
            {(
              [
                { id: "desktop" as const, icon: Monitor, title: "Desktop" },
                { id: "tablet" as const, icon: Tablet, title: "Tablette" },
                { id: "mobile" as const, icon: Smartphone, title: "Mobile" },
              ]
            ).map((vp) => {
              const Icon = vp.icon;
              return (
                <button
                  key={vp.id}
                  type="button"
                  onClick={() => setDevice(vp.id)}
                  title={vp.title}
                  className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer ${
                    device === vp.id ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        )}

        {device !== "desktop" && (
          <button
            type="button"
            onClick={toggleOrientation}
            className="h-7 px-2 rounded-md text-[11.5px] font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer whitespace-nowrap"
            title="Pivoter Portrait / Paysage"
          >
            <RotateCw className="w-3 h-3" />
            <span>{orientation === "landscape" ? "Paysage" : "Portrait"}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsInteractiveMode(!isInteractiveMode)}
          className={`md:hidden h-7 px-2 rounded-md text-[11.5px] font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap ${
            isInteractiveMode ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {isInteractiveMode ? <Edit3 className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{isInteractiveMode ? "Éditer" : "Tester"}</span>
        </button>
      </div>

      {/* Center: Shopify-style Page Switcher outside the storefront frame */}
      {pageSwitcherSlot && (
        <div className="flex items-center justify-center min-w-0">
          {pageSwitcherSlot}
        </div>
      )}

      {/* Right: Canvas Zoom, Grid, QR, Fullscreen & Right Panel Toggle */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="hidden md:flex items-center bg-slate-100/90 px-1 py-0.5 rounded-md">
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-5 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
            title="Zoom arrière"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <select
            aria-label="Niveau de zoom du canvas"
            data-testid="canvas-zoom-select"
            value={ZOOM_PRESETS.some((p) => p.value === zoom) ? String(zoom) : "custom"}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "fit") handleFitToWindow();
              else if (v !== "custom") setZoom(Number(v));
            }}
            className="px-1 text-[11px] font-mono font-medium text-slate-800 bg-transparent outline-none cursor-pointer tabular-nums"
          >
            {ZOOM_PRESETS.map((preset) => (
              <option key={preset.value} value={String(preset.value)}>{preset.label}</option>
            ))}
            <option value="fit">Ajuster à la fenêtre</option>
            {!ZOOM_PRESETS.some((p) => p.value === zoom) && (
              <option value="custom">{Math.round(zoom * 100)} %</option>
            )}
          </select>
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-5 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
            title="Zoom avant"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowGrid(!showGrid)}
          className={`h-7 w-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
            showGrid ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Afficher la grille d'alignement"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onOpenQrModal}
          className="h-7 w-7 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          title="Tester sur téléphone via QR Code"
        >
          <QrCode className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onOpenAuditModal}
          className="md:hidden h-7 px-2 rounded-md text-slate-700 hover:bg-slate-100 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
          title="Audit Qualité"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className={`h-7 w-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
            isFullscreen ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title={isFullscreen ? "Quitter Plein Écran" : "Aperçu Plein Écran"}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {onToggleRightSidebar && (
          <>
            <span className="h-4 w-px bg-slate-200 hidden md:block mx-0.5" aria-hidden="true" />
            <button
              type="button"
              onClick={onToggleRightSidebar}
              className={`hidden md:inline-flex h-7 px-2 rounded-md text-[11.5px] font-medium items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                !showRightSidebar ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              title={showRightSidebar ? "Masquer l'inspecteur" : "Afficher l'inspecteur"}
            >
              <span className="hidden xl:inline">Inspecteur</span>
              {showRightSidebar ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
