import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { CustomPageSection } from "../../../../../domains/seller/customPage.types";

interface DeleteSectionModalProps {
  section: CustomPageSection | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteSectionModal: React.FC<DeleteSectionModalProps> = ({
  section,
  onClose,
  onConfirm,
}) => {
  if (!section) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFFFF] rounded-[12px] border border-[#E5E7EB] shadow-xl max-w-md w-full p-6 space-y-4 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-center text-[#DC2626]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-[16px] font-bold text-[#17191C]">
              Supprimer la section
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#667085] hover:text-[#17191C] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-[14px] text-[#344054]">
          <p>
            Êtes-vous sûr de vouloir supprimer la section{" "}
            <span className="font-bold text-[#17191C]">
              « {section.title || section.type} »
            </span>{" "}
            de votre page ?
          </p>
          <p className="text-[13px] text-[#667085] bg-[#F7F8FA] p-3 rounded-[8px] border border-[#E5E7EB]">
            ⚠️ Cette action est définitive. Tous les réglages de contenu et de style de ce bloc seront effacés.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] px-4 rounded-[8px] border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#17191C] text-[13px] font-semibold cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(section.id);
              onClose();
            }}
            className="h-[40px] px-4 rounded-[8px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-semibold cursor-pointer shadow-xs"
          >
            Confirmer la suppression
          </button>
        </div>
      </div>
    </div>
  );
};
