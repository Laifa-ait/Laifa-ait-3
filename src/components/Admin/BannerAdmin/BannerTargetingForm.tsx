import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Clock, MapPin, Users, LayoutGrid } from "lucide-react";
import { ALGERIA_WILAYAS } from "../../../constants/wilayas";
import { BannerZone } from "../../../hooks/useBannerAdmin";

export interface BannerTargetingFormProps {
  bannerIsActive: boolean;
  setBannerIsActive: (v: boolean) => void;
  sortOrder: number;
  setSortOrder: (v: number) => void;
  bannerTargetUserType: "all" | "new" | "logged_in";
  setBannerTargetUserType: (v: "all" | "new" | "logged_in") => void;
  bannerTargetRegions: string[];
  setBannerTargetRegions: (v: string[]) => void;
  bannerStartDate: string;
  setBannerStartDate: (v: string) => void;
  bannerEndDate: string;
  setBannerEndDate: (v: string) => void;
  showCountdown: boolean;
  setShowCountdown: (v: boolean) => void;
  bannerZone: BannerZone;
  setBannerZone: (v: BannerZone) => void;
  bannerAbGroup: "all" | "A" | "B";
  setBannerAbGroup: (v: "all" | "A" | "B") => void;
}

const WILAYA_REGIONAL_GROUPS: Record<string, string[]> = {
  Centre: ["16 - Alger", "09 - Blida", "35 - Boumerdès", "42 - Tipaza", "15 - Tizi Ouzou", "10 - Bouira", "26 - Médéa"],
  Ouest: ["31 - Oran", "13 - Tlemcen", "27 - Mostaganem", "22 - Sidi Bel Abbès", "02 - Chlef", "29 - Mascara"],
  Est: ["25 - Constantine", "19 - Sétif", "23 - Annaba", "05 - Batna", "06 - Béjaïa", "21 - Skikda"],
  Sud: ["30 - Ouargla", "07 - Biskra", "08 - Béchar", "47 - Ghardaïa", "01 - Adrar", "11 - Tamanrasset"],
};

