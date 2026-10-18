import React from "react";
import { X, Send } from "lucide-react";

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Mettre à jour la boutique en ligne</h3>
              <p className="text-[11px] text-slate-500">Déployer les modifications récentes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Vos modifications de sections, couleurs et typographies seront immédiatement synchronisées sur votre vitrine publique.
        </p>
        <textarea
          value={changeSummary}
          onChange={(e) => setChangeSummary(e.target.value)}
          placeholder="Note de version optionnelle (ex: Nouveaux arrivages, nouvelle bannière)..."
          className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all"
          rows={3}
        />
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
          >
            Confirmer la mise en ligne
          </button>
        </div>
      </div>
    </div>
  );
};
