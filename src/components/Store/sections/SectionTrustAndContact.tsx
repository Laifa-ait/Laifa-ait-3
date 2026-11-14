import React from "react";
import { CustomPageSection, CustomPageTheme } from "../../../domains/seller/customPage.types";
import {
  buildSectionContainerStyle,
  resolveBorderRadiusClass,
  resolveContainerWidthClass,
  resolveShadowClass,
  SectionDividerRenderer,
} from "./sectionStyleHelper";
import { Truck, ShieldCheck, RotateCcw, Star, Phone, Mail, MapPin, Clock } from "lucide-react";
import { EditorialHeading } from "../EditorialHeading";
import { CanvasInlineText } from "./CanvasInlineText";

interface SectionTrustAndContactProps {
  section: CustomPageSection;
  theme: CustomPageTheme;
  wrapperClass: string;
  isEditable?: boolean;
  onSelect?: () => void;
  isSubActive: (subElement: string) => boolean;
  handleSubElementClick: (subElement: string, e: React.MouseEvent) => void;
}

const DEFAULT_REVIEWS = [
  { author: "Amina K. (Alger)", rating: 5, comment: "Qualité remarquable et livraison rapide à domicile avec paiement à la réception." },
  { author: "Karim B. (Oran)", rating: 5, comment: "Produit fidèle aux photos, emballage très soigné. Je recommande cette boutique !" },
  { author: "Yasmine M. (Constantine)", rating: 5, comment: "Service client réactif et articles authentiques." },
];

