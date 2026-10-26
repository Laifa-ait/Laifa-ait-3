import React, { useState, useEffect } from "react";
import {
  BannerContentPosition,
  CustomPageSection,
  HeroSubElement,
} from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { HeroSubPanelSelector } from "./HeroSubPanelSelector";
import { HeroBackgroundSubEditor } from "./HeroBackgroundSubEditor";
import { HeroTypographySubEditor } from "./HeroTypographySubEditor";
import { AlignmentMatrix3x3 } from "../controls/AlignmentMatrix3x3";
import { useStudioStore } from "../../../store/useStudioStore";

interface HeroContentEditorProps {
  sectionType?: string;
  settings: Record<string, unknown>;
  sections?: CustomPageSection[];
  products?: Product[];
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  inputClass: string;
  labelClass: string;
}

export const HeroContentEditor: React.FC<HeroContentEditorProps> = ({
  sectionType,
  settings,
  sections = [],
  products = [],
  onSettingsChange,
  inputClass,
  labelClass,
}) => {
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const storeViewport = useStudioStore((s) => s.viewport);

  const [activeSubPanel, setActiveSubPanel] = useState<HeroSubElement>("title");
  const [posDevice, setPosDevice] = useState<"desktop" | "tablet" | "mobile">(storeViewport);

  useEffect(() => {
    if (!selectedSubElement) return;
    if (selectedSubElement === "cta" || selectedSubElement === "ctaPrimary") {
      setActiveSubPanel("ctaPrimary");
    } else if (selectedSubElement === "ctaSecondary") {
      setActiveSubPanel("ctaSecondary");
    } else if (
      selectedSubElement === "background" ||
      selectedSubElement === "badge" ||
      selectedSubElement === "title" ||
      selectedSubElement === "subtitle"
    ) {
      setActiveSubPanel(selectedSubElement);
    }
  }, [selectedSubElement]);

  useEffect(() => {
    setPosDevice(storeViewport);
  }, [storeViewport]);

  if (sectionType !== "hero_banner" && sectionType !== "showcase_video") {
    return null;
  }

  if (sectionType === "showcase_video") {
    return (
      <div className="space-y-3 bg-[#F9FAFB] p-3 rounded-xl border border-[#E4E7EC]">
        <label className={labelClass}>
          <span>Titre de la vidéo</span>
          <input
            type="text"
            value={typeof settings.title === "string" ? settings.title : ""}
            onChange={(e) => onSettingsChange("title", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          <span>URL de la vidéo (MP4 / WebM)</span>
          <input
            type="url"
            value={typeof settings.videoUrl === "string" ? settings.videoUrl : ""}
            onChange={(e) => onSettingsChange("videoUrl", e.target.value)}
            placeholder="https://..."
            className={`${inputClass} font-mono text-xs`}
          />
        </label>
      </div>
    );
  }

  const contentPosition = settings.contentPosition as BannerContentPosition | undefined;
  const textAlignment = (settings.textAlignment as "left" | "center" | "right") || "center";
  const verticalAlignment = (settings.verticalAlignment as "top" | "center" | "bottom") || "center";

  return (
    <div className="space-y-4">
      {/* Sub-element selector tab bar */}
      <HeroSubPanelSelector
        activeSubPanel={activeSubPanel}
        onSelectSubPanel={(panel) => setActiveSubPanel(panel)}
      />

      {/* 3x3 Alignment Matrix for Banner Text & Buttons */}
      <AlignmentMatrix3x3
        value={contentPosition}
        horizontalFallback={textAlignment}
        verticalFallback={verticalAlignment}
        label="Position du bloc texte & boutons"
        onChange={(pos, h, v) =>
          onSettingsChange({
            contentPosition: pos,
            textAlignment: h,
            verticalAlignment: v,
          })
        }
      />

      {/* Background Sub-Editor */}
      {activeSubPanel === "background" ? (
        <HeroBackgroundSubEditor
          settings={settings}
          onSettingsChange={(f, v) => onSettingsChange(f, v)}
          inputClass={inputClass}
          labelClass={labelClass}
          posDevice={posDevice}
          setPosDevice={setPosDevice}
        />
      ) : (
        /* Typography / CTA Sub-Editor */
        <HeroTypographySubEditor
          activeSubPanel={activeSubPanel}
          settings={settings}
          sections={sections}
          products={products}
          onSettingsChange={(f, v) => onSettingsChange(f, v)}
          inputClass={inputClass}
          labelClass={labelClass}
        />
      )}
    </div>
  );
};
