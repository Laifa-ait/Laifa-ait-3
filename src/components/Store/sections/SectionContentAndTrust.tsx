import React from "react";
import { CustomPageSection, CustomPageTheme } from "../../../domains/seller/customPage.types";
import { Product } from "../../../domains/product/product.types";
import {
  buildSectionContainerStyle, resolveBorderRadiusClass, resolveContainerWidthClass,
  resolveShadowClass, resolveAnimationClass, resolveSectionImageFilterCss,
  resolveSectionButtonInlineStyle, SectionDividerRenderer,
} from "./sectionStyleHelper";
import { ELEGANT_HERO_FALLBACK_IMG } from "./hero/HeroMinimalTextAndGuides";
import { Play, Award } from "lucide-react";
import { useStudioStore } from "../../../pages/Seller/StoreBuilder/store/useStudioStore";
import { ArtisticFrameWrapper } from "../ArtisticFrameWrapper";
import { EditorialHeading, EditorialDropCapParagraph } from "../EditorialHeading";
import { SectionTrustAndContact } from "./SectionTrustAndContact";
import { handleSmartLinkClick, safeNavigationHref } from "./safeNavigationHref";
import { doesProductMatchCategoryFilter, isCatalogProductPubliclyActive } from "../../../domains/seller/studioCatalogResolver";

