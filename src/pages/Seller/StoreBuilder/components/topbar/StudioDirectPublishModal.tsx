import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Layers, Loader2, PackageCheck, UploadCloud, X } from "lucide-react";
import { PublishCheckIssue, PublishReadinessReport } from "../../utils/publishReadinessChecks";
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
  onSelectSectionToFix?: (sectionId: string) => void;
}

export const StudioDirectPublishModal: React.FC<StudioDirectPublishModalProps> = ({
  isOpen, onClose, changeSummary, setChangeSummary, onConfirm,
  isPublishing = false, publishError = null, readinessReport, onNavigateToFix, onSelectSectionToFix,
}) => {
  if (!isOpen) return null;

  const hasBlockers = Boolean(readinessReport && readinessReport.blockers.length > 0);
  const warnings = readinessReport?.warnings || [];
  const blockers = readinessReport?.blockers || [];
  const summary = readinessReport?.summary;

  const handleSafeClose = () => {
    if (!isPublishing) onClose();
  };

  const handleFixIssue = (issue: PublishCheckIssue) => {
    if (isPublishing) return;
    handleSafeClose();
    if (issue.targetSectionId) {
      if (onSelectSectionToFix) onSelectSectionToFix(issue.targetSectionId);
      else window.dispatchEvent(new CustomEvent("studio:open-inspector-tab", { detail: { sectionId: issue.targetSectionId, tab: "content" } }));
      return;
    }
    if (issue.targetNav) {
      if (onNavigateToFix) onNavigateToFix(issue.targetNav);
      else window.dispatchEvent(new CustomEvent("studio:select-nav-mode", { detail: { mode: issue.targetNav } }));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={handleSafeClose}>
      <div
        className="bg-white text-slate-900 rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        data-testid="studio-publish-modal"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-4 h-4 text-slate-700" />
            <div>
              <h3 className="text-[14px] font-semibold text-slate-900">Contrôle &amp; Mise en ligne</h3>
              <p className="text-[11.5px] text-slate-500">Vérification avant déploiement sur la boutique publique</p>
            </div>
          </div>
          <button
            type="button" disabled={isPublishing} onClick={handleSafeClose} aria-label="Fermer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto">
          {summary && (
            <div data-testid="publish-summary-card" className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-[11.5px]">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-slate-600" /><span>Résumé de la publication</span></span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10.5px] tabular-nums">
                  Cible v{summary.nextVersionNumber}{typeof summary.draftRevision === "number" ? ` • rév. #${summary.draftRevision}` : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong className="text-slate-900">{summary.visibleSectionCount}</strong> section(s) active(s){summary.hiddenSectionCount > 0 ? ` (${summary.hiddenSectionCount} masquée)` : ""}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PackageCheck className={`w-3.5 h-3.5 shrink-0 ${summary.catalogVerified ? "text-emerald-600" : "text-amber-600"}`} />
                  <span>{summary.catalogVerified ? `${summary.activeProductCount} produit(s) actif(s)` : summary.catalogStatus === "error" ? "Catalogue non vérifié" : "Chargement catalogue..."}</span>
                </div>
              </div>
              {summary.hasUnsavedChanges && (
                <p className="text-[11px] text-slate-500 border-t border-slate-200/80 pt-1.5">
                  Vos dernières modifications de brouillon seront enregistrées et validées sur le serveur avant la publication.
                </p>
              )}
            </div>
          )}

          {blockers.length > 0 && (
            <div className="space-y-1.5" data-testid="publish-blockers-list">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">Blocages à corriger ({blockers.length})</span>
              {blockers.map((issue) => (
                <div key={issue.id} role="alert" className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11.5px] text-rose-800 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5"><AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" /><span>{issue.message}</span></div>
                  {(issue.targetNav || issue.targetSectionId) && (
                    <button type="button" data-testid={`publish-fix-${issue.id}`} onClick={() => handleFixIssue(issue)} className="text-[11px] font-semibold underline shrink-0 cursor-pointer">
                      {issue.actionLabel || "Corriger"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="space-y-1.5" data-testid="publish-warnings-list">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">Recommandations ({warnings.length})</span>
              {warnings.map((issue) => (
                <div key={issue.id} className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11.5px] text-amber-900 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" /><span>{issue.message}</span></div>
                  {(issue.targetNav || issue.targetSectionId) && (
                    <button type="button" data-testid={`publish-warn-fix-${issue.id}`} onClick={() => handleFixIssue(issue)} className="text-[11px] font-semibold underline shrink-0 cursor-pointer">
                      {issue.actionLabel || "Compléter"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="publish-note-input" className="text-[12px] font-medium text-slate-700 block">Note de version (optionnelle)</label>
            <textarea
              id="publish-note-input" disabled={isPublishing} value={changeSummary} onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Ex : Nouvelle bannière d'ouverture, rayons mis à jour..." rows={2}
              className="w-full text-[12.5px] p-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 disabled:bg-slate-50 transition-colors resize-none"
            />
          </div>

          {publishError && (
            <div role="alert" data-testid="publish-modal-error" className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11.5px] font-medium text-rose-700 flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{publishError}</span>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
          <button type="button" disabled={isPublishing} onClick={handleSafeClose} className="h-9 px-3.5 bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-50 text-slate-700 text-[12px] font-medium rounded-lg transition-colors cursor-pointer">
            Annuler
          </button>
          <button
            type="button" disabled={isPublishing || hasBlockers} data-testid="confirm-publish-btn" onClick={onConfirm}
            className="h-9 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-[12px] font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isPublishing ? (<><Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /><span>Publication en cours...</span></>) : (<span>{publishError ? "Réessayer la publication" : "Confirmer la publication"}</span>)}
          </button>
        </div>
      </div>
    </div>
  );
};
