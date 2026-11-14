import React from "react";
import { X, UploadCloud } from "lucide-react";

interface StudioDirectPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  changeSummary: string;
  setChangeSummary: (v: string) => void;
  onConfirm: () => void;
}

export const StudioDirectPublishModal: React.FC<StudioDirectPublishModalProps> = ({
  isOpen,
  onClose,
  changeSummary,
  setChangeSummary,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white text-slate-900 rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-testid="studio-publish-modal"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-4 h-4 text-slate-700" />
            <div>
              <h3 className="text-[14px] font-semibold text-slate-900">Mettre en ligne</h3>
              <p className="text-[11.5px] text-slate-500">Déployer la version actuelle sur votre vitrine publique</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-[12.5px] text-slate-600 leading-relaxed">
            Vos sections, thèmes et réglages seront immédiatement visibles par vos clients.
          </p>
          <div className="space-y-1.5">
            <label htmlFor="publish-note-input" className="text-[12px] font-medium text-slate-700 block">
              Note de version (optionnelle)
            </label>
            <textarea
              id="publish-note-input"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Ex : Nouvelle bannière d'ouverture, rayons mis à jour..."
              className="w-full text-[12.5px] p-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-colors resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[12px] font-medium rounded-lg transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            data-testid="confirm-publish-btn"
            onClick={onConfirm}
            className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Confirmer la publication
          </button>
        </div>
      </div>
    </div>
  );
};
