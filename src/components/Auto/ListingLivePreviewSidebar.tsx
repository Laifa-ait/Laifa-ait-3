import React from "react";
import { Eye } from "lucide-react";
import { VehicleCatalogItemDto } from "../../domains/auto/auto.types";
import { VehicleCard } from "./VehicleCard";

export interface ListingLivePreviewSidebarProps {
  step: 1 | 2 | 3;
  previewVehicle: VehicleCatalogItemDto;
  onSyncAndPreview: () => void;
}

export const ListingLivePreviewSidebar: React.FC<ListingLivePreviewSidebarProps> = ({
  step,
  previewVehicle,
  onSyncAndPreview,
}) => {
  return (
    <div className="lg:col-span-4 space-y-4 sticky top-24">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Aperçu de votre annonce
          </span>
          <span className="text-[11px] font-bold text-blue-600">
            Étape {step}/3
          </span>
        </div>

        <VehicleCard vehicle={previewVehicle} />

        <button
          type="button"
          onClick={onSyncAndPreview}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-xs"
        >
          <Eye className="w-4 h-4 text-sky-400" />
          <span>Prévisualiser la fiche complète</span>
        </button>
      </div>
    </div>
  );
};
