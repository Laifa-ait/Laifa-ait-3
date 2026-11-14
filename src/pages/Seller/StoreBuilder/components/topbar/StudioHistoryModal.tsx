import React from "react";
import { RotateCcw, X, History } from "lucide-react";
import { StoreHistoryEntry } from "../../../../../domains/seller/customPage.types";

interface StudioHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyList: StoreHistoryEntry[];
  onRollback: (versionNumber: number) => void;
}

export const StudioHistoryModal: React.FC<StudioHistoryModalProps> = ({
  isOpen,
  onClose,
  historyList,
  onRollback,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white text-slate-900 rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-testid="studio-history-modal"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-slate-700" />
            <div>
              <h3 className="text-[14px] font-semibold text-slate-900">Historique des versions</h3>
              <p className="text-[11.5px] text-slate-500">Restaurer un état publié précédemment</p>
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

        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
          {historyList.length === 0 ? (
            <p className="text-[12px] text-slate-500 text-center py-8 px-5">
              Aucune version publiée pour le moment. Publiez votre boutique pour créer un point de restauration.
            </p>
          ) : (
            historyList.map((entry) => (
              <div
                key={entry.versionNumber}
                className="px-5 py-3 flex justify-between items-center gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <span className="font-semibold text-[12.5px] text-slate-900 block tabular-nums">
                    Version {entry.versionNumber}
                  </span>
                  <span className="text-slate-500 text-[11.5px] block truncate">
                    {entry.changeSummary || "Mise à jour boutique"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onRollback(entry.versionNumber);
                    onClose();
                  }}
                  className="h-8 px-3 bg-white hover:bg-slate-900 hover:text-white rounded-lg text-[11.5px] font-medium text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurer</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[12px] rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
