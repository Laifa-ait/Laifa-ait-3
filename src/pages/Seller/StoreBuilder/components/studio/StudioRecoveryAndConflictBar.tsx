import React, { useState } from "react";
import { AlertTriangle, History, RefreshCw, ShieldAlert, UploadCloud, X } from "lucide-react";
import { SaveStatus } from "../../hooks/useStudioSaveManager";
import { StudioLocalBackupData } from "../../hooks/studioBackupStorage";

interface StudioRecoveryAndConflictBarProps {
  saveStatus: SaveStatus;
  lastSaveError?: string | null;
  recoverableBackup?: StudioLocalBackupData | null;
  localSectionCount?: number;
  serverRevision?: number;
  onRestoreBackup?: () => void;
  onDismissBackup?: () => void;
  onReloadServerVersion?: () => void | Promise<void>;
  onForceOverwriteDraft?: () => unknown | Promise<unknown>;
  onRetrySave?: () => void | Promise<unknown>;
}

export const StudioRecoveryAndConflictBar: React.FC<StudioRecoveryAndConflictBarProps> = ({
  saveStatus,
  lastSaveError,
  recoverableBackup,
  localSectionCount,
  serverRevision,
  onRestoreBackup,
  onDismissBackup,
  onReloadServerVersion,
  onForceOverwriteDraft,
  onRetrySave,
}) => {
  const [isResolving, setIsResolving] = useState(false);
  const [confirmingOverwrite, setConfirmingOverwrite] = useState(false);

  if (saveStatus === "conflict") {
    const handleReload = async () => {
      if (!onReloadServerVersion || isResolving) return;
      setIsResolving(true);
      setConfirmingOverwrite(false);
      try {
        await onReloadServerVersion();
      } finally {
        setIsResolving(false);
      }
    };

    const handleConfirmForceOverwrite = async () => {
      if (!onForceOverwriteDraft || isResolving) return;
      setIsResolving(true);
      try {
        await onForceOverwriteDraft();
        setConfirmingOverwrite(false);
      } finally {
        setIsResolving(false);
      }
    };

    return (
      <div
        role="alert"
        data-testid="studio-conflict-banner"
        className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex flex-col gap-2 text-xs text-amber-950"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              Conflit de version : cette boutique a été modifiée sur un autre onglet ou appareil.
              {typeof localSectionCount === "number" ? ` (Brouillon local : ${localSectionCount} section(s)` : ""}
              {typeof serverRevision === "number" ? ` • Révision connue : r${serverRevision})` : typeof localSectionCount === "number" ? ")" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isResolving}
              data-testid="studio-conflict-reload-btn"
              onClick={() => void handleReload()}
              className="h-7 px-2.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-100/60 text-amber-900 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Charger la version serveur</span>
            </button>
            <button
              type="button"
              disabled={isResolving}
              data-testid="studio-conflict-overwrite-btn"
              onClick={() => setConfirmingOverwrite(true)}
              className="h-7 px-2.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-white font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Conserver et forcer ma version</span>
            </button>
          </div>
        </div>

        {confirmingOverwrite && (
          <div
            data-testid="studio-conflict-confirm-box"
            className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-rose-950"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Attention : forcer votre version locale écrasera les modifications enregistrées depuis l&apos;autre écran. Confirmez-vous cet écrasement ?
              </span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={isResolving}
                data-testid="studio-conflict-cancel-overwrite-btn"
                onClick={() => setConfirmingOverwrite(false)}
                className="h-6.5 px-2.5 rounded-md border border-rose-200 bg-white hover:bg-rose-100 text-rose-800 font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isResolving}
                data-testid="studio-conflict-confirm-overwrite-btn"
                onClick={() => void handleConfirmForceOverwrite()}
                className="h-6.5 px-2.5 rounded-md bg-rose-700 hover:bg-rose-800 text-white font-bold cursor-pointer disabled:opacity-50"
              >
                Confirmer l&apos;écrasement serveur
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (saveStatus === "error") {
    const handleRetry = async () => {
      if (!onRetrySave || isResolving) return;
      setIsResolving(true);
      try {
        await onRetrySave();
      } finally {
        setIsResolving(false);
      }
    };

    return (
      <div
        role="alert"
        data-testid="studio-save-error-banner"
        className="shrink-0 bg-rose-50 border-b border-rose-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-950"
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium truncate">
            {lastSaveError?.trim() || "Erreur lors de l'enregistrement des modifications."}
          </span>
        </div>
        {onRetrySave && (
          <button
            type="button"
            disabled={isResolving}
            data-testid="studio-retry-save-btn"
            onClick={() => void handleRetry()}
            className="h-7 px-2.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        )}
      </div>
    );
  }

  if (recoverableBackup) {
    return (
      <div
        role="status"
        data-testid="studio-recovery-banner"
        className="shrink-0 bg-sky-50 border-b border-sky-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-sky-950"
      >
        <div className="flex items-center gap-2 min-w-0">
          <History className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="font-medium">
            Sauvegarde locale détectée ({recoverableBackup.sections.length} section
            {recoverableBackup.sections.length > 1 ? "s" : ""}
            {recoverableBackup.theme ? " + thème" : ""}) plus récente que le serveur.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            data-testid="studio-restore-backup-btn"
            onClick={() => onRestoreBackup?.()}
            className="h-7 px-2.5 rounded-lg bg-sky-900 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Restaurer mes modifications</span>
          </button>
          <button
            type="button"
            data-testid="studio-dismiss-backup-btn"
            onClick={() => onDismissBackup?.()}
            className="h-7 px-2 rounded-lg border border-sky-200 bg-white hover:bg-sky-100/60 text-sky-700 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Ignorer</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
