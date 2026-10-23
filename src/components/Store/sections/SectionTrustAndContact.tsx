import React from "react";
import { CustomPageSection, CustomPageTheme } from "../../../domains/seller/customPage.types";
import { readableTextColor } from "./themeColorUtils";

interface SectionTrustAndContactProps {
  section: CustomPageSection;
  theme: CustomPageTheme;
  maxWidth: string;
  headingClass: string;
  headingStyle: React.CSSProperties;
  wrapperClass: string;
  sectionStyle: React.CSSProperties;
  isEditable?: boolean;
  onSelect?: () => void;
}

export const SectionTrustAndContact: React.FC<SectionTrustAndContactProps> = ({
  section,
  theme,
  maxWidth,
  headingClass,
  headingStyle,
  wrapperClass,
  sectionStyle,
  isEditable,
  onSelect,
}) => {
  const settings = (section.settings || {}) as Record<string, unknown>;

  if (section.type === "delivery_info") {
    const tariffs = Array.isArray(settings.customTariffs)
      ? (settings.customTariffs as Array<Record<string, unknown>>)
      : [];
    return (
      <section onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={sectionStyle}>
        <div
          className={`${maxWidth} rounded-2xl border border-black/5 p-6 text-center md:p-8`}
          style={{ backgroundColor: theme.surfaceColor || "#FFFFFF", borderRadius: `${theme.borderRadiusPx ?? 16}px` }}
        >
          <span
            className="mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${theme.accentColor || theme.primaryColor}20`, color: theme.primaryColor }}
          >
            Livraison
          </span>
          <h2 className={headingClass} style={headingStyle}>
            {String(settings.title || "Livraison partout en Algérie")}
          </h2>
          <p className="text-sm opacity-75">
            Délai habituel : <strong>{String(settings.defaultTimeframe || "24 h à 72 h")}</strong>
          </p>
          {typeof settings.freeShippingAbove === "number" && (
            <p className="mt-3 text-sm font-semibold">
              Livraison offerte à partir de {settings.freeShippingAbove.toLocaleString("fr-DZ")} DZD
            </p>
          )}
          {tariffs.length > 0 && (
            <div className="mt-5 grid gap-2 text-left sm:grid-cols-2 lg:grid-cols-3">
              {tariffs.map((tariff, index) => (
                <div key={index} className="rounded-xl border border-black/5 bg-white/70 p-3 text-sm">
                  <p className="font-semibold">{String(tariff.wilayaName || "Wilaya")}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {String(tariff.estimatedDays || "Délai à confirmer")} ·{" "}
                    {typeof tariff.priceDZD === "number"
                      ? `${tariff.priceDZD.toLocaleString("fr-DZ")} DZD`
                      : "Tarif à confirmer"}
                  </p>
                  <p className="mt-1 text-xs opacity-70">
                    {tariff.homeDeliveryAvailable === false ? "Retrait en point relais" : "Livraison à domicile"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (section.type === "return_policy") {
    const feeText =
      settings.returnShippingFeeBy === "free"
        ? "Les frais de retour sont offerts."
        : settings.returnShippingFeeBy === "seller"
          ? "Les frais de retour sont à la charge de la boutique."
          : "Les frais de retour sont à la charge du client.";
    return (
      <section onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={sectionStyle}>
        <div
          className={`${maxWidth} rounded-2xl border border-black/5 p-6`}
          style={{ backgroundColor: theme.surfaceColor || "#FFFFFF", borderRadius: `${theme.borderRadiusPx ?? 16}px` }}
        >
          <h2 className={headingClass} style={headingStyle}>
            {String(settings.title || "Retours et échanges")}
          </h2>
          <p className="text-sm leading-relaxed" style={{ fontSize: `${theme.bodyFontSizePx ?? 16}px` }}>
            {String(settings.conditions || "Les conditions de retour seront précisées par la boutique.")}
          </p>
          <p className="mt-3 text-sm opacity-75">
            Demande à effectuer sous {String(settings.delayDays || 14)} jours. {feeText}
          </p>
        </div>
      </section>
    );
  }

  if (section.type === "verified_reviews") {
    return (
      <section onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={sectionStyle}>
        <div
          className={`${maxWidth} rounded-2xl border border-black/5 p-6 text-center`}
          style={{ backgroundColor: theme.surfaceColor || "#FFFFFF", borderRadius: `${theme.borderRadiusPx ?? 16}px` }}
        >
          <h2 className={headingClass} style={headingStyle}>
            {String(settings.title || "Avis de nos clients")}
          </h2>
          <p className="text-sm opacity-70">Les avis vérifiés de vos clients apparaîtront ici après leurs achats.</p>
        </div>
      </section>
    );
  }

  if (section.type === "faq_accordion") {
    const items = Array.isArray(settings.items) ? (settings.items as Array<Record<string, unknown>>) : [];
    return (
      <section onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={sectionStyle}>
        <div className={`${maxWidth} max-w-3xl`}>
          <h2 className={`${headingClass} text-center`} style={headingStyle}>
            {String(settings.title || "Questions fréquentes")}
          </h2>
          <div className="space-y-3">
            {items.map((item, index) => (
              <details
                key={index}
                className="border border-black/5 p-4"
                style={{
                  borderRadius: `${theme.borderRadiusPx ?? 12}px`,
                  backgroundColor: theme.surfaceColor || "#FFFFFF",
                  color: readableTextColor(theme.surfaceColor),
                }}
              >
                <summary className="cursor-pointer font-semibold">{String(item.question || "Question")}</summary>
                <p className="mt-2 text-sm leading-relaxed opacity-75">{String(item.answer || "")}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "contact_footer") {
    const socialLinks: Array<[string, string]> = [
      ["Instagram", typeof settings.socialInstagram === "string" ? settings.socialInstagram : ""],
      ["Facebook", typeof settings.socialFacebook === "string" ? settings.socialFacebook : ""],
      ["TikTok", typeof settings.socialTiktok === "string" ? settings.socialTiktok : ""],
    ].filter(([, value]) => Boolean(value));
    return (
      <section onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={sectionStyle}>
        <div
          className={`${maxWidth} flex flex-col gap-5 border-t border-black/10 pt-6 sm:flex-row sm:items-start sm:justify-between`}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: theme.primaryColor }}>
              Contact boutique
            </h2>
            {typeof settings.address === "string" && settings.address && (
              <p className="mt-1 text-sm">{settings.address}</p>
            )}
            {typeof settings.wilaya === "string" && settings.wilaya && <p className="text-sm">{settings.wilaya}</p>}
            {typeof settings.workingHours === "string" && settings.workingHours && (
              <p className="mt-2 text-sm opacity-70">{settings.workingHours}</p>
            )}
          </div>
          <div className="text-sm sm:text-right">
            {typeof settings.shopPhone === "string" && settings.shopPhone && (
              <p>
                <a href={`tel:${settings.shopPhone}`} className="font-semibold">
                  {settings.shopPhone}
                </a>
              </p>
            )}
            {typeof settings.shopEmail === "string" && settings.shopEmail && (
              <p>
                <a href={`mailto:${settings.shopEmail}`}>{settings.shopEmail}</a>
              </p>
            )}
            <div className="mt-2 flex gap-3 sm:justify-end">
              {socialLinks.map(([label, value]) => (
                <span key={label} className="font-medium" style={{ color: theme.primaryColor }}>
                  {label}: {String(value)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
};
