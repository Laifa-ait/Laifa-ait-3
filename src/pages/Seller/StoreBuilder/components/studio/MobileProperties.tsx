import React from "react";
import { PropertiesInspector } from "./PropertiesInspector";
import { StudioNavMode } from "./studio.types";
import { CustomPageSection, CustomPageTheme, MediaGalleryItem, SellerStoreConfig } from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";

interface MobilePropertiesProps {
  navMode: StudioNavMode | "identity";
  selectedSection: CustomPageSection | null;
  products?: Product[];
  storeConfig?: SellerStoreConfig | null;
  mediaGallery?: MediaGalleryItem[];
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
