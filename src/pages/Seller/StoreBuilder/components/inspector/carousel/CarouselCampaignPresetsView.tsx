import React from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { BannerContentPosition } from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import {
  CAROUSEL_CAMPAIGN_PRESETS,
  CarouselCampaignPreset,
} from "../../../constants/carouselPresets";

interface CarouselCampaignPresetsViewProps {
  settings: Record<string, unknown>;
  products: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  onSwitchToSlides: () => void;
}

export const CarouselCampaignPresetsView: React.FC<CarouselCampaignPresetsViewProps> = ({
  settings,
  products,
  onSettingsChange,
  onSwitchToSlides,
}) => {
  const handleApplyCampaignPreset = (preset: CarouselCampaignPreset, keepPhotos: boolean) => {
    const existingSlides = Array.isArray(settings.slides)
      ? (settings.slides as Array<Record<string, unknown>>)
      : [];
    const nextSlides = preset.slides.map((s, idx) => ({
      ...s,
      id: `slide_${Date.now()}_${idx}`,
      imageUrl:
        keepPhotos && existingSlides[idx]?.imageUrl
          ? String(existingSlides[idx].imageUrl)
          : s.imageUrl,
    }));
    onSettingsChange({
      activePresetId: preset.id,
      carouselStyle: preset.carouselStyle,
      bannerHeight: preset.bannerHeight,
      overlayOpacity: preset.overlayOpacity,
      contentPosition: preset.contentPosition,
      slides: nextSlides,
    });
    onSwitchToSlides();
  };

  const handleGenerateFromProducts = () => {
    const topProducts = products.slice(0, 4);
    if (topProducts.length === 0) return;
    const generated = topProducts.map((p, idx) => ({
      id: `slide_prod_${Date.now()}_${idx}`,
      imageUrl:
        p.images?.[0] ||
        p.image ||
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
      badge: p.category ? p.category.toUpperCase() : "SÉLECTION VEDETTE",
      title: p.name,
      subtitle: p.description
        ? String(p.description).slice(0, 110)
        : "Disponible immédiatement avec livraison rapide 69 Wilayas.",
      highlightPrice: `${Number(p.price || 0).toLocaleString("fr-DZ")} DA`,
      ctaText: "Commander l'article",
      link: `/product/${p.id}`,
      contentPosition: "bottom-left" as BannerContentPosition,
    }));
    onSettingsChange({ slides: generated });
    onSwitchToSlides();
  };

  return (
    <div className="space-y-3 select-none">
      {products.length > 0 && (
        <div className="p-3 rounded-xl bg-[#F0F7FA] border border-[#54ACBF]/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#011C40] flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-[#023859]" />
              <span>Génération automatique Catalogue</span>
            </span>
            <span className="text-[10px] font-bold text-[#023859] bg-white px-2 py-0.5 rounded-full border border-slate-200">
              {Math.min(4, products.length)} produits
            </span>
          </div>
          <p className="text-[10px] text-slate-600 leading-snug">
            Crée instantanément des diapositives avec les photos, titres, prix en DA et liens directs vers vos produits.
          </p>
          <button
            type="button"
            onClick={handleGenerateFromProducts}
            className="w-full h-8 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Créer mes slides depuis mes produits</span>
          </button>
        </div>
      )}

      <div className="space-y-2.5">
        {CAROUSEL_CAMPAIGN_PRESETS.map((preset) => {
          const isAct = settings.activePresetId === preset.id;
          return (
            <div
              key={preset.id}
              className={`p-3 rounded-xl border transition-all space-y-2 ${
                isAct
                  ? "border-[#023859] bg-[#F0F7FA]/60 ring-1 ring-[#023859]/25"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold text-[#011C40] block">{preset.name}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{preset.tagline}</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-[#023859] shrink-0">
                  {preset.badge}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleApplyCampaignPreset(preset, false)}
                  className="flex-1 h-8 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Appliquer ce modèle complet
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCampaignPreset(preset, true)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold cursor-pointer"
                >
                  Garder mes photos
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
