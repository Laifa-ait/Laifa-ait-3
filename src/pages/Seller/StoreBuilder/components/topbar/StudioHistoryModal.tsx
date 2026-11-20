import React, { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, History, Loader2, RotateCcw, X } from "lucide-react";
import { StoreHistoryEntry } from "../../../../../domains/seller/customPage.types";

interface StudioHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyList: StoreHistoryEntry[];
  currentPublishedVersion?: number;
  draftSectionCount?: number;
  hasUnsavedChanges?: boolean;
  onRollback: (versionNumber: number) => boolean | void | Promise<boolean | void>;
}

function formatHistoryDate(isoString?: string): string {
  if (!isoString) return "Date inconnue";
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return isoString;
  return parsed.toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export const StudioHistoryModal: React.FC<StudioHistoryModalProps> = ({
  isOpen, onClose, historyList, currentPublishedVersion, draftSectionCount, hasUnsavedChanges = false, onRollback,
}) => {
  const [confirmingVersion, setConfirmingVersion] = useState<number | null>(null);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);
  const [rollbackError, setRollbackError] = useState<string | null>(null);

  const sortedHistory = useMemo(
    () => [...historyList].sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0)),
    [historyList]
  );

  if (!isOpen) return null;

  const isBusy = restoringVersion !== null;

  const handleSafeClose = () => {
    if (isBusy) return;
    setConfirmingVersion(null);
    setRollbackError(null);
    onClose();
  };

  const handleConfirmRollback = async (versionNumber: number) => {
    if (isBusy) return;
    setRollbackError(null);
    setRestoringVersion(versionNumber);
    try {
      const outcome = await onRollback(versionNumber);
      if (outcome === false) {
        setRollbackError(`La restauration de la version v${versionNumber} a échoué. Vérifiez les conflits ou votre connexion.`);
        return;
      }
      setConfirmingVersion(null);
      onClose();
    } catch (err: unknown) {
      setRollbackError(err instanceof Error ? err.message : "Échec de la restauration de cette version.");
    } finally {
      setRestoringVersion(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={handleSafeClose}>
      <div
        className="bg-white text-slate-900 rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
        data-testid="studio-history-modal"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-slate-700" />
            <div>
              <h3 className="text-[14px] font-semibold text-slate-900">Historique des versions publiées</h3>
              <p className="text-[11.5px] text-slate-500">Comparer, inspecter et restaurer une version précédente dans votre brouillon</p>
            </div>
          </div>
          <button
            type="button" disabled={isBusy} onClick={handleSafeClose} aria-label="Fermer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {typeof draftSectionCount === "number" && (
          <div data-testid="history-draft-vs-published-banner" className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11.5px] text-slate-600 shrink-0">
            <span>Brouillon actuel : <strong className="text-slate-900">{draftSectionCount} section(s)</strong>{hasUnsavedChanges ? " • Modifications locales en cours" : " • Synchronisé"}</span>
            {typeof currentPublishedVersion === "number" && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> En ligne : v{currentPublishedVersion}</span>
            )}
          </div>
        )}

        {rollbackError && (
          <div role="alert" data-testid="history-rollback-error" className="mx-5 mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11.5px] font-medium text-rose-700 flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{rollbackError}</span>
          </div>
        )}

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {sortedHistory.length === 0 ? (
            <p className="text-[12px] text-slate-500 text-center py-8 px-5">
              Aucune version publiée pour le moment. Publiez votre boutique pour créer un point de restauration.
            </p>
          ) : (
            sortedHistory.map((entry) => {
              const secList = entry.snapshot?.sections || [];
              const isCurrentLive = currentPublishedVersion === entry.versionNumber;
              const isConfirming = confirmingVersion === entry.versionNumber;
              const isExpanded = expandedVersion === entry.versionNumber;
              const isRestoringThis = restoringVersion === entry.versionNumber;

              return (
                <div key={entry.versionNumber} data-testid={`history-version-card-${entry.versionNumber}`} className="px-5 py-3.5 space-y-2 hover:bg-slate-50/80 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[12.5px] text-slate-900 tabular-nums">Version v{entry.versionNumber}</span>
                        {isCurrentLive && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">En ligne</span>
                        )}
                        <span className="text-[11px] text-slate-400">{formatHistoryDate(entry.publishedAt)} • {secList.length} section(s)</span>
                      </div>
                      <span className="text-slate-600 text-[11.5px] block truncate">{entry.changeSummary || "Mise à jour boutique"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {secList.length > 0 && (
                        <button
                          type="button" data-testid={`history-preview-toggle-${entry.versionNumber}`}
                          onClick={() => setExpandedVersion(isExpanded ? null : entry.versionNumber)}
                          className="h-8 px-2.5 bg-white hover:bg-slate-100 rounded-lg text-[11px] font-medium text-slate-600 border border-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /><span>{isExpanded ? "Masquer" : "Aperçu"}</span>
                        </button>
                      )}
                      {!isConfirming ? (
                        <button
                          type="button" disabled={isBusy} data-testid={`history-restore-btn-${entry.versionNumber}`}
                          onClick={() => { setRollbackError(null); setConfirmingVersion(entry.versionNumber); }}
                          className="h-8 px-3 bg-white hover:bg-slate-900 hover:text-white disabled:opacity-40 rounded-lg text-[11.5px] font-medium text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" /><span>Restaurer</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button" disabled={isBusy} data-testid={`history-confirm-restore-${entry.versionNumber}`}
                            onClick={() => void handleConfirmRollback(entry.versionNumber)}
                            className="h-8 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            {isRestoringThis ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            <span>Confirmer v{entry.versionNumber}</span>
                          </button>
                          <button type="button" disabled={isBusy} onClick={() => setConfirmingVersion(null)} className="h-8 px-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] cursor-pointer">
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isConfirming && (
                    <p data-testid={`history-confirm-notice-${entry.versionNumber}`} className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      Votre brouillon actuel sera conservé dans l&apos;historique Annuler (Ctrl+Z) puis remplacé par les {secList.length} section(s) de la version v{entry.versionNumber}.
                    </p>
                  )}

                  {isExpanded && secList.length > 0 && (
                    <div data-testid={`history-sections-preview-${entry.versionNumber}`} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-600">
                      {secList.map((sec, idx) => (
                        <div key={sec.id || idx} className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">{idx + 1}. {sec.title || sec.type}</span>
                          <span className="text-[10px] text-slate-400">{sec.type} {sec.isVisible === false ? "(masquée)" : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
          <button type="button" disabled={isBusy} onClick={handleSafeClose} className="h-8 px-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[12px] rounded-lg transition-colors cursor-pointer">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