export const SectionTrustAndContact: React.FC<SectionTrustAndContactProps> = ({
  section, theme, wrapperClass, isEditable, onSelect, isSubActive, handleSubElementClick,
}) => {
  const styles = section.styles || {};
  const rawSettings = (section.settings || {}) as Record<string, unknown>;
  const radiusClass = `${resolveBorderRadiusClass(styles.borderRadius)} ${resolveShadowClass(styles.cardShadow)}`;
  const widthClass = resolveContainerWidthClass(styles.containerWidth);
  const accentColor = styles.iconColor || styles.buttonBgColor || theme.accentColor || theme.primaryColor || "var(--store-primary, #B45309)";
  const headingColor = styles.headingColor || styles.textColor || theme.secondaryColor || "var(--store-secondary, #18181B)";
  const subtitleColor = styles.subtitleColor || styles.textColor || theme.mutedTextColor;
  const cardBgColor = styles.cardBgColor || theme.surfaceColor || "var(--store-surface, #FFFFFF)";
  const cardTextColor = styles.cardTextColor || styles.textColor || theme.secondaryColor || "var(--store-secondary, #0F172A)";
  const cardBorderColor = styles.cardBorderColor || theme.borderColor || "#E4E7EC";
  const priceColor = styles.priceColor || theme.priceColor || accentColor;
  const badgeBgColor = styles.badgeBgColor || theme.accentBadgeColor || accentColor;
  const badgeTextColor = styles.badgeTextColor || theme.badgeTextColor || "#FFFFFF";
  const textAlign = (rawSettings.textAlignment as string) || "left";
  const alignClass = textAlign === "center" ? "text-center" : textAlign === "right" ? "text-right" : "text-left";
  const containerStyle = buildSectionContainerStyle(styles, "transparent", "var(--store-secondary, #17191C)", theme);

  if (section.type === "verified_reviews") {
    const customReviews =
      Array.isArray(rawSettings.customReviews) && rawSettings.customReviews.length > 0
        ? (rawSettings.customReviews as Array<{ author: string; rating: number; comment: string }>)
        : DEFAULT_REVIEWS;
    const limit = typeof rawSettings.maxReviews === "number" ? rawSettings.maxReviews : 3;

    return (
      <div onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={containerStyle}>
        <div className={widthClass}>
          <div className={`mb-6 flex flex-col @sm:flex-row @sm:items-center justify-between gap-2 ${alignClass}`}>
            <div>
              <EditorialHeading
                as="h2" text={String(rawSettings.title || "Avis Clients Vérifiés")} theme={theme} sectionStyles={styles}
                accentColorOverride={styles.kickerColor || accentColor}
                isEditable={isEditable} editConfig={{ sectionId: section.id, settingKey: "title", alsoUpdateSectionTitle: true }}
                onClick={(e) => handleSubElementClick("title", e)}
                style={{ color: headingColor }}
                className={`text-xl @md:text-2xl font-extrabold rounded px-1 ${isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""}`}
              />
              {Boolean(rawSettings.subtitle) && <p className="text-xs opacity-80 mt-1" style={{ color: subtitleColor }}>{String(rawSettings.subtitle)}</p>}
            </div>
            <div
              data-testid="reviews-trust-badge"
              style={{ backgroundColor: styles.badgeBgColor || "#FFFBEB", color: styles.badgeTextColor || "#92400E", borderColor: styles.cardBorderColor || "#FDE68A" }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold self-start"
            >
              <Star className="w-4 h-4 fill-current" style={{ color: styles.iconColor || "#F59E0B" }} />
              <span>4.9 / 5 • Achats Vérifiés Olmart</span>
            </div>
          </div>
          <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
            {customReviews.slice(0, limit).map((rev, i) => (
              <div
                key={i} onClick={(e) => handleSubElementClick(`review-${i}`, e)}
                style={{ backgroundColor: cardBgColor, color: cardTextColor, borderColor: cardBorderColor }}
                className={`p-4 border shadow-2xs space-y-2 ${radiusClass} ${
                  isSubActive(`review-${i}`) ? "ring-2 ring-[#2563EB]" : ""
                }`}
              >
                <div className="flex items-center gap-0.5" style={{ color: styles.iconColor || "#F59E0B" }}>
                  {Array.from({ length: rev.rating || 5 }).map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs @sm:text-sm leading-relaxed opacity-90" style={{ color: cardTextColor }}>« {rev.comment} »</p>
                <div className="pt-2 border-t flex items-center justify-between text-xs font-bold" style={{ borderColor: cardBorderColor, color: cardTextColor }}>
                  <span>{rev.author}</span>
                  <span className="text-[10px] font-semibold" style={{ color: styles.iconColor || "#059669" }}>✓ Vérifié</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <SectionDividerRenderer divider={styles.divider} color={styles.dividerColor} theme={theme} />
      </div>
    );
  }

  if (section.type === "delivery_info") {
    const freeAbove = typeof rawSettings.freeShippingAbove === "number" ? rawSettings.freeShippingAbove : undefined;
    const homePrice = typeof rawSettings.homeDeliveryPrice === "number" ? rawSettings.homeDeliveryPrice : 600;
    const deskPrice = typeof rawSettings.stopDeskPrice === "number" ? rawSettings.stopDeskPrice : 400;
    const tariffs = Array.isArray(rawSettings.customTariffs)
      ? (rawSettings.customTariffs as Array<{ wilayaName: string; estimatedDays: string; priceDZD: number }>)
      : [];
    return (
      <div onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={containerStyle}>
        <div
          style={{ backgroundColor: cardBgColor, color: cardTextColor, borderColor: cardBorderColor }}
          className={`${widthClass} border p-6 space-y-4 ${radiusClass}`}
        >
          <div className="flex flex-col @md:flex-row items-start @md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: accentColor }}>
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <EditorialHeading as="h2" text={String(rawSettings.title || "Livraison Rapide 69 Wilayas")} theme={theme} sectionStyles={styles} accentColorOverride={styles.kickerColor || accentColor} isEditable={isEditable} editConfig={{ sectionId: section.id, settingKey: "title", alsoUpdateSectionTitle: true }} onClick={(e) => handleSubElementClick("title", e)} style={{ color: headingColor }} className={`text-lg @md:text-xl font-extrabold rounded px-1 ${isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""}`} />
                <p className="text-xs opacity-80 mt-0.5" style={{ color: subtitleColor }} onClick={(e) => handleSubElementClick("tarifs", e)}>
                  Délai d&apos;expédition indicatif : <strong>{String(rawSettings.defaultTimeframe || "24h - 48h")}</strong> • Paiement à la livraison
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2" onClick={(e) => handleSubElementClick("tarifs", e)}>
              <span style={{ backgroundColor: styles.badgeBgColor || "#F1F5F9", color: styles.badgeTextColor || cardTextColor }} className="px-3 py-1.5 rounded-lg text-xs font-bold">
                Stop-Desk : dès {deskPrice.toLocaleString("fr-DZ")} DA
              </span>
              <span style={{ backgroundColor: styles.badgeBgColor || "#F1F5F9", color: styles.badgeTextColor || cardTextColor }} className="px-3 py-1.5 rounded-lg text-xs font-bold">
                Domicile : dès {homePrice.toLocaleString("fr-DZ")} DA
              </span>
              {freeAbove && (
                <span style={{ backgroundColor: badgeBgColor, color: badgeTextColor }} className="px-3 py-1.5 rounded-lg text-xs font-bold">
                  Gratuit dès {freeAbove.toLocaleString("fr-DZ")} DA
                </span>
              )}
            </div>
          </div>
          {tariffs.length > 0 && (
            <div className="grid grid-cols-1 @sm:grid-cols-3 gap-2 pt-3 border-t" style={{ borderColor: cardBorderColor }} onClick={(e) => handleSubElementClick("tarifs", e)}>
              {tariffs.map((t, idx) => (
                <div key={idx} style={{ borderColor: cardBorderColor }} className="px-3 py-2 rounded-lg bg-black/[0.02] border flex items-center justify-between text-xs">
                  <span className="font-semibold truncate" style={{ color: cardTextColor }}>{t.wilayaName} ({t.estimatedDays})</span>
                  <span className="font-extrabold shrink-0 ml-2" style={{ color: priceColor }}>{Number(t.priceDZD || 0).toLocaleString("fr-DZ")} DA</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <SectionDividerRenderer divider={styles.divider} color={styles.dividerColor} theme={theme} />
      </div>
    );
  }

  if (section.type === "return_policy") {
    const delayDays = typeof rawSettings.delayDays === "number" ? rawSettings.delayDays : 14;
    const feeBy = rawSettings.returnShippingFeeBy as string;
    const feeLabel = feeBy === "free" ? "Frais pris en charge selon conditions" : feeBy === "seller" ? "Frais pris en charge par la boutique" : "Frais de retour à la charge de l'acheteur";
    return (
      <div onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={containerStyle}>
        <div
          style={{ backgroundColor: cardBgColor, color: cardTextColor, borderColor: cardBorderColor }}
          className={`${widthClass} border p-6 ${radiusClass}`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: accentColor }}>
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <EditorialHeading
                  as="h2" text={String(rawSettings.title || "Conditions de Retours & Échanges")} theme={theme} sectionStyles={styles}
                  accentColorOverride={styles.kickerColor || accentColor}
                  isEditable={isEditable} editConfig={{ sectionId: section.id, settingKey: "title", alsoUpdateSectionTitle: true }}
                  onClick={(e) => handleSubElementClick("title", e)}
                  style={{ color: headingColor }}
                  className={`text-lg font-extrabold rounded px-1 ${isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""}`}
                />
                <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: styles.badgeBgColor || `${accentColor}18`, color: styles.badgeTextColor || accentColor }}>
                  Délai {delayDays} jours • {feeLabel}
                </span>
              </div>
              <CanvasInlineText
                as="p"
                multiline
                value={String(rawSettings.conditions || "Les demandes d'échange ou de retour sont traitées selon les conditions définies par le vendeur à réception du colis.")}
                isEditable={isEditable}
                editConfig={{ sectionId: section.id, settingKey: "conditions", subElement: "conditions" }}
                onClick={(e) => handleSubElementClick("conditions", e)}
                style={{ color: subtitleColor || cardTextColor }}
                className="text-xs @sm:text-sm opacity-85 leading-relaxed"
              />
            </div>
          </div>
        </div>
        <SectionDividerRenderer divider={styles.divider} color={styles.dividerColor} theme={theme} />
      </div>
    );
  }

  if (section.type === "faq_accordion") {
    const items = Array.isArray(rawSettings.items) ? (rawSettings.items as Array<{ question: string; answer: string }>) : [];
    return (
      <div onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={containerStyle}>
        <div className={widthClass}>
          <EditorialHeading
            as="h2" text={String(rawSettings.title || "Questions Fréquentes")} theme={theme} sectionStyles={styles}
            accentColorOverride={styles.kickerColor || accentColor}
            isEditable={isEditable} editConfig={{ sectionId: section.id, settingKey: "title", alsoUpdateSectionTitle: true }}
            onClick={(e) => handleSubElementClick("title", e)}
            style={{ color: headingColor }}
            className={`text-xl @md:text-2xl font-extrabold mb-5 ${alignClass} ${isSubActive("title") ? "ring-2 ring-[#2563EB] rounded" : ""}`}
          />
          <div className="space-y-2.5">
            {items.map((item, idx) => (
              <details
                key={idx} onClick={(e) => handleSubElementClick(`faq-${idx}`, e)} open={idx === 0}
                style={{ backgroundColor: cardBgColor, color: cardTextColor, borderColor: cardBorderColor }}
                className={`border p-4 shadow-2xs ${radiusClass} ${
                  isSubActive(`faq-${idx}`) ? "ring-2 ring-[#2563EB]" : ""
                }`}
              >
                <summary className="font-bold text-sm cursor-pointer" style={{ color: cardTextColor }}>{item.question}</summary>
                <p className="mt-2 text-xs @sm:text-sm opacity-85 leading-relaxed" style={{ color: subtitleColor || cardTextColor }}>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
        <SectionDividerRenderer divider={styles.divider} color={styles.dividerColor} theme={theme} />
      </div>
    );
  }

  return (
    <div onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={buildSectionContainerStyle(styles, "var(--store-secondary, #111827)", "#F8FAFC", theme)}>
      <div className={`${widthClass} flex flex-col @md:flex-row items-start @md:items-center justify-between gap-6`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" style={{ color: accentColor }} />
            <CanvasInlineText as="h3" value={String(rawSettings.title || "Service Client & Contact")} isEditable={isEditable} editConfig={{ sectionId: section.id, settingKey: "title", alsoUpdateSectionTitle: true }} onClick={(e) => handleSubElementClick("title", e)} style={{ fontFamily: "var(--store-font-heading, inherit)", color: styles.headingColor || styles.textColor || "#F8FAFC" }} className={`font-extrabold text-base @md:text-lg rounded px-1 ${isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""}`} />
          </div>
          {Boolean(rawSettings.workingHours) && (
            <p className="text-xs opacity-85 flex items-center gap-1.5" style={{ color: styles.subtitleColor }} onClick={(e) => handleSubElementClick("coordonnees", e)}>
              <Clock className="w-3.5 h-3.5" style={{ color: accentColor }} /><span>{String(rawSettings.workingHours)}</span>
            </p>
          )}
          {(Boolean(rawSettings.address) || Boolean(rawSettings.wilaya)) && (
            <p className="text-xs opacity-85 flex items-center gap-1.5" style={{ color: styles.subtitleColor }} onClick={(e) => handleSubElementClick("coordonnees", e)}>
              <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} /><span>{[rawSettings.address, rawSettings.wilaya].filter(Boolean).join(" • ")}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold" onClick={(e) => handleSubElementClick("coordonnees", e)}>
          {Boolean(rawSettings.shopPhone) && (
            <span style={{ backgroundColor: styles.cardBgColor || "rgba(255,255,255,0.1)", color: styles.cardTextColor || "#FFFFFF", borderColor: styles.cardBorderColor || "rgba(255,255,255,0.15)" }} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border">
              <Phone className="w-3.5 h-3.5" style={{ color: accentColor }} /><span>{String(rawSettings.shopPhone)}</span>
            </span>
          )}
          {Boolean(rawSettings.shopEmail) && (
            <span style={{ backgroundColor: styles.cardBgColor || "rgba(255,255,255,0.1)", color: styles.cardTextColor || "#FFFFFF", borderColor: styles.cardBorderColor || "rgba(255,255,255,0.15)" }} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border">
              <Mail className="w-3.5 h-3.5" style={{ color: accentColor }} /><span>{String(rawSettings.shopEmail)}</span>
            </span>
          )}
        </div>
      </div>
      <SectionDividerRenderer divider={styles.divider} color={styles.dividerColor} theme={theme} />
    </div>
  );
};
