import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, MapPin, X } from "lucide-react";
import {
  ALGERIA_WILAYAS_DATABASE,
  getDairasForWilaya,
  getCommunesForDaira,
  findDairaForCommune,
  searchAlgerianLocations,
  LocationSearchResult,
} from "../../../../data/algerianCommunesDatabase";

interface CheckoutLocationSelectorProps {
  wilaya: string;
  daira?: string;
  commune: string;
  setFormData: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      email: string;
      phone: string;
      wilaya: string;
      daira?: string;
      commune: string;
      address: string;
    }>
  >;
  availableCommunes?: string[];
  shippingData?: { wilayas: unknown[] };
}

export const CheckoutLocationSelector: React.FC<CheckoutLocationSelectorProps> = ({
  wilaya,
  daira = "",
  commune,
  setFormData,
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const cleanWilaya = useMemo(() => (wilaya ? wilaya.replace(/^\d{1,2}\s*-\s*/, "").trim() : ""), [wilaya]);
  const searchResults = useMemo<LocationSearchResult[]>(() => {
    return searchQuery.trim().length >= 2 ? searchAlgerianLocations(searchQuery.trim(), 6) : [];
  }, [searchQuery]);

  const dairas = useMemo<string[]>(() => (cleanWilaya ? getDairasForWilaya(cleanWilaya) : []), [cleanWilaya]);
  const communes = useMemo(() => (cleanWilaya ? getCommunesForDaira(cleanWilaya, daira || undefined) : []), [cleanWilaya, daira]);

  const handleSelectResult = (res: LocationSearchResult) => {
    const targetW = ALGERIA_WILAYAS_DATABASE.find((w) => w.code === res.wilayaCode || w.name.toLowerCase() === res.wilaya.toLowerCase());
    const wDisp = targetW ? `${targetW.code} - ${targetW.name}` : res.wilaya;
    setFormData((prev) => ({
      ...prev,
      wilaya: wDisp,
      daira: res.daira || (res.commune ? findDairaForCommune(res.wilaya, res.commune) || "" : ""),
      commune: res.commune || (res.type === "commune" ? res.label : ""),
    }));
    localStorage.setItem("olma_default_wilaya", wDisp);
    setSearchQuery("");
    setIsSearching(false);
  };

  return (
    <div className="space-y-4" id="checkout-location-selector">
      <div className="relative">
        <label className="text-xs font-sans font-bold text-zinc-600 tracking-wider ms-1 mb-1.5 block">
          {t("checkout.quick_search", isAr ? "بحث سريع (ولاية / دائرة / بلدية)" : "Recherche Rapide (Wilaya / Daïra / Commune)")}
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearching(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(true);
            }}
            placeholder={t("checkout.search_location_placeholder", isAr ? "ابحث عن بلدية أو دائرة أو ولاية..." : "Rechercher commune, daïra ou wilaya...")}
            className="w-full h-11 px-10 bg-white border border-zinc-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 rounded-xl outline-none font-semibold text-xs sm:text-sm text-zinc-900 transition-all"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearching(false);
              }}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 bg-transparent border-none cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {isSearching && searchResults.length > 0 && (
          <div className="absolute z-20 start-0 end-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-zinc-100">
            {searchResults.map((item, idx) => (
              <button
                key={`${item.type}-${item.wilayaCode}-${idx}`}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="w-full px-4 py-2.5 text-start hover:bg-amber-50/70 flex items-center justify-between text-xs sm:text-sm transition-colors cursor-pointer bg-transparent border-none"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-bold text-zinc-900">{item.commune || item.daira || item.wilaya}</span>
                  <span className="text-[11px] text-zinc-400">({item.wilayaCode} - {item.wilaya})</span>
                </div>
                {item.nameAr && <span className="text-[11px] font-bold text-zinc-500 dir-rtl">{item.nameAr}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="wilaya" className="text-xs font-sans font-bold text-zinc-600 tracking-wider ms-1 block">
            {t("wilaya", isAr ? "الولاية" : "Wilaya")} <span className="text-rose-500">*</span>
          </label>
          <select
            id="wilaya"
            value={wilaya}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, wilaya: val, daira: "", commune: "" }));
              localStorage.setItem("olma_default_wilaya", val);
            }}
            className="w-full h-11 px-3 bg-zinc-50/70 border border-zinc-200 focus:bg-white focus:border-amber-500 rounded-xl outline-none font-semibold text-xs text-zinc-900 cursor-pointer transition-all"
          >
            <option value="">-- {t("checkout.select_wilaya", isAr ? "اختر الولاية" : "Sélectionnez votre wilaya")} --</option>
            {ALGERIA_WILAYAS_DATABASE.map((w) => (
              <option key={w.code} value={`${w.code} - ${w.name}`}>
                {w.code} - {w.name} {w.name_ar ? `(${w.name_ar})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="daira" className="text-xs font-sans font-bold text-zinc-600 tracking-wider ms-1 block">
            {t("checkout.daira", isAr ? "الدائرة" : "Daïra")}
          </label>
          <select
            id="daira"
            value={daira}
            disabled={!cleanWilaya || dairas.length === 0}
            onChange={(e) => setFormData((prev) => ({ ...prev, daira: e.target.value, commune: "" }))}
            className="w-full h-11 px-3 bg-zinc-50/70 border border-zinc-200 focus:bg-white focus:border-amber-500 rounded-xl outline-none font-semibold text-xs text-zinc-900 cursor-pointer transition-all disabled:opacity-50"
          >
            <option value="">-- {t("checkout.all_dairas", isAr ? "كل الدوائر" : "Toutes les daïras")} --</option>
            {dairas.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="commune" className="text-xs font-sans font-bold text-zinc-600 tracking-wider ms-1 block">
            {t("commune", isAr ? "البلدية" : "Commune")} <span className="text-rose-500">*</span>
          </label>
          <select
            id="commune"
            value={commune}
            disabled={!cleanWilaya}
            onChange={(e) => {
              const cVal = e.target.value;
              const autoDaira = findDairaForCommune(cleanWilaya, cVal);
              setFormData((prev) => ({ ...prev, commune: cVal, ...(autoDaira && !prev.daira ? { daira: autoDaira } : {}) }));
            }}
            className="w-full h-11 px-3 bg-zinc-50/70 border border-zinc-200 focus:bg-white focus:border-amber-500 rounded-xl outline-none font-semibold text-xs text-zinc-900 cursor-pointer transition-all disabled:opacity-50"
          >
            <option value="">-- {t("checkout.select_commune", isAr ? "اختر البلدية" : "Sélectionnez votre commune")} --</option>
            {communes.map((c) => (
              <option key={`${c.name}-${c.postal_code}`} value={c.name}>
                {c.name} {c.name_ar ? `(${c.name_ar})` : ""}
              </option>
            ))}
            <option value="Autre">{t("Autre commune", isAr ? "بلدية أخرى..." : "Autre commune...")}</option>
          </select>
        </div>
      </div>

      {commune === "Autre" && (
        <div className="space-y-1.5 pt-1">
          <label htmlFor="customCommune" className="text-xs font-sans font-bold text-zinc-600 tracking-wider ms-1 block">
            {t("enter_commune_name", isAr ? "حدد اسم بلديتك" : "Précisez le nom de votre commune")} <span className="text-rose-500">*</span>
          </label>
          <input
            id="customCommune"
            type="text"
            placeholder={t("enter_commune_placeholder", isAr ? "مثال: اسم القرية أو الحي" : "Ex: Nom du village ou lieu-dit")}
            onChange={(e) => setFormData((prev) => ({ ...prev, commune: e.target.value }))}
            className="w-full h-11 px-4 bg-zinc-50/70 border border-zinc-200 focus:bg-white focus:border-amber-500 rounded-xl outline-none font-semibold text-xs sm:text-sm text-zinc-900 transition-all"
          />
        </div>
      )}

      {wilaya && commune && commune !== "Autre" && (
        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between text-xs text-amber-950 font-semibold">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{wilaya} {daira ? `• ${daira}` : ""} • {commune}</span>
          </div>
          <span className="text-[10px] text-amber-700 font-bold bg-amber-100/80 px-2 py-0.5 rounded-md shrink-0 ms-2">
            {isAr ? "الجزائر (الدفع عند الاستلام)" : "Algérie (COD)"}
          </span>
        </div>
      )}
    </div>
  );
};
