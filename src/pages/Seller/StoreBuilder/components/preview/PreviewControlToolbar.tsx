import React from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  QrCode,
  Sparkles,
  Play,
  Edit3,
  Moon,
  Sun,
  Grid,
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
  isDarkMode,
  setIsDarkMode,
  showGrid,
  setShowGrid,
  isFullscreen,
  toggleFullscreen,
  onOpenQrModal,
  onOpenAuditModal,
}) => {
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1);

  const deviceBtns = [
    { id: "desktop" as const, label: "Bureau", icon: Monitor },
    { id: "tablet" as const, label: "Tablette", icon: Tablet },
    { id: "mobile" as const, label: "Mobile", icon: Smartphone },
  ];

  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#E5E7EB] px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xs z-20 select-none">
      {/* Device Viewport Switcher & Orientation */}
      <div className="flex items-center gap-1 bg-[#F5F6F8] p-1 rounded-xl border border-[#E5E7EB]">
        {deviceBtns.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setDevice(id)}
            className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              device === id ? "bg-[#FFFFFF] text-[#17191C] shadow-2xs" : "text-[#667085] hover:text-[#17191C]"
            }`}
            title={`Vue ${label}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}

        {device !== "desktop" && (
          <button
            type="button"
            onClick={toggleOrientation}
            className={`h-8 px-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              orientation === "landscape" ? "bg-[#FFF1E7] text-[#F97316]" : "text-[#667085] hover:text-[#17191C]"
            }`}
            title="Pivoter Portrait / Paysage"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{orientation === "landscape" ? "Paysage" : "Portrait"}</span>
          </button>
        )}
      </div>

      {/* Mode Interactif (Visiteur réel) vs Mode Édition */}
      <div className="flex items-center gap-1 bg-[#F5F6F8] p-1 rounded-xl border border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setIsInteractiveMode(false)}
          className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            !isInteractiveMode ? "bg-[#FFFFFF] text-[#F97316] shadow-2xs font-bold" : "text-[#667085] hover:text-[#17191C]"
          }`}
          title="Mode Édition : sélectionner et modifier"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Édition</span>
        </button>
        <button
          type="button"
          onClick={() => setIsInteractiveMode(true)}
          className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isInteractiveMode ? "bg-[#16A34A] text-[#FFFFFF] shadow-2xs font-bold" : "text-[#667085] hover:text-[#17191C]"
          }`}
          title="Tester la boutique comme un vrai client"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Test Visiteur</span>
        </button>
      </div>

      {/* Zoom & Visual Canvas Helpers */}
      <div className="flex items-center gap-1.5">
        <div className="hidden sm:flex items-center bg-[#F5F6F8] p-0.5 rounded-lg border border-[#E5E7EB]">
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center text-[#667085] hover:text-[#17191C] rounded cursor-pointer"
            title="Zoom arrière"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="px-1.5 text-[11px] font-mono font-bold text-[#17191C] hover:text-[#F97316] cursor-pointer"
            title="Réinitialiser zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center text-[#667085] hover:text-[#17191C] rounded cursor-pointer"
            title="Zoom avant"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toggle Dark Simulator */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
            isDarkMode ? "bg-[#1E293B] border-[#0F172A] text-[#F8FAFC]" : "bg-[#FFFFFF] border-[#E5E7EB] text-[#667085]"
          }`}
          title="Simuler Mode Sombre / Mode Clair"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Toggle Grid Aligners */}
        <button
          type="button"
          onClick={() => setShowGrid(!showGrid)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
            showGrid ? "bg-[#FFF1E7] border-[#FDBA74] text-[#F97316]" : "bg-[#FFFFFF] border-[#E5E7EB] text-[#667085]"
          }`}
          title="Grille et repères d'alignement"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* QR Code Phone Preview */}
        <button
          type="button"
          onClick={onOpenQrModal}
          className="h-8 px-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#FFF7ED] hover:border-[#FDBA74] hover:text-[#F97316] text-[#475467] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          title="Tester en direct sur votre smartphone via QR Code"
        >
          <QrCode className="w-3.5 h-3.5 text-[#F97316]" />
          <span className="hidden lg:inline">Aperçu Mobile</span>
        </button>

        {/* Pre-flight Audit & Score */}
        <button
          type="button"
          onClick={onOpenAuditModal}
          className="h-8 px-2.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] hover:bg-[#DCFCE7] text-[#16A34A] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          title="Auditer la qualité, le contraste et la vitesse"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Audit Qualité</span>
        </button>

        {/* Fullscreen Immersion */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
            isFullscreen ? "bg-[#FFF1E7] border-[#FDBA74] text-[#F97316]" : "bg-[#FFFFFF] border-[#E5E7EB] text-[#475467]"
          }`}
          title={isFullscreen ? "Quitter Plein Écran" : "Mode Immersion Plein Écran"}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
