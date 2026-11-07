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
import { Play, Layers, Award } from "lucide-react";
import { useStudioStore } from "../../../pages/Seller/StoreBuilder/store/useStudioStore";
import { ArtisticFrameWrapper } from "../ArtisticFrameWrapper";
import { EditorialHeading, EditorialDropCapParagraph } from "../EditorialHeading";
import { SectionTrustAndContact } from "./SectionTrustAndContact";

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

  const isSubActive = (subElement: string): boolean =>
    Boolean(isEditable && selectedSectionId === section.id && selectedSubElement === subElement);

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
            <EditorialHeading
              as="h2"
              text={String(rawSettings.title || section.title || "Nos Collections")}
              theme={theme}
              sectionStyles={styles}
              onClick={(e) => handleSubElementClick("title", e)}
              className={`text-xl @md:text-2xl font-extrabold inline-block rounded px-1 ${
                isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""
              }`}
            />
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
                    className={`group transition-all ${
                      isSubActive(`collection-${idx}`) ? "ring-2 ring-[#2563EB] rounded-2xl" : ""
                    }`}
                  >
                    <ArtisticFrameWrapper
                      shape={styles.frameShape}
                      theme={theme}
                      caption={col.title}
                      fallbackRadiusClass={radiusClass}
                      className="bg-white border border-slate-200 shadow-xs hover:shadow-md overflow-hidden"
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
                    </ArtisticFrameWrapper>
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
              <ArtisticFrameWrapper
                shape={styles.frameShape}
                theme={theme}
                caption={String(rawSettings.signature || rawSettings.heading || "Notre Atelier")}
                fallbackRadiusClass={radiusClass}
                className="shadow-md"
              >
                <img
                  src={String(rawSettings.imageUrl)}
                  alt={String(rawSettings.heading || "Histoire")}
                  className="w-full h-64 @md:h-72 object-cover"
                />
              </ArtisticFrameWrapper>
            </div>
          )}
          <div className={`flex-1 space-y-3 ${alignClass}`}>
            {typeof rawSettings.yearsOfExperience === "number" && rawSettings.yearsOfExperience > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-[#EA580C]">
                <Award className="w-3.5 h-3.5" />
                <span>{rawSettings.yearsOfExperience} ans de savoir-faire</span>
              </span>
            )}
            <EditorialHeading
              as="h2"
              text={String(rawSettings.heading || "Notre Histoire")}
              theme={theme}
              sectionStyles={styles}
              onClick={(e) => handleSubElementClick("title", e)}
              className={`text-2xl @md:text-3xl font-extrabold rounded px-1 ${
                isSubActive("title") ? "ring-2 ring-[#2563EB]" : ""
              }`}
              style={{ color: styles.textColor || accentColor }}
            />
            <EditorialDropCapParagraph
              text={String(rawSettings.bodyText || "")}
              dropCap={Boolean(rawSettings.dropCap)}
              accentColor={accentColor}
              onClick={(e) => handleSubElementClick("subtitle", e)}
              className={`text-sm @md:text-base opacity-90 leading-relaxed whitespace-pre-line rounded px-1 ${
                isSubActive("subtitle") ? "ring-2 ring-[#2563EB]" : ""
              }`}
            />
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
            <EditorialHeading
              as="h2"
              text={String(rawSettings.title)}
              theme={theme}
              sectionStyles={styles}
              onClick={(e) => handleSubElementClick("title", e)}
              className={`text-xl @md:text-2xl font-extrabold mb-4 ${alignClass} ${
                isSubActive("title") ? "ring-2 ring-[#2563EB] rounded" : ""
              }`}
            />
          )}
          <ArtisticFrameWrapper
            shape={styles.frameShape}
            theme={theme}
            caption={String(rawSettings.title || "En Coulisses")}
            fallbackRadiusClass={radiusClass}
            className="shadow-lg"
          >
            <div className="relative aspect-video bg-slate-900 overflow-hidden">
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
          </ArtisticFrameWrapper>
        </div>
        <SectionDividerRenderer divider={styles.divider} theme={theme} />
      </div>
    );
  }

  return (
    <SectionTrustAndContact
      section={section}
      theme={theme}
      wrapperClass={wrapperClass}
      isEditable={isEditable}
      onSelect={onSelect}
      isSubActive={isSubActive}
      handleSubElementClick={handleSubElementClick}
    />
  );
};
