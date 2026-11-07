import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Upload, Save, RotateCcw, Sparkles, CheckCircle2 } from "lucide-react";
import { ALGERIA_WILAYAS } from "../../../constants/wilayas";
import { WilayaBannerData } from "../../../hooks/bannerAdmin/useBannerTypes";
import { getBannerFallbackImage } from "../../../utils/imageUtils";

interface WilayaCampaignsSectionProps {
  selectedWilaya: string;
  setSelectedWilaya: (w: string) => void;
  wilayaBanners: Record<string, WilayaBannerData>;
  currentWilayaData: WilayaBannerData;
  updateCurrentWilayaField: (field: keyof WilayaBannerData, value: string) => void;
  handleWilayaImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "heroImage" | "promoLeftImage" | "promoRightImage"
  ) => Promise<void>;
  handleSaveWilayaCampaign: (e?: React.FormEvent | React.MouseEvent) => Promise<void>;
  handleDeleteWilayaCampaign: (wilayaName?: string) => Promise<void>;
  isUploadingWilayaImg: string | null;
  isSavingWilaya: boolean;
}

export const WilayaCampaignsSection: React.FC<WilayaCampaignsSectionProps> = ({
  selectedWilaya,
  setSelectedWilaya,
  wilayaBanners,
  currentWilayaData,
  updateCurrentWilayaField,
  handleWilayaImageUpload,
  handleSaveWilayaCampaign,
  handleDeleteWilayaCampaign,
  isUploadingWilayaImg,
  isSavingWilaya,
}) => {
  const { t } = useTranslation();
  const [searchWilaya, setSearchWilaya] = useState("");

  const safeBanners = wilayaBanners || {};
  const configuredWilayas = Object.keys(safeBanners);
  const allWilayaLabels = ALGERIA_WILAYAS.map((w) =>
    typeof w === "string" ? w : `${w.code} - ${w.name}`
  );
  const filteredWilayas = allWilayaLabels.filter((w) =>
    w.toLowerCase().includes(searchWilaya.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      <div className="lg:col-span-4 bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase text-zinc-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>{t("69 Wilayas d'Algérie")}</span>
            </h3>
            <p className="text-[11px] font-semibold text-zinc-500">
              {configuredWilayas.length} {t("campagne(s) régionale(s) personnalisée(s)")}
            </p>
          </div>
        </div>

        <input
          type="text"
          value={searchWilaya}
          onChange={(e) => setSearchWilaya(e.target.value)}
          placeholder={t("Filtrer une wilaya (ex: 16, Oran, Constantine)...")}
          className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold outline-none focus:border-orange-500"
        />

        <div className="max-h-[460px] overflow-y-auto space-y-1 pr-1">
          {filteredWilayas.map((w) => {
            const isSelected = selectedWilaya === w;
            const isConfigured = Boolean(safeBanners[w]);
            return (
              <button
                key={w}
                type="button"
                onClick={() => setSelectedWilaya(w)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-zinc-950 text-white shadow-sm"
                    : isConfigured
                    ? "bg-orange-50/70 text-orange-950 border border-orange-200 hover:bg-orange-100/70"
                    : "bg-white text-zinc-700 hover:bg-zinc-100 border border-transparent"
                }`}
              >
                <span className="truncate">{w}</span>
                {isConfigured && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-orange-500 text-white" : "bg-orange-600 text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {t("Actif")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-8 bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {t("Personnalisation Régionale Storefront")}
            </span>
            <h3 className="text-lg font-black text-zinc-950 uppercase mt-0.5">
              {t("Campagne Locale :")} {selectedWilaya}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {safeBanners[selectedWilaya] && (
              <button
                type="button"
                onClick={() => void handleDeleteWilayaCampaign(selectedWilaya)}
                className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t("Réinitialiser")}</span>
              </button>
            )}
            <button
              type="button"
              disabled={isSavingWilaya}
              onClick={(e) => void handleSaveWilayaCampaign(e)}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingWilaya ? t("Sauvegarde...") : t("Enregistrer pour cette Wilaya")}</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
          <h4 className="text-xs font-black uppercase text-zinc-900">
            {t("1. Bannière Hero Principale")} ({selectedWilaya})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-zinc-600 block mb-1">{t("Titre Régional")}</label>
              <input
                type="text"
                value={currentWilayaData.heroTitle}
                onChange={(e) => updateCurrentWilayaField("heroTitle", e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-white border border-zinc-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-600 block mb-1">{t("Texte du Bouton CTA")}</label>
              <input
                type="text"
                value={currentWilayaData.heroButtonText}
                onChange={(e) => updateCurrentWilayaField("heroButtonText", e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-white border border-zinc-200 text-xs font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-zinc-600 block mb-1">{t("Sous-titre / Livraison Locale")}</label>
              <input
                type="text"
                value={currentWilayaData.heroSubtitle}
                onChange={(e) => updateCurrentWilayaField("heroSubtitle", e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-white border border-zinc-200 text-xs font-bold"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <img
              src={currentWilayaData.heroImage}
              alt={selectedWilaya}
              onError={(e) => {
                e.currentTarget.src = getBannerFallbackImage(currentWilayaData.heroTitle);
              }}
              className="w-full sm:w-44 h-24 object-cover rounded-xl border border-zinc-200 shrink-0"
            />
            <div className="flex-1 w-full space-y-2">
              <input
                type="url"
                value={currentWilayaData.heroImage}
                onChange={(e) => updateCurrentWilayaField("heroImage", e.target.value)}
                placeholder="https://..."
                className="w-full h-9 px-3 rounded-xl bg-white border border-zinc-200 text-xs font-mono"
              />
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-[11px] font-bold cursor-pointer hover:bg-zinc-800">
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {isUploadingWilayaImg === "heroImage" ? t("Téléversement...") : t("Importer Image Hero")}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleWilayaImageUpload(e, "heroImage")}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["Left", "Right"] as const).map((side) => {
            const titleKey = side === "Left" ? "promoLeftTitle" : "promoRightTitle";
            const subKey = side === "Left" ? "promoLeftSubtitle" : "promoRightSubtitle";
            const imgKey = side === "Left" ? "promoLeftImage" : "promoRightImage";
            return (
              <div key={side} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                <h5 className="text-xs font-black uppercase text-zinc-800">
                  {side === "Left" ? t("2. Encart Promo Gauche") : t("3. Encart Promo Droite")}
                </h5>
                <input
                  type="text"
                  value={currentWilayaData[titleKey]}
                  onChange={(e) => updateCurrentWilayaField(titleKey, e.target.value)}
                  placeholder={t("Titre promo")}
                  className="w-full h-8 px-3 rounded-lg bg-white border border-zinc-200 text-xs font-bold"
                />
                <input
                  type="text"
                  value={currentWilayaData[subKey]}
                  onChange={(e) => updateCurrentWilayaField(subKey, e.target.value)}
                  placeholder={t("Sous-titre promo")}
                  className="w-full h-8 px-3 rounded-lg bg-white border border-zinc-200 text-xs"
                />
                <div className="flex items-center gap-2">
                  <img
                    src={currentWilayaData[imgKey]}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = getBannerFallbackImage(currentWilayaData[titleKey]);
                    }}
                    className="w-16 h-14 rounded-lg object-cover border border-zinc-200 shrink-0"
                  />
                  <label className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-[11px] font-bold cursor-pointer hover:bg-zinc-100 flex items-center gap-1">
                    <Upload className="w-3 h-3 text-orange-600" />
                    <span>{isUploadingWilayaImg === imgKey ? "..." : t("Changer photo")}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void handleWilayaImageUpload(e, imgKey)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
