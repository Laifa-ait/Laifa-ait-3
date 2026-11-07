import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Languages, Link2, Sparkles, Tag as TagIcon } from "lucide-react";
import { BannerRedirectType, TagType } from "../../../hooks/useBannerAdmin";
import { PRODUCT_HIERARCHY } from "../../../constants";
import { Product } from "../../../domains/product/product.types";
import { BannerTranslationFields } from "../../../domains/home/homepage.types";

export interface BannerVisualFormProps {
  bannerTitle: string;
  setBannerTitle: (v: string) => void;
  bannerSubtitle: string;
  setBannerSubtitle: (v: string) => void;
  badge: string;
  setBadge: (v: string) => void;
  discountLabel: string;
  setDiscountLabel: (v: string) => void;
  bannerButtonText: string;
  setBannerButtonText: (v: string) => void;
  secondaryButtonText: string;
  setSecondaryButtonText: (v: string) => void;
  secondaryCtaLink: string;
  setSecondaryCtaLink: (v: string) => void;
  redirectType: BannerRedirectType;
  setRedirectType: (v: BannerRedirectType) => void;
  bannerTagId: string;
  setBannerTagId: (v: string) => void;
  ctaLink: string;
  setCtaLink: (v: string) => void;
  targetCategory: string;
  setTargetCategory: (v: string) => void;
  translations: Record<string, BannerTranslationFields | Record<string, string>>;
  setTranslations: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>;
  tags: TagType[];
  allProducts?: Product[];
}

export const BannerVisualForm: React.FC<BannerVisualFormProps> = (p) => {
  const { t } = useTranslation();
  const [editLang, setEditLang] = useState<"fr" | "ar" | "en">("fr");
  const categoriesList = Object.keys(PRODUCT_HIERARCHY);

  const handleLocalizedChange = (field: keyof BannerTranslationFields, val: string) => {
    if (editLang === "fr") {
      if (field === "title") p.setBannerTitle(val);
      if (field === "subtitle") p.setBannerSubtitle(val);
      if (field === "button_text") p.setBannerButtonText(val);
      if (field === "badge") p.setBadge(val);
    }
    p.setTranslations((prev) => ({
      ...prev,
      [editLang]: { ...(prev[editLang] || {}), [field]: val },
    }));
  };

  const getLoc = (field: keyof BannerTranslationFields): string => {
    if (editLang === "fr") {
      if (field === "title") return p.bannerTitle;
      if (field === "subtitle") return p.bannerSubtitle;
      if (field === "button_text") return p.bannerButtonText;
      if (field === "badge") return p.badge;
    }
    return p.translations[editLang]?.[field] || "";
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">
            {t("Langue d'édition du contenu")}
          </span>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-zinc-200 gap-1">
          {([
            { code: "fr", label: "🇫🇷 FR" },
            { code: "ar", label: "🇩🇿 AR" },
            { code: "en", label: "🇬🇧 EN" },
          ] as const).map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setEditLang(l.code)}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                editLang === l.code ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" />
            {t("Badge / Sur-titre")} ({editLang.toUpperCase()})
          </label>
          <input type="text" dir={editLang === "ar" ? "rtl" : "ltr"} placeholder={editLang === "ar" ? "مجموعة حصرية" : "ex: NOUVELLE COLLECTION 2026"} value={getLoc("badge")} onChange={(e) => handleLocalizedChange("badge", e.target.value)} className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 text-xs font-semibold bg-white" />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{t("Étiquette Promo / Remise")}</label>
          <input type="text" placeholder="ex: JUSQU'À -50%" value={p.discountLabel} onChange={(e) => p.setDiscountLabel(e.target.value)} className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 text-xs font-semibold bg-white" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            {t("Titre Principal")} ({editLang.toUpperCase()}) {editLang === "fr" && "*"}
          </label>
          <input type="text" required={editLang === "fr"} dir={editLang === "ar" ? "rtl" : "ltr"} placeholder="ex: L'Excellence du Savoir-Faire Algérien" value={getLoc("title")} onChange={(e) => handleLocalizedChange("title", e.target.value)} className="w-full h-11 px-4 rounded-xl border border-zinc-200 text-sm font-bold bg-white" />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            {t("Sous-titre descriptif")} ({editLang.toUpperCase()})
          </label>
          <textarea rows={2} dir={editLang === "ar" ? "rtl" : "ltr"} placeholder="ex: Découvrez nos pièces certifiées avec livraison 69 Wilayas" value={getLoc("subtitle")} onChange={(e) => handleLocalizedChange("subtitle", e.target.value)} className="w-full p-3 rounded-xl border border-zinc-200 text-xs font-medium bg-white resize-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            {t("Texte du Bouton Principal")} ({editLang.toUpperCase()})
          </label>
          <input type="text" dir={editLang === "ar" ? "rtl" : "ltr"} placeholder="ex: Découvrir la sélection" value={getLoc("button_text")} onChange={(e) => handleLocalizedChange("button_text", e.target.value)} className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 text-xs font-bold bg-white" />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{t("Bouton Secondaire (Optionnel)")}</label>
          <input type="text" placeholder="ex: Voir les conditions" value={p.secondaryButtonText} onChange={(e) => p.setSecondaryButtonText(e.target.value)} className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 text-xs font-medium bg-white" />
        </div>
      </div>

      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-3">
        <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
          <Link2 className="w-4 h-4 text-orange-600" />
          <span>{t("Destination au Clic sur la Bannière")}</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {([
            { id: "shop", label: "Boutique (/shop)" },
            { id: "category", label: "Catégorie" },
            { id: "tag", label: "Tag Catalogue" },
            { id: "campaign", label: "Page Campagne" },
            { id: "custom_url", label: "Lien Libre" },
          ] as const).map((rt) => (
            <button
              key={rt.id}
              type="button"
              onClick={() => p.setRedirectType(rt.id)}
              className={`py-2 px-2 rounded-xl text-[10px] font-bold uppercase cursor-pointer border ${
                p.redirectType === rt.id ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              {rt.label}
            </button>
          ))}
        </div>

        {p.redirectType === "tag" && (
          <div className="space-y-1 pt-1">
            <label className="text-[11px] font-bold uppercase text-zinc-600 flex items-center gap-1">
              <TagIcon className="w-3 h-3 text-orange-600" />
              {t("Choisir le Tag de destination")}
            </label>
            <select value={p.bannerTagId} onChange={(e) => p.setBannerTagId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs font-bold bg-white cursor-pointer">
              <option value="">{t("Sélectionnez un tag existant...")}</option>
              {p.tags.map((tag) => (
                <option key={tag.id} value={tag.id}>{tag.name} (/tags/{tag.id})</option>
              ))}
            </select>
          </div>
        )}

        {p.redirectType === "category" && (
          <select value={p.targetCategory} onChange={(e) => p.setTargetCategory(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs font-bold bg-white cursor-pointer">
            <option value="">{t("Sélectionnez une catégorie...")}</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}

        {p.redirectType === "custom_url" && (
          <input type="text" value={p.ctaLink} onChange={(e) => p.setCtaLink(e.target.value)} placeholder="/shop?sort=newest" className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 text-xs font-mono bg-white" />
        )}

        {p.secondaryButtonText && (
          <input type="text" value={p.secondaryCtaLink} onChange={(e) => p.setSecondaryCtaLink(e.target.value)} placeholder={t("Lien du bouton secondaire (/shop)")} className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs font-mono bg-white" />
        )}
      </div>
    </div>
  );
};
