import React from "react";
import { CustomPageSection, CustomPageTheme } from "../../../domains/seller/customPage.types";
import {
  buildSectionContainerStyle,
  resolveBorderRadiusClass,
  resolveContainerWidthClass,
  SectionDividerRenderer,
} from "./sectionStyleHelper";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { EditorialHeading } from "../EditorialHeading";

interface SectionTrustAndContactProps {
  section: CustomPageSection;
  theme: CustomPageTheme;
  wrapperClass: string;
  isEditable?: boolean;
  onSelect?: () => void;
  isSubActive: (subElement: string) => boolean;
  handleSubElementClick: (subElement: string, e: React.MouseEvent) => void;
}

export const SectionTrustAndContact: React.FC<SectionTrustAndContactProps> = ({
  section,
  theme,
  wrapperClass,
  isEditable,
  onSelect,
  isSubActive,
  handleSubElementClick,
}) => {
  const styles = section.styles || {};
  const rawSettings = (section.settings || {}) as Record<string, unknown>;
  const radiusClass = resolveBorderRadiusClass(styles.borderRadius);
  const widthClass = resolveContainerWidthClass(styles.containerWidth);
  const accentColor = theme.primaryColor || "#F97316";
  const textAlign = (rawSettings.textAlignment as string) || "left";
  const alignClass =
    textAlign === "center" ? "text-center" : textAlign === "right" ? "text-right" : "text-left";

  if (section.type === "verified_reviews") {
    const defaultReviews = [
      { author: "Amina K. (Alger)", rating: 5, comment: "Qualité remarquable et livraison rapide à domicile avec paiement à la réception." },
      { author: "Karim B. (Oran)", rating: 5, comment: "Produit fidèle aux photos, emballage très soigné. Je recommande cette boutique !" },
      { author: "Yasmine M. (Constantine)", rating: 5, comment: "Service client réactif et articles authentiques." },
    ];
    const customReviews =
      Array.isArray(rawSettings.customReviews) && rawSettings.customReviews.length > 0
        ? (rawSettings.customReviews as Array<{ author: string; rating: number; comment: string }>)
        : defaultReviews;
    const limit = typeof rawSettings.maxReviews === "number" ? rawSettings.maxReviews : 3;

    return (
      <div
        onClick={isEditable ? onSelect : undefined}
        className={wrapperClass}
        style={buildSectionContainerStyle(styles, "transparent", "#17191C")}
      >
        <div className={widthClass}>
          <div className={`mb-6 flex flex-col @sm:flex-row @sm:items-center justify-between gap-2 ${alignClass}`}>
            <div>
              <EditorialHeading
                as="h2"
                text={String(rawSettings.title || "Avis Clients Vérifiés")}
                theme={theme}
                sectionStyles={styles}
                onClick={(e) => handleSubElementClick("title", e)}
                className={`text-xl @md:text-2xl font-extrabold rounded px-1 ${
                  isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""
                }`}
              />
              {Boolean(rawSettings.subtitle) && <p className="text-xs opacity-75 mt-1">{String(rawSettings.subtitle)}</p>}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold self-start">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.9 / 5 • Achats Vérifiés Olmart</span>
            </div>
          </div>
          <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
            {customReviews.slice(0, limit).map((rev, i) => (
              <div
                key={i}
                onClick={(e) => handleSubElementClick(`review-${i}`, e)}
                className={`p-4 bg-white border border-slate-200 shadow-2xs text-slate-800 space-y-2 ${radiusClass} ${
                  isSubActive(`review-${i}`) ? "ring-2 ring-[#2563EB]" : ""
                }`}
              >
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: rev.rating || 5 }).map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs @sm:text-sm leading-relaxed text-slate-600">« {rev.comment} »</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>{rev.author}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">✓ Vérifié</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <SectionDividerRenderer divider={styles.divider} theme={theme} />
      </div>
    );
  }

  if (section.type === "delivery_info") {
    const freeAbove = typeof rawSettings.freeShippingAbove === "number" ? rawSettings.freeShippingAbove : undefined;
    const homePrice = typeof rawSettings.homeDeliveryPrice === "number" ? rawSettings.homeDeliveryPrice : 600;
    const deskPrice = typeof rawSettings.stopDeskPrice === "number" ? rawSettings.stopDeskPrice : 400;
    return (
      <div
        onClick={isEditable ? onSelect : undefined}
        className={wrapperClass}
        style={buildSectionContainerStyle(styles, "transparent", "#17191C")}
      >
        <div className={`${widthClass} bg-white/90 border border-slate-200 p-6 text-slate-900 ${radiusClass}`}>
          <div className="flex flex-col @md:flex-row items-start @md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: accentColor }}>
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <EditorialHeading
                  as="h2"
                  text={String(rawSettings.title || "Livraison Rapide 69 Wilayas")}
                  theme={theme}
                  sectionStyles={styles}
                  onClick={(e) => handleSubElementClick("title", e)}
                  className={`text-lg @md:text-xl font-extrabold rounded px-1 ${
                    isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""
                  }`}
                />
                <p className="text-xs text-slate-600 mt-0.5">
                  Délai d'expédition habituel : <strong className="text-slate-900">{String(rawSettings.defaultTimeframe || "24h - 48h")}</strong> • Paiement à la livraison
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                Stop-Desk : dès {deskPrice.toLocaleString("fr-DZ")} DA
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                Domicile : dès {homePrice.toLocaleString("fr-DZ")} DA
              </span>
              {freeAbove && (
                <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Gratuit dès {freeAbove.toLocaleString("fr-DZ")} DA
                </span>
              )}
            </div>
          </div>
        </div>
        <SectionDividerRenderer divider={styles.divider} theme={theme} />
      </div>
    );
  }

  if (section.type === "return_policy") {
    const delayDays = typeof rawSettings.delayDays === "number" ? rawSettings.delayDays : 14;
    const feeBy = rawSettings.returnShippingFeeBy as string;
    const feeLabel = feeBy === "free" ? "Retours 100% gratuits" : feeBy === "seller" ? "Frais pris en charge par la boutique" : "Frais de retour à la charge de l'acheteur";
    return (
      <div
        onClick={isEditable ? onSelect : undefined}
        className={wrapperClass}
        style={buildSectionContainerStyle(styles, "transparent", "#17191C")}
      >
        <div className={`${widthClass} bg-white/90 border border-slate-200 p-6 text-slate-900 ${radiusClass}`}>
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: accentColor }}>
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <EditorialHeading
                  as="h2"
                  text={String(rawSettings.title || "Politique de Retours & Échanges")}
                  theme={theme}
                  sectionStyles={styles}
                  onClick={(e) => handleSubElementClick("title", e)}
                  className={`text-lg font-extrabold rounded px-1 ${
                    isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""
                  }`}
                />
                <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#EA580C] border border-orange-200 text-xs font-bold">
                  Sous {delayDays} jours • {feeLabel}
                </span>
              </div>
              <p className="text-xs @sm:text-sm text-slate-600 leading-relaxed">
                {String(rawSettings.conditions || "Échange ou remboursement garanti si l'article est retourné intact dans son emballage d'origine.")}
              </p>
            </div>
          </div>
        </div>
        <SectionDividerRenderer divider={styles.divider} theme={theme} />
      </div>
    );
  }

  if (section.type === "faq_accordion") {
    const items = Array.isArray(rawSettings.items)
      ? (rawSettings.items as Array<{ question: string; answer: string }>)
      : [];
    return (
      <div
        onClick={isEditable ? onSelect : undefined}
        className={wrapperClass}
        style={buildSectionContainerStyle(styles, "transparent", "#17191C")}
      >
        <div className={widthClass}>
          <EditorialHeading
            as="h2"
            text={String(rawSettings.title || "Questions Fréquentes")}
            theme={theme}
            sectionStyles={styles}
            onClick={(e) => handleSubElementClick("title", e)}
            className={`text-xl @md:text-2xl font-extrabold mb-5 ${alignClass} ${
              isSubActive("title") ? "ring-2 ring-[#2563EB] rounded" : ""
            }`}
          />
          <div className="space-y-2.5">
            {items.map((item, idx) => (
              <details
                key={idx}
                onClick={(e) => handleSubElementClick(`faq-${idx}`, e)}
                className={`bg-white border border-slate-200 p-4 text-slate-900 shadow-2xs ${radiusClass} ${
                  isSubActive(`faq-${idx}`) ? "ring-2 ring-[#2563EB]" : ""
                }`}
                open={idx === 0}
              >
                <summary className="font-bold text-sm cursor-pointer">{item.question}</summary>
                <p className="mt-2 text-xs @sm:text-sm text-slate-600 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
        <SectionDividerRenderer divider={styles.divider} theme={theme} />
      </div>
    );
  }

  return (
    <div
      onClick={isEditable ? onSelect : undefined}
      className={wrapperClass}
      style={buildSectionContainerStyle(styles, "#111827", "#F8FAFC")}
    >
      <div className={`${widthClass} flex flex-col @md:flex-row items-start @md:items-center justify-between gap-6`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F97316]" />
            <h3
              onClick={(e) => handleSubElementClick("title", e)}
              className={`font-extrabold text-base @md:text-lg rounded px-1 ${
                isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""
              }`}
            >
              {String(rawSettings.title || "Service Client & Contact")}
            </h3>
          </div>
          {Boolean(rawSettings.workingHours) && (
            <p className="text-xs opacity-80 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F97316]" />
              <span>{String(rawSettings.workingHours)}</span>
            </p>
          )}
          {(Boolean(rawSettings.address) || Boolean(rawSettings.wilaya)) && (
            <p className="text-xs opacity-80 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
              <span>{[rawSettings.address, rawSettings.wilaya].filter(Boolean).join(" • ")}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
          {Boolean(rawSettings.shopPhone) && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15">
              <Phone className="w-3.5 h-3.5 text-[#F97316]" />
              <span>{String(rawSettings.shopPhone)}</span>
            </span>
          )}
          {Boolean(rawSettings.shopEmail) && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15">
              <Mail className="w-3.5 h-3.5 text-[#F97316]" />
              <span>{String(rawSettings.shopEmail)}</span>
            </span>
          )}
        </div>
      </div>
      <SectionDividerRenderer divider={styles.divider} theme={theme} />
    </div>
  );
};
