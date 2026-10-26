import React from "react";
import { CustomPageSection, CustomPageTheme } from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";
import {
  buildSectionContainerStyle,
  resolveBorderRadiusClass,
  resolveContainerWidthClass,
  resolveShadowClass,
  resolveAnimationClass,
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
  Play,
  Layers,
  Award,
} from "lucide-react";
import { useStudioStore } from "../../../pages/Seller/StoreBuilder/store/useStudioStore";

interface SectionContentAndTrustProps {
  section: CustomPageSection;
  theme: CustomPageTheme;
  products?: Product[];
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const SectionContentAndTrust: React.FC<SectionContentAndTrustProps> = ({
  section,
  theme,
  products = [],
  isEditable,
  isSelected,
  onSelect,
}) => {
  const selectSection = useStudioStore((s) => s.selectSection);
  const setActiveInspectorTab = useStudioStore((s) => s.setActiveInspectorTab);
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);

  const handleSubElementClick = (subElement: string, e: React.MouseEvent) => {
    if (!isEditable) return;
    e.stopPropagation();
    onSelect?.();
    setActiveInspectorTab("content");
    selectSection(section.id, subElement);
  };

  const isSubActive = (subElement: string) =>
    isEditable && selectedSectionId === section.id && selectedSubElement === subElement;

  const styles = section.styles || {};
  const rawSettings = (section.settings || {}) as Record<string, unknown>;
  const radiusClass = resolveBorderRadiusClass(styles.borderRadius);
  const widthClass = resolveContainerWidthClass(styles.containerWidth);
  const accentColor = theme.primaryColor || "#F97316";
  const textAlign = (rawSettings.textAlignment as string) || "left";
  const alignClass =
    textAlign === "center" ? "text-center" : textAlign === "right" ? "text-right" : "text-left";

  const wrapperClass = `transition-all relative select-none ${radiusClass} ${resolveShadowClass(
    styles.shadow
  )} ${resolveAnimationClass(styles.animation)} ${
    isEditable && isSelected
      ? "ring-2 ring-[#F97316] shadow-xl z-10"
      : isEditable
      ? "hover:ring-2 hover:ring-[#F97316]/50 cursor-pointer"
      : ""
  }`;

