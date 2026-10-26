import React from "react";
import { CheckCircle2, Palette, Tag, Layers, Sparkles } from "lucide-react";
import {
  ProductCardAspectRatio,
  ProductCardStyleVariant,
} from "../../../../../../domains/seller/customPage.types";

interface ProductCardStyleControllerProps {
  settings: Record<string, unknown>;
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  inputClass: string;
}

const CARD_STYLES: Array<{
  id: ProductCardStyleVariant;
  label: string;
  desc: string;
}> = [
  { id: "modern", label: "Moderne", desc: "Carte nette & bordure fine" },
  { id: "minimal", label: "Minimal", desc: "Éditorial sans cadre" },
  { id: "bordered", label: "Encadré", desc: "Contour structuré galerie" },
  { id: "elevated", label: "Surélevé", desc: "Relief doux & ombre" },
];

const ASPECT_RATIOS: Array<{
  id: ProductCardAspectRatio;
  label: string;
}> = [
  { id: "1/1", label: "1:1 (Carré)" },
  { id: "4/5", label: "4:5 (Portrait)" },
  { id: "4/3", label: "4:3 (Standard)" },
];

const ECOMMERCE_CARD_TOGGLES: Array<{
  key: string;
  label: string;
  defaultChecked?: boolean;
}> = [
  { key: "showCategory", label: "Afficher la catégorie & marque", defaultChecked: true },
  { key: "showStockBadge", label: "Badge En stock sur l'image", defaultChecked: true },
  { key: "showCompareAtPrice", label: "Prix barré (si promotion réelle)", defaultChecked: true },
  { key: "showWishlistButton", label: "Bouton Favoris (Cœur) sur l'image", defaultChecked: true },
  { key: "showStockProgress", label: "Jauge de stock réel disponible" },
];

export const ProductCardStyleController: React.FC<ProductCardStyleControllerProps> = ({
  settings,
  onSettingsChange,
}) => {
  const activeCardStyle = (settings.cardStyle as ProductCardStyleVariant) || "modern";
  const activeAspectRatio = (settings.cardAspectRatio as ProductCardAspectRatio) || "4/5";

  const isToggleActive = (key: string, defaultChecked?: boolean): boolean => {
    if (defaultChecked) {
      return settings[key] !== false;
    }
    return Boolean(settings[key]);
  };

  return (
    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-3 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#023859]" />
          <span>Modèle de Carte Produit</span>
        </span>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      </div>

      {/* 1. Sélecteur Visuel du Style de Carte */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-[#011C40] flex items-center gap-1">
          <Layers className="w-3 h-3 text-[#26658C]" />
          <span>Style de carte produit</span>
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {CARD_STYLES.map((st) => {
            const isSelected = activeCardStyle === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => onSettingsChange("cardStyle", st.id)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#023859] bg-[#F8FBFC] text-[#011C40] ring-1 ring-[#023859]/25"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                }`}
              >
                <span className="text-[11px] font-bold block">{st.label}</span>
                <span className="text-[9px] opacity-80 block truncate">{st.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sélecteur de Ratio Photo Produit */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-[#011C40] block">
          Ratio photo produit
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected = activeAspectRatio === ratio.id;
            return (
              <button
                key={ratio.id}
                type="button"
                onClick={() => onSettingsChange("cardAspectRatio", ratio.id)}
                className={`h-8 px-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#023859] bg-[#023859] text-white shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#26658C]"
                }`}
              >
                {ratio.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Couleur d'accent des badges */}
      <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
        <span className="text-xs font-semibold text-[#011C40] flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#023859]" />
          <span>Couleur d'accent (Badge Stock)</span>
        </span>
        <input
          type="color"
          value={(settings.cardAccentColor as string) || "#023859"}
          onChange={(e) => onSettingsChange("cardAccentColor", e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-slate-200"
        />
      </div>

      {/* 4. Informations Réelles Affichées */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100">
        <span className="text-[11px] font-bold text-[#011C40] flex items-center gap-1">
          <Tag className="w-3 h-3 text-[#26658C]" />
          <span>Informations produit affichées</span>
        </span>

        {ECOMMERCE_CARD_TOGGLES.map((item) => {
          const checked = isToggleActive(item.key, item.defaultChecked);
          return (
            <label
              key={item.key}
              className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs cursor-pointer hover:bg-[#F8FBFC]"
            >
              <span className="font-medium text-slate-800">{item.label}</span>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onSettingsChange(item.key, e.target.checked)}
                className="accent-[#023859] w-4 h-4"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
};
