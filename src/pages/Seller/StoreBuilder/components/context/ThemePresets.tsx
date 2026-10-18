import React from "react";
import { Palette, Check, Eye } from "lucide-react";

export const PRESET_THEMES = [
  {
    id: "olmart-orange",
    name: "Olmart Orange",
    description: "Thème signature vibrant et chaleureux",
    primary: "#F97316",
    secondary: "#1A1A2E",
    accent: "#14B8A6",
    canvas: "#F7F8FA",
    surface: "#FFFFFF",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Design sobre, épuré et contemporain",
    primary: "#111827",
    secondary: "#6B7280",
    accent: "#9CA3AF",
    canvas: "#FAFAFA",
    surface: "#FFFFFF",
  },
  {
    id: "elegant",
    name: "Élégant",
    description: "Tons de terre prestigieux et nobles",
    primary: "#8B5E3C",
    secondary: "#2B2118",
    accent: "#D6AD60",
    canvas: "#FAF8F5",
    surface: "#FFFFFF",
  },
  {
    id: "moderne",
    name: "Moderne",
    description: "Palette bleu océan dynamique et professionnelle",
    primary: "#2563EB",
    secondary: "#0F172A",
    accent: "#06B6D4",
    canvas: "#F8FAFC",
    surface: "#FFFFFF",
  },
  {
    id: "naturel",
    name: "Naturel",
    description: "Verdure organique et accents dorés",
    primary: "#3F6B50",
    secondary: "#25382D",
    accent: "#D3A75F",
    canvas: "#F6FBF7",
    surface: "#FFFFFF",
  },
  {
    id: "nuit",
    name: "Nuit",
    description: "Inspiration cosmique et contrastes néons",
    primary: "#60A5FA",
    secondary: "#0F172A",
    accent: "#A78BFA",
    canvas: "#0F172A",
    surface: "#1E293B",
  },
];

interface ThemePresetsProps {
  currentPrimaryColor?: string;
  onPreviewTheme: (preset: typeof PRESET_THEMES[0]) => void;
  onApplyTheme: (preset: typeof PRESET_THEMES[0]) => void;
}

export const ThemePresets: React.FC<ThemePresetsProps> = ({
  currentPrimaryColor = "#F97316",
  onPreviewTheme,
  onApplyTheme,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-bold text-[#17191C] flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-[#F97316]" />
          <span>Thèmes Prédéfinis (6 Palettes Signature)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {PRESET_THEMES.map((theme) => {
          const isCurrent = currentPrimaryColor.toLowerCase() === theme.primary.toLowerCase();
          return (
            <div
              key={theme.id}
              className={`p-3 rounded-xl border transition-all text-[13px] ${
                isCurrent
                  ? "bg-[#FFF7ED] border-[#FDBA74] shadow-xs"
                  : "bg-[#FFFFFF] border-[#E5E7EB] hover:border-[#D0D5DD]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {/* Swatches */}
                  <div className="flex items-center gap-1">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 inline-block shrink-0 shadow-2xs"
                      style={{ backgroundColor: theme.primary }}
                      title="Principal"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 inline-block shrink-0 shadow-2xs"
                      style={{ backgroundColor: theme.secondary }}
                      title="Secondaire"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 inline-block shrink-0 shadow-2xs"
                      style={{ backgroundColor: theme.accent }}
                      title="Accent"
                    />
                  </div>
                  <span className="font-bold text-[#17191C] text-[13px]">
                    {theme.name}
                  </span>
                </div>

                {isCurrent && (
                  <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[11px] font-bold rounded-full border border-[#86EFAC] flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Thème actuel
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#667085] mb-2.5 leading-snug">
                {theme.description}
              </p>

              <div className="flex items-center gap-2 pt-1 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => onPreviewTheme(theme)}
                  className="flex-1 h-8 px-2.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#F7F8FA] text-[#344054] text-[12px] font-medium rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#667085]" />
                  <span>Prévisualiser</span>
                </button>

                <button
                  type="button"
                  onClick={() => onApplyTheme(theme)}
                  className="flex-1 h-8 px-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-[12px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Utiliser ce thème</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

