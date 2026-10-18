import React from "react";
import { SectionTreePanel as StudioSectionTreePanel } from "./studio/SectionTreePanel";
import { CustomPageSection, CustomPageSectionType } from "../../../../domains/seller/customPage.types";

export type StudioNavMode = "sections" | "pages" | "theme" | "media" | "settings";

interface LegacySectionTreePanelProps {
  navMode?: StudioNavMode;
  onSelectNavMode?: (mode: StudioNavMode) => void;
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

export const SectionTreePanel: React.FC<LegacySectionTreePanelProps> = (props) => {
  return <StudioSectionTreePanel {...props} />;
};