interface SectionContentAndTrustProps {
  section: CustomPageSection;
  theme: CustomPageTheme;
  products?: Product[];
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

function handleImgFallback(e: React.SyntheticEvent<HTMLImageElement>): void {
  if (e.currentTarget.dataset.fb) return;
  e.currentTarget.dataset.fb = "1";
  e.currentTarget.src = ELEGANT_HERO_FALLBACK_IMG;
}

export const SectionContentAndTrust: React.FC<SectionContentAndTrustProps> = ({
  section, theme, products = [], isEditable, isSelected, onSelect,
}) => {
  const [failedVideoUrl, setFailedVideoUrl] = React.useState<string | null>(null);
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

  const isSubActive = (subElement: string): boolean =>
    Boolean(isEditable && selectedSectionId === section.id && selectedSubElement === subElement);

  const styles = section.styles || {};
  const rawSettings = (section.settings || {}) as Record<string, unknown>;
  const radiusClass = resolveBorderRadiusClass(styles.borderRadius);
  const cardShadowClass = resolveShadowClass(styles.cardShadow || "sm");
  const widthClass = resolveContainerWidthClass(styles.containerWidth);
  const accentColor = styles.iconColor || styles.buttonBgColor || theme.primaryColor || "var(--store-primary, #0F172A)";
  const headingColor = styles.headingColor || styles.textColor || theme.secondaryColor || "var(--store-secondary, #0F172A)";
  const subtitleColor = styles.subtitleColor || styles.textColor || theme.mutedTextColor;
  const cardBgColor = styles.cardBgColor || theme.surfaceColor || "var(--store-surface, #FFFFFF)";
  const cardTextColor = styles.cardTextColor || styles.textColor || theme.secondaryColor || "var(--store-secondary, #0F172A)";
  const cardBorderColor = styles.cardBorderColor || theme.borderColor || "#E2E8F0";
  const badgeBgColor = styles.badgeBgColor || theme.accentBadgeColor || accentColor;
  const badgeTextColor = styles.badgeTextColor || theme.badgeTextColor || "#FFFFFF";
  const textAlign = (rawSettings.textAlignment as string) || "left";
  const alignClass = textAlign === "center" ? "text-center" : textAlign === "right" ? "text-end" : "text-start";
  const imgFilterCss = resolveSectionImageFilterCss(styles, rawSettings);
  const btnInlineStyle = resolveSectionButtonInlineStyle(styles, theme, rawSettings);

  const wrapperClass = `transition-all relative select-none ${radiusClass} ${resolveShadowClass(styles.shadow)} ${resolveAnimationClass(styles.animation)} ${
    isEditable && isSelected ? "ring-2 ring-[var(--store-primary,#0F172A)] shadow-xl z-10"
    : isEditable ? "hover:ring-2 hover:ring-[var(--store-primary,#0F172A)]/50 cursor-pointer" : ""
  }`;

  if (section.type === "curated_collections") {
    const collections = Array.isArray(rawSettings.collections)
      ? (rawSettings.collections as Array<{ id: string; title: string; imageUrl?: string; productIds?: string[]; categoryFilter?: string }>) : [];
    const ctaText = typeof rawSettings.ctaText === "string" && rawSettings.ctaText.trim() ? rawSettings.ctaText : "Explorer →";
    const activeCatalog = products.filter(isCatalogProductPubliclyActive);
    return (
      <div onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={buildSectionContainerStyle(styles, "transparent", "var(--store-secondary, #17191C)", theme)}>
        <div className={widthClass}>
          <div className={`mb-6 ${alignClass}`}>
            <EditorialHeading
              as="h2" text={String(rawSettings.title || section.title || "Nos Collections")} theme={theme}
              sectionStyles={styles} accentColorOverride={styles.kickerColor || accentColor} isEditable={isEditable}
              editConfig={{ sectionId: section.id, settingKey: "title", alsoUpdateSectionTitle: true }}
              onClick={(e) => handleSubElementClick("title", e)} style={{ color: headingColor }}
              className={`text-xl @md:text-2xl font-extrabold inline-block rounded px-1 break-words ${isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""}`}
            />
          </div>
          {collections.length === 0 ? (
            <div data-testid="curated-collections-empty-state" className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
              Aucune collection configurée. Ajoutez une collection depuis le panneau de droite.
            </div>
          ) : (
            <div className="grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 gap-5">
              {collections.map((col, idx) => {
                const catFilter = col.categoryFilter?.trim();
                const colProducts = catFilter
                  ? activeCatalog.filter((p) => doesProductMatchCategoryFilter(p, catFilter))
                  : activeCatalog.filter((p) => (col.productIds || []).includes(p.id));
                const articleCount = colProducts.length;
                const coverImg = col.imageUrl || colProducts[0]?.image || ELEGANT_HERO_FALLBACK_IMG;
                const handleCardClick = (e: React.MouseEvent) => {
                  if (isEditable) { handleSubElementClick(`collection-${idx}`, e); return; }
                  e.stopPropagation();
                  const slug = col.id || `collection-${idx}`;
                  window.dispatchEvent(new CustomEvent("studio:navigate-page", {
                    detail: { viewMode: "category", categorySlug: slug, categoryItem: { id: slug, name: col.title, slug, productIds: colProducts.map((p) => p.id) } },
                  }));
                };
                return (
                  <div key={col.id || idx} data-testid={`curated-collection-card-${idx}`} onClick={handleCardClick} className={`group cursor-pointer transition-all ${isSubActive(`collection-${idx}`) ? "ring-2 ring-[#2563EB] rounded-2xl" : ""}`}>
                    <ArtisticFrameWrapper shape={styles.frameShape} theme={theme} caption={col.title} fallbackRadiusClass={radiusClass} className={`border ${cardShadowClass} hover:shadow-md overflow-hidden`} style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
                      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                        <img src={coverImg} alt={col.title} style={{ filter: imgFilterCss }} onError={handleImgFallback} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span data-testid={`collection-badge-${idx}`} style={{ backgroundColor: styles.badgeBgColor || "rgba(15,23,42,0.82)", color: badgeTextColor }} className="absolute top-3 end-3 px-2.5 py-0.5 rounded-sm text-[10px] font-bold tracking-wider tabular-nums">
                          {articleCount} article{articleCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="p-4 flex items-center justify-between gap-2" style={{ backgroundColor: cardBgColor }}>
                        <h3 data-testid={`collection-card-title-${idx}`} className="font-bold text-sm break-words min-w-0" style={{ color: cardTextColor }}>{col.title}</h3>
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0" style={btnInlineStyle}>{ctaText}</span>
                      </div>
                    </ArtisticFrameWrapper>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <SectionDividerRenderer divider={styles.divider} color={styles.dividerColor} theme={theme} />
      </div>
    );
  }

  if (section.type === "brand_story") {
    const imgPos = (rawSettings.imagePosition as string) || "left";
    const safeBrandHref = safeNavigationHref(String(rawSettings.ctaLink || "#catalog")) || "#catalog";
    return (
      <div onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={buildSectionContainerStyle(styles, "var(--store-surface, #F9FAFB)", "var(--store-secondary, #17191C)", theme)}>
        <div className={`${widthClass} flex flex-col ${imgPos === "right" ? "@md:flex-row-reverse" : "@md:flex-row"} items-center gap-8`}>
          {Boolean(rawSettings.imageUrl) && (
            <div className="w-full @md:w-5/12 shrink-0" onClick={(e) => handleSubElementClick("background", e)}>
              <ArtisticFrameWrapper shape={styles.frameShape} theme={theme} caption={String(rawSettings.signature || rawSettings.heading || "Notre Studio")} fallbackRadiusClass={radiusClass} className={cardShadowClass} style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
                <img src={String(rawSettings.imageUrl)} alt={String(rawSettings.heading || "Histoire")} style={{ filter: imgFilterCss }} onError={handleImgFallback} className="w-full h-64 @md:h-72 object-cover" />
              </ArtisticFrameWrapper>
            </div>
          )}
          <div className={`flex-1 min-w-0 space-y-3 ${alignClass}`}>
            {typeof rawSettings.yearsOfExperience === "number" && rawSettings.yearsOfExperience > 0 && (
              <span data-testid="brand-story-badge" onClick={(e) => handleSubElementClick("badge", e)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider tabular-nums" style={{ backgroundColor: styles.badgeBgColor || `${accentColor}14`, color: styles.badgeTextColor || accentColor }}>
                <Award className="w-3.5 h-3.5" style={{ color: styles.iconColor || styles.badgeTextColor || accentColor }} />
                <span>{rawSettings.yearsOfExperience} ans de savoir-faire</span>
              </span>
            )}
            <EditorialHeading
              as="h2" text={String(rawSettings.heading || "Notre Histoire")} theme={theme} sectionStyles={styles}
              accentColorOverride={styles.kickerColor || accentColor} isEditable={isEditable}
              editConfig={{ sectionId: section.id, settingKey: "heading", alsoUpdateSectionTitle: true }}
              onClick={(e) => handleSubElementClick("title", e)} style={{ color: headingColor }}
              className={`text-2xl @md:text-3xl font-extrabold rounded px-1 break-words ${isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""}`}
            />
            <EditorialDropCapParagraph
              text={String(rawSettings.bodyText || "")} dropCap={Boolean(rawSettings.dropCap)}
              accentColor={styles.kickerColor || accentColor} theme={theme} isEditable={isEditable}
              editConfig={{ sectionId: section.id, settingKey: "bodyText", subElement: "subtitle" }}
              onClick={(e) => handleSubElementClick("subtitle", e)} style={{ color: subtitleColor }}
              className={`text-sm @md:text-base opacity-90 leading-relaxed whitespace-pre-line rounded px-1 break-words ${isSubActive("subtitle") ? "ring-2 ring-[#2563EB]" : ""}`}
            />
            {Boolean(rawSettings.signature) && (
              <p className="pt-2 font-bold italic text-sm break-words" style={{ color: styles.kickerColor || accentColor }}>— {String(rawSettings.signature)}</p>
            )}
            {Boolean(rawSettings.ctaText) && (
              <div className="pt-2">
                <a
                  href={isEditable ? undefined : safeBrandHref} data-testid="brand-story-cta"
                  onClick={(e) => {
                    if (isEditable) { e.preventDefault(); handleSubElementClick("cta", e); return; }
                    handleSmartLinkClick(safeBrandHref, e, String(rawSettings.heading || "Notre Histoire"));
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer" style={btnInlineStyle}
                >
                  {String(rawSettings.ctaText)}
                </a>
              </div>
            )}
          </div>
        </div>
        <SectionDividerRenderer divider={styles.divider} color={styles.dividerColor} theme={theme} />
      </div>
    );
  }

  if (section.type === "showcase_video") {
    const videoUrl = String(rawSettings.videoUrl || "").trim();
    const isVideoBroken = Boolean(videoUrl && failedVideoUrl === videoUrl);
    const posterUrl = String(rawSettings.coverImageUrl || rawSettings.posterUrl || ELEGANT_HERO_FALLBACK_IMG);
    const isAutoplay = Boolean(rawSettings.autoplay);
    return (
      <div onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={buildSectionContainerStyle(styles, "transparent", "var(--store-secondary, #17191C)", theme)}>
        <div className={widthClass}>
          {Boolean(rawSettings.title) && (
            <EditorialHeading
              as="h2" text={String(rawSettings.title)} theme={theme} sectionStyles={styles}
              accentColorOverride={styles.kickerColor || accentColor} isEditable={isEditable}
              editConfig={{ sectionId: section.id, settingKey: "title", alsoUpdateSectionTitle: true }}
              onClick={(e) => handleSubElementClick("title", e)} style={{ color: headingColor }}
              className={`text-xl @md:text-2xl font-extrabold mb-4 break-words ${alignClass} ${isSubActive("title") ? "ring-2 ring-[#2563EB] rounded" : ""}`}
            />
          )}
          <ArtisticFrameWrapper shape={styles.frameShape} theme={theme} caption={String(rawSettings.title || "En Coulisses")} fallbackRadiusClass={radiusClass} className={cardShadowClass} style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
            <div className="relative aspect-video bg-slate-900 overflow-hidden" style={{ backgroundColor: styles.overlayColor || "#090D16" }} onClick={(e) => handleSubElementClick("background", e)}>
              {videoUrl && !isVideoBroken ? (
                <video
                  src={videoUrl} poster={posterUrl} controls autoPlay={isAutoplay}
                  loop={Boolean(rawSettings.loop)} muted={isAutoplay || rawSettings.muted !== false}
                  onError={() => setFailedVideoUrl(videoUrl)} style={{ filter: imgFilterCss }} className="w-full h-full object-cover"
                />
              ) : (
                <div data-testid="showcase-video-fallback" className="relative w-full h-full flex items-center justify-center">
                  <img src={posterUrl} alt="Aperçu vidéo" style={{ filter: imgFilterCss }} onError={handleImgFallback} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl mb-2" style={btnInlineStyle}>
                      <Play className="w-6 h-6 fill-current ms-0.5" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: badgeBgColor, color: badgeTextColor }}>
                      {isVideoBroken ? "Impossible de charger la vidéo — vérifiez l'adresse MP4/WebM dans l'inspecteur" : "Ajoutez l'adresse MP4/WebM de votre vidéo dans l'onglet Contenu"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ArtisticFrameWrapper>
        </div>
        <SectionDividerRenderer divider={styles.divider} color={styles.dividerColor} theme={theme} />
      </div>
    );
  }

  return (
    <SectionTrustAndContact
      section={section} theme={theme} wrapperClass={wrapperClass}
      isEditable={isEditable} onSelect={onSelect} isSubActive={isSubActive} handleSubElementClick={handleSubElementClick}
    />
  );
};