export const BannerTargetingForm: React.FC<BannerTargetingFormProps> = (p) => {
  const { t } = useTranslation();
  const [wilayaSearch, setWilayaSearch] = useState("");

  const allWilayaLabels = ALGERIA_WILAYAS.map((w) => `${w.code} - ${w.name}`);
  const filteredWilayas = allWilayaLabels.filter((w) =>
    w.toLowerCase().includes(wilayaSearch.toLowerCase())
  );

  const toggleWilaya = (label: string) => {
    if (p.bannerTargetRegions.includes(label)) {
      p.setBannerTargetRegions(p.bannerTargetRegions.filter((w) => w !== label));
    } else {
      p.setBannerTargetRegions([...p.bannerTargetRegions, label]);
    }
  };

  const applyQuickDuration = (hours: number | null) => {
    if (hours === null) {
      p.setBannerStartDate("");
      p.setBannerEndDate("");
      p.setShowCountdown(false);
      return;
    }
    const now = new Date();
    const end = new Date(now.getTime() + hours * 3600 * 1000);
    p.setBannerStartDate(now.toISOString().slice(0, 16));
    p.setBannerEndDate(end.toISOString().slice(0, 16));
    p.setShowCountdown(true);
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80">
        <div className="sm:col-span-2 flex items-center justify-between bg-white p-3 rounded-xl border border-zinc-200">
          <div>
            <span className="text-xs font-extrabold text-zinc-900 uppercase block">{t("Statut de publication")}</span>
            <span className="text-[10px] font-bold text-zinc-500">
              {p.bannerIsActive ? t("En ligne sur le Storefront") : t("Enregistrée en Brouillon")}
            </span>
          </div>
          <input type="checkbox" checked={p.bannerIsActive} onChange={(e) => p.setBannerIsActive(e.target.checked)} className="w-5 h-5 accent-orange-600 rounded cursor-pointer" />
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
          <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">{t("Position de Tri")}</label>
          <input type="number" min={1} max={99} value={p.sortOrder} onChange={(e) => p.setSortOrder(Math.max(1, Number(e.target.value) || 1))} className="w-full h-7 px-2 rounded-lg border border-zinc-200 text-xs font-mono font-bold" />
        </div>
      </div>

      <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-orange-600" />
            {t("Audience Cible")}
          </label>
          <select value={p.bannerTargetUserType} onChange={(e) => p.setBannerTargetUserType(e.target.value as "all" | "new" | "logged_in")} className="w-full h-9 px-2.5 rounded-xl border border-zinc-200 text-xs font-bold bg-white cursor-pointer">
            <option value="all">{t("Tous les visiteurs")}</option>
            <option value="new">{t("Nouveaux visiteurs")}</option>
            <option value="logged_in">{t("Clients connectés")}</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1 flex items-center gap-1">
            <LayoutGrid className="w-3 h-3 text-orange-600" />
            {t("Zone d'Affichage")}
          </label>
          <select value={p.bannerZone} onChange={(e) => p.setBannerZone(e.target.value as BannerZone)} className="w-full h-9 px-2.5 rounded-xl border border-zinc-200 text-xs font-bold bg-white cursor-pointer">
            <option value="carousel_main">{t("Carrousel Hero Principal")}</option>
            <option value="grid_top">{t("Bannière Grille Haute")}</option>
            <option value="grid_bottom">{t("Bannière Grille Basse")}</option>
            <option value="sidebar">{t("Bannière Latérale")}</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">{t("Groupe Test A/B")}</label>
          <select value={p.bannerAbGroup} onChange={(e) => p.setBannerAbGroup(e.target.value as "all" | "A" | "B")} className="w-full h-9 px-2.5 rounded-xl border border-zinc-200 text-xs font-bold bg-white cursor-pointer">
            <option value="all">{t("100% Audience (Sans A/B)")}</option>
            <option value="A">{t("Variante A (50%)")}</option>
            <option value="B">{t("Variante B (50%)")}</option>
          </select>
        </div>
      </div>

      <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>{t("Ciblage Wilayas")} ({p.bannerTargetRegions.length === 0 ? "69 Wilayas" : `${p.bannerTargetRegions.length} sélectionnées`})</span>
          </label>
          <div className="flex flex-wrap gap-1">
            <button type="button" onClick={() => p.setBannerTargetRegions(allWilayaLabels)} className="px-2 py-0.5 rounded-lg bg-zinc-900 text-white text-[10px] font-bold cursor-pointer">
              {t("Toutes (69)")}
            </button>
            {Object.entries(WILAYA_REGIONAL_GROUPS).map(([region, list]) => (
              <button key={region} type="button" onClick={() => p.setBannerTargetRegions(Array.from(new Set([...p.bannerTargetRegions, ...list])))} className="px-2 py-0.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-[10px] font-bold cursor-pointer">
                +{region}
              </button>
            ))}
            {p.bannerTargetRegions.length > 0 && (
              <button type="button" onClick={() => p.setBannerTargetRegions([])} className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold cursor-pointer">
                {t("Vider")}
              </button>
            )}
          </div>
        </div>

        <input type="text" value={wilayaSearch} onChange={(e) => setWilayaSearch(e.target.value)} placeholder={t("Filtrer une wilaya (ex: 16, Alger, Oran)...")} className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-white text-xs focus:outline-none" />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-zinc-200">
          {filteredWilayas.map((label) => {
            const isChecked = p.bannerTargetRegions.includes(label);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleWilaya(label)}
                className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left text-[11px] font-bold cursor-pointer border ${
                  isChecked ? "bg-orange-50 border-orange-500 text-orange-950" : "bg-white border-zinc-100 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${isChecked ? "bg-orange-600 text-white" : "border border-zinc-300"}`}>
                  {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-600" />
            <span>{t("Programmation & Compte à Rebours")}</span>
          </label>
          <div className="flex gap-1">
            {[
              { label: "+24h Flash", h: 24 },
              { label: "+3j Week-end", h: 72 },
              { label: "+7j Semaine", h: 168 },
              { label: "Permanent", h: null },
            ].map((pr) => (
              <button key={pr.label} type="button" onClick={() => applyQuickDuration(pr.h)} className="px-2 py-0.5 rounded-lg bg-white border border-zinc-200 text-[10px] font-bold text-zinc-700 cursor-pointer">
                {pr.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input type="datetime-local" value={p.bannerStartDate} onChange={(e) => p.setBannerStartDate(e.target.value)} className="w-full h-9 px-2.5 rounded-xl border border-zinc-200 text-xs font-bold bg-white" />
          <input type="datetime-local" value={p.bannerEndDate} onChange={(e) => p.setBannerEndDate(e.target.value)} className="w-full h-9 px-2.5 rounded-xl border border-zinc-200 text-xs font-bold bg-white" />
        </div>

        <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-zinc-200 cursor-pointer">
          <span className="text-xs font-bold text-zinc-800">{t("Afficher le compte à rebours dynamique sur la bannière")}</span>
          <input type="checkbox" checked={p.showCountdown} onChange={(e) => p.setShowCountdown(e.target.checked)} className="w-4 h-4 accent-orange-600 rounded cursor-pointer" />
        </label>
      </div>
    </div>
  );
};
