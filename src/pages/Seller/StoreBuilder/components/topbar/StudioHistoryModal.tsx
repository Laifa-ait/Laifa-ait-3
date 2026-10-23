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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Historique des versions</h3>
              <p className="text-[11px] text-slate-500">Restaurer un état publié précédemment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {historyList.map((entry) => (
            <div
              key={entry.versionNumber}
              className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex justify-between items-center text-xs hover:border-slate-300 transition-all"
            >
              <div>
                <span className="font-bold text-orange-600 block">Version #{entry.versionNumber}</span>
                <span className="text-slate-600 text-[11px]">{entry.changeSummary || "Mise à jour standard"}</span>
              </div>
              <button
                onClick={() => {
                  onRollback(entry.versionNumber);
                  onClose();
                }}
                className="px-3 py-1.5 bg-white hover:bg-orange-500 hover:text-white rounded-xl font-bold text-slate-700 border border-slate-200 shadow-xs transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurer</span>
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
