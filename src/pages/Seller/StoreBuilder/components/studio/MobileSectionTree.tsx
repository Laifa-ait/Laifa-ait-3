import React from "react";
import { SectionTreePanel } from "./SectionTreePanel";
import { CustomPageSection, CustomPageSectionType } from "../../../../../domains/seller/customPage.types";

interface MobileSectionTreeProps {
  sections: CustomPageSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onAddSection: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
}

export const MobileSectionTree: React.FC<MobileSectionTreeProps> = ({
  sections,
  selectedSectionId,
  onSelectSection,
  onReorder,
  onToggleVisibility,
  onDeleteSection,
  onAddSection,
}) => {
  return (
    <div className="w-full h-full bg-[#FFFFFF] flex flex-col overflow-hidden">
      <SectionTreePanel
        sections={sections}
        selectedSectionId={selectedSectionId}
        onSelectSection={onSelectSection}
        onReorder={onReorder}
        onToggleVisibility={onToggleVisibility}
        onDeleteSection={onDeleteSection}
        onAddSection={onAddSection}
      />
    </div>
  );
};
