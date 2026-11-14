import React from "react";
import { AlertCircle, AlertTriangle, Loader2, UploadCloud, X } from "lucide-react";
import { PublishReadinessReport } from "../../utils/publishReadinessChecks";
import { StudioNavMode } from "../studio/studio.types";

interface StudioDirectPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  changeSummary: string;
  setChangeSummary: (v: string) => void;
  onConfirm: () => void;
  isPublishing?: boolean;
  publishError?: string | null;
  readinessReport?: PublishReadinessReport;
  onNavigateToFix?: (targetNav: StudioNavMode) => void;
}

export const StudioDirectPublishModal: React.FC<StudioDirectPublishModalProps> = ({
  isOpen,
  onClose,
  changeSummary,
  setChangeSummary,
  onConfirm,
  isPublishing = false,
  publishError = null,
  readinessReport,
  onNavigateToFix,
}) => {
  if (!isOpen) return null;

  const hasBlockers = Boolean(readinessReport && readinessReport.blockers.length > 0);
  const warnings = readinessReport?.warnings || [];
  const blockers = readinessReport?.blockers || [];

  const handleSafeClose = () => {
    if (!isPublishing) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      onClick={handleSafeClose}
    >
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
            disabled={isPublishing}
            onClick={handleSafeClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-[12.5px] text-slate-600 leading-relaxed">
            Vos sections, thèmes et réglages seront immédiatement visibles par vos clients.
          </p>

          {blockers.length > 0 && (
            <div className="space-y-1.5" data-testid="publish-blockers-list">
              {blockers.map((issue) => (
                <div
                  key={issue.id}
                  role="alert"
                  className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11.5px] text-rose-800 flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                    <span>{issue.message}</span>
                  </div>
                  {issue.targetNav && onNavigateToFix && (
                    <button
                      type="button"
                      onClick={() => {
                        handleSafeClose();
                        onNavigateToFix(issue.targetNav!);
                      }}
                      className="text-[11px] font-semibold underline shrink-0 cursor-pointer"
                    >
                      Corriger
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="space-y-1.5" data-testid="publish-warnings-list">
              {warnings.map((issue) => (
                <div
                  key={issue.id}
                  className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11.5px] text-amber-900 flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span>{issue.message}</span>
                  </div>
                  {issue.targetNav && onNavigateToFix && (
                    <button
                      type="button"
                      onClick={() => {
                        handleSafeClose();
                        onNavigateToFix(issue.targetNav!);
                      }}
                      className="text-[11px] font-semibold underline shrink-0 cursor-pointer"
                    >
                      Compléter
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="publish-note-input" className="text-[12px] font-medium text-slate-700 block">
              Note de version (optionnelle)
            </label>
            <textarea
              id="publish-note-input"
              disabled={isPublishing}
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Ex : Nouvelle bannière d'ouverture, rayons mis à jour..."
              className="w-full text-[12.5px] p-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 disabled:bg-slate-50 transition-colors resize-none"
              rows={3}
            />
          </div>

          {publishError && (
            <div
              role="alert"
              data-testid="publish-modal-error"
              className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11.5px] font-medium text-rose-700 flex items-start gap-1.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{publishError}</span>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={isPublishing}
            onClick={handleSafeClose}
            className="h-9 px-3.5 bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-50 text-slate-700 text-[12px] font-medium rounded-lg transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isPublishing || hasBlockers}
            data-testid="confirm-publish-btn"
            onClick={onConfirm}
            className="h-9 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-[12px] font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>Publication en cours...</span>
              </>
            ) : (
              <span>{publishError ? "Réessayer la publication" : "Confirmer la publication"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

