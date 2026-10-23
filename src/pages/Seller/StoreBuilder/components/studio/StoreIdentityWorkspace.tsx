import React from "react";
import { StoreIdentityEditor } from "../identity/StoreIdentityEditor";
import { SellerStoreConfig } from "../../../../../domains/seller/customPage.types";

interface StoreIdentityWorkspaceProps {
  storeConfig?: SellerStoreConfig | null;
  onSaveConfig: (updatedConfig: Partial<SellerStoreConfig>) => Promise<void>;
}

export const StoreIdentityWorkspace: React.FC<StoreIdentityWorkspaceProps> = ({
  storeConfig,
  onSaveConfig,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] p-4 overflow-y-auto">
      <StoreIdentityEditor
        storeConfig={storeConfig}
        onSave={onSaveConfig}
      />
    </div>
  );
};