  // 1. CURATED COLLECTIONS
  if (section.type === "curated_collections") {
    const collections = Array.isArray(rawSettings.collections)
      ? (rawSettings.collections as Array<{ id: string; title: string; imageUrl?: string; productIds?: string[] }>)
      : [];
    return (
      <div
        onClick={isEditable ? onSelect : undefined}
        className={wrapperClass}
        style={buildSectionContainerStyle(styles, "transparent", "#17191C")}
      >
        <div className={widthClass}>
          <div className={`mb-6 ${alignClass}`}>
            <h2
              onClick={(e) => handleSubElementClick("title", e)}
              className={`text-xl @md:text-2xl font-extrabold inline-block rounded px-1 ${
                isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""
              }`}
            >
              {String(rawSettings.title || section.title || "Nos Collections")}
            </h2>
          </div>
          {collections.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
              Aucune collection configurée. Ajoutez une collection depuis le panneau de droite.
            </div>
          ) : (
            <div className="grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 gap-5">
              {collections.map((col, idx) => {
                const colProducts = products.filter((p) => (col.productIds || []).includes(p.id));
                const coverImg = col.imageUrl || colProducts[0]?.image;
                return (
                  <div
                    key={col.id || idx}
                    onClick={(e) => handleSubElementClick(`collection-${idx}`, e)}
                    className={`group overflow-hidden bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all ${radiusClass} ${
                      isSubActive(`collection-${idx}`) ? "ring-2 ring-[#2563EB]" : ""
                    }`}
                  >
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                      {coverImg ? (
                        <img src={coverImg} alt={col.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#F97316] bg-orange-50">
                          <Layers className="w-8 h-8" />
                        </div>
                      )}
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                        {(col.productIds || []).length} article{(col.productIds || []).length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900">{col.title}</h3>
                      <span className="text-xs font-bold" style={{ color: accentColor }}>Explorer →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <SectionDividerRenderer divider={styles.divider} theme={theme} />
      </div>
    );
  }

  // 2. BRAND STORY
  if (section.type === "brand_story") {
    const imgPos = (rawSettings.imagePosition as string) || "left";
    return (
      <div
        onClick={isEditable ? onSelect : undefined}
        className={wrapperClass}
        style={buildSectionContainerStyle(styles, "#F9FAFB", "#17191C")}
      >
        <div className={`${widthClass} flex flex-col ${imgPos === "right" ? "@md:flex-row-reverse" : "@md:flex-row"} items-center gap-8`}>
          {Boolean(rawSettings.imageUrl) && (
            <div className="w-full @md:w-5/12 shrink-0">
              <img
                src={String(rawSettings.imageUrl)}
                alt={String(rawSettings.heading || "Histoire")}
                className={`w-full h-64 @md:h-72 object-cover shadow-md ${radiusClass}`}
              />
            </div>
          )}
          <div className={`flex-1 space-y-3 ${alignClass}`}>
            {typeof rawSettings.yearsOfExperience === "number" && rawSettings.yearsOfExperience > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-[#EA580C]">
                <Award className="w-3.5 h-3.5" />
                <span>{rawSettings.yearsOfExperience} ans de savoir-faire</span>
              </span>
            )}
            <h2
              onClick={(e) => handleSubElementClick("title", e)}
              className={`text-2xl @md:text-3xl font-extrabold rounded px-1 ${
                isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""
              }`}
              style={{ color: styles.textColor || accentColor }}
            >
              {String(rawSettings.heading || "Notre Histoire")}
            </h2>
            <p
              onClick={(e) => handleSubElementClick("subtitle", e)}
              className={`text-sm @md:text-base opacity-90 leading-relaxed whitespace-pre-line rounded px-1 ${
                isSubActive("subtitle") ? "ring-2 ring-[#2563EB]" : ""
              }`}
            >
              {String(rawSettings.bodyText || "")}
            </p>
            {Boolean(rawSettings.signature) && (
              <p className="pt-2 font-bold italic text-sm" style={{ color: accentColor }}>
                — {String(rawSettings.signature)}
              </p>
            )}
          </div>
        </div>
        <SectionDividerRenderer divider={styles.divider} theme={theme} />
      </div>
    );
  }

  // 3. SHOWCASE VIDEO
  if (section.type === "showcase_video") {
    const videoUrl = String(rawSettings.videoUrl || "");
    const posterUrl = String(rawSettings.posterUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80");
    return (
      <div
        onClick={isEditable ? onSelect : undefined}
        className={wrapperClass}
        style={buildSectionContainerStyle(styles, "transparent", "#17191C")}
      >
        <div className={widthClass}>
          {Boolean(rawSettings.title) && (
            <h2
              onClick={(e) => handleSubElementClick("title", e)}
              className={`text-xl @md:text-2xl font-extrabold mb-4 ${alignClass} ${
                isSubActive("title") ? "ring-2 ring-[#2563EB] rounded" : ""
              }`}
            >
              {String(rawSettings.title)}
            </h2>
          )}
          <div className={`relative aspect-video bg-slate-900 overflow-hidden shadow-lg ${radiusClass}`}>
            {videoUrl ? (
              <video
                src={videoUrl}
                poster={posterUrl}
                controls
                autoPlay={Boolean(rawSettings.autoplay)}
                loop={Boolean(rawSettings.loop)}
                muted={rawSettings.muted !== false}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={posterUrl} alt="Aperçu vidéo" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#F97316] flex items-center justify-center shadow-xl mb-2">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                  <span className="text-xs font-bold bg-black/60 px-3 py-1 rounded-full">
                    Ajoutez l'adresse MP4/WebM de votre vidéo dans l'onglet Contenu
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <SectionDividerRenderer divider={styles.divider} theme={theme} />
      </div>
    );
  }

  // 4. VERIFIED REVIEWS
  if (section.type === "verified_reviews") {
    const defaultReviews = [
      { author: "Amina K. (Alger)", rating: 5, comment: "Qualité remarquable et livraison rapide à domicile avec paiement à la réception." },
      { author: "Karim B. (Oran)", rating: 5, comment: "Produit fidèle aux photos, emballage très soigné. Je recommande cette boutique !" },
      { author: "Yasmine M. (Constantine)", rating: 5, comment: "Service client réactif et articles authentiques." },
    ];
    const customReviews = Array.isArray(rawSettings.customReviews) && rawSettings.customReviews.length > 0
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
              <h2
                onClick={(e) => handleSubElementClick("title", e)}
                className={`text-xl @md:text-2xl font-extrabold rounded px-1 ${
                  isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""
                }`}
              >
                {String(rawSettings.title || "Avis Clients Vérifiés")}
              </h2>
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

  // 5. DELIVERY INFO (69 WILAYAS)
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
                <h2
                  onClick={(e) => handleSubElementClick("title", e)}
                  className={`text-lg @md:text-xl font-extrabold rounded px-1 ${
                    isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""
                  }`}
                >
                  {String(rawSettings.title || "Livraison Rapide 69 Wilayas")}
                </h2>
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

  // 6. RETURN POLICY
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
                <h2
                  onClick={(e) => handleSubElementClick("title", e)}
                  className={`text-lg font-extrabold rounded px-1 ${
                    isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""
                  }`}
                >
                  {String(rawSettings.title || "Politique de Retours & Échanges")}
                </h2>
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

  // 7. FAQ ACCORDION
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
          <h2
            onClick={(e) => handleSubElementClick("title", e)}
            className={`text-xl @md:text-2xl font-extrabold mb-5 ${alignClass} ${
              isSubActive("title") ? "ring-2 ring-[#2563EB] rounded" : ""
            }`}
          >
            {String(rawSettings.title || "Questions Fréquentes")}
          </h2>
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

  // 8. CONTACT FOOTER
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

