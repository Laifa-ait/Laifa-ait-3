import React from "react";
import { Palette, Check } from "lucide-react";

export const PRESET_THEMES = [
  {
    id: "heritage-zellige",
    name: "Heritage et Zellige (Artisanat)",
    description: "Thème emblématique aux teintes terre cuite, indigo zellige et or ciselé",
    primary: "#B85B35",
    secondary: "#1C2A39",
    accent: "#D4AF37",
    canvas: "#FAF6F0",
    surface: "#FFFFFF",
  },
  {
    id: "sahara-gold",
    name: "Sahara Gold",
    description: "Dunes dorées chaudes et terre cuite désertique",
    primary: "#D97706",
    secondary: "#451A03",
    accent: "#F59E0B",
    canvas: "#FFFBEB",
    surface: "#FFFFFF",
  },
  {
    id: "oran-mediterranee",
    name: "Oran Méditerranée",
    description: "Bleu mer vibrant et fraîcheur côtière lumineuse",
    primary: "#0284C7",
    secondary: "#0F172A",
    accent: "#06B6D4",
    canvas: "#F0F9FF",
    surface: "#FFFFFF",
  },
  {
    id: "olmart-orange",
    name: "Olmart Orange",
    description: "Thème signature vibrant, chaleureux et moderne",
    primary: "#F97316",
    secondary: "#1A1A2E",
    accent: "#14B8A6",
    canvas: "#F7F8FA",
    surface: "#FFFFFF",
  },
  {
    id: "minimal-mono",
    name: "Minimal Mono",
    description: "Design monochrome sobre, épuré et contemporain",
    primary: "#111827",
    secondary: "#4B5563",
    accent: "#9CA3AF",
    canvas: "#FAFAFA",
    surface: "#FFFFFF",
  },
  {
    id: "elegant-prestige",
    name: "Élégant Prestige",
    description: "Tons de terre prestigieux, cuir et accents dorés nobles",
    primary: "#8B5E3C",
    secondary: "#2B2118",
    accent: "#D6AD60",
    canvas: "#FAF8F5",
    surface: "#FFFFFF",
  },
  {
    id: "moderne-indigo",
    name: "Moderne Indigo",
    description: "Palette indigo dynamique et ultra-professionnelle",
    primary: "#4F46E5",
    secondary: "#1E1B4B",
    accent: "#06B6D4",
    canvas: "#EEF2FF",
    surface: "#FFFFFF",
  },
  {
    id: "naturel-atlas",
    name: "Naturel Atlas",
    description: "Verdure organique de l'Atlas et touches de bois chaud",
    primary: "#3F6B50",
    secondary: "#25382D",
    accent: "#D3A75F",
    canvas: "#F6FBF7",
    surface: "#FFFFFF",
  },
];

interface ThemePresetsProps {
  currentPrimaryColor?: string;
  onApplyTheme: (preset: typeof PRESET_THEMES[0]) => void;
}

export const ThemePresets: React.FC<ThemePresetsProps> = ({
  currentPrimaryColor = "#111827",
  onApplyTheme,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-semibold text-slate-900 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-slate-700" />
          <span>Thèmes Prédéfinis ({PRESET_THEMES.length} Palettes Signature)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {PRESET_THEMES.map((theme) => {
          const isCurrent = currentPrimaryColor.toLowerCase() === theme.primary.toLowerCase();
          return (
            <div
              key={theme.id}
              className={`p-3 rounded-lg border transition-colors text-[12px] ${
                isCurrent
                  ? "bg-slate-50 border-slate-900"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0"
                      style={{ backgroundColor: theme.primary }}
                      title="Principal"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0"
                      style={{ backgroundColor: theme.secondary }}
                      title="Secondaire"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0"
                      style={{ backgroundColor: theme.accent }}
                      title="Accent"
                    />
                  </div>
                  <span className="font-semibold text-slate-900 text-[12px]">
                    {theme.name}
                  </span>
                </div>

                {isCurrent && (
                  <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Actuel
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mb-2.5 leading-snug">
                {theme.description}
              </p>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onApplyTheme(theme)}
                  className="h-8 w-full px-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-medium rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
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

