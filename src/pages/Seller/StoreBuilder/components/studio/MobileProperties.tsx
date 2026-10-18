import React from "react";
import { PropertiesInspector } from "./PropertiesInspector";
import { StudioNavMode } from "../SectionTreePanel";
import { CustomPageSection, CustomPageTheme, SellerStoreConfig } from "../../../../../domains/seller/customPage.types";

interface MobilePropertiesProps {
  navMode: StudioNavMode | "identity";
  selectedSection: CustomPageSection | null;
  products?: unknown[];
  storeConfig?: SellerStoreConfig | null;
  mediaGallery?: unknown[];
  onUpdateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  onSaveTheme: (theme: CustomPageTheme) => Promise<void>;
  onThemeChangeLive: (theme: CustomPageTheme) => void;
  onSaveConfig: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
}

export const MobileProperties: React.FC<MobilePropertiesProps> = (props) => {
  return (
    <div className="w-full h-full bg-[#FFFFFF] flex flex-col overflow-y-auto">
      <PropertiesInspector {...props} />
    </div>
  );
};
