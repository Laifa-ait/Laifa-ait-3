import React from "react";
import { createPortal } from "react-dom";
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

  const modalContent = (
    <div
      data-testid="delete-section-modal"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-[var(--studio-border)] shadow-xl max-w-md w-full p-6 space-y-4 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-[16px] font-bold text-[var(--studio-black)]">
              Supprimer la section
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la confirmation"
            className="p-1 text-[var(--studio-muted)] hover:text-[var(--studio-black)] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-[14px] text-[var(--studio-text)]">
          <p>
            Êtes-vous sûr de vouloir supprimer la section{" "}
            <span className="font-bold text-[var(--studio-black)]">
              « {section.title || section.type} »
            </span>{" "}
            de votre page ?
          </p>
          <p className="text-[13px] text-[var(--studio-muted)] bg-[var(--studio-surface-subtle)] p-3 rounded-lg border border-[var(--studio-border)]">
            Les réglages de contenu et de style de ce bloc seront retirés de la page. Vous pourrez toutefois annuler cette action via le bouton Annuler (Ctrl+Z).
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            data-testid="cancel-delete-section-btn"
            onClick={onClose}
            className="h-[40px] px-4 rounded-lg border border-[var(--studio-border)] bg-white hover:bg-[var(--studio-surface-subtle)] text-[var(--studio-black)] text-[13px] font-semibold cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            data-testid="confirm-delete-section-btn"
            onClick={() => {
              onConfirm(section.id);
              onClose();
            }}
            className="h-[40px] px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold cursor-pointer shadow-xs"
          >
            Confirmer la suppression
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined" && document.body) {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
