import React from "react";
import { StoreSettingsInspectorPanel } from "../context/StoreSettingsInspectorPanel";
import { SellerStoreConfig } from "../../../../../domains/seller/customPage.types";

interface StoreSettingsWorkspaceProps {
  storeConfig?: SellerStoreConfig | null;
  onSaveConfig: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
}

export const StoreSettingsWorkspace: React.FC<StoreSettingsWorkspaceProps> = ({
  storeConfig,
  onSaveConfig,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-y-auto">
      <StoreSettingsInspectorPanel
        storeConfig={storeConfig ?? null}
        onSaveConfig={onSaveConfig}
      />
    </div>
  );
};

