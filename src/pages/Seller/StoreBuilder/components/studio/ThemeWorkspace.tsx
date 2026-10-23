import React from "react";
import { ThemeInspectorPanel } from "../context/ThemeInspectorPanel";
import { CustomPageTheme, SellerStoreConfig } from "../../../../../domains/seller/customPage.types";

interface ThemeWorkspaceProps {
  storeConfig?: SellerStoreConfig | null;
  onSaveTheme: (theme: CustomPageTheme) => Promise<void>;
  onThemeChangeLive: (theme: CustomPageTheme) => void;
}

export const ThemeWorkspace: React.FC<ThemeWorkspaceProps> = ({
  storeConfig,
  onSaveTheme,
  onThemeChangeLive,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-y-auto">
      <ThemeInspectorPanel
        storeConfig={storeConfig}
        onSaveTheme={onSaveTheme}
        onThemeChangeLive={onThemeChangeLive}
      />
    </div>
  );
};

