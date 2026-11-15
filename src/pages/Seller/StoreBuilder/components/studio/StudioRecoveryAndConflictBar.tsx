import React, { useState } from "react";
import { AlertTriangle, History, RefreshCw, UploadCloud, X } from "lucide-react";
import { SaveStatus } from "../../hooks/useStudioSaveManager";
import { StudioLocalBackupData } from "../../hooks/studioBackupStorage";

interface StudioRecoveryAndConflictBarProps {
  saveStatus: SaveStatus;
  recoverableBackup?: StudioLocalBackupData | null;
  onRestoreBackup?: () => void;
  onDismissBackup?: () => void;
  onReloadServerVersion?: () => void | Promise<void>;
  onForceOverwriteDraft?: () => unknown | Promise<unknown>;
}

export const StudioRecoveryAndConflictBar: React.FC<StudioRecoveryAndConflictBarProps> = ({
  saveStatus,
  recoverableBackup,
  onRestoreBackup,
  onDismissBackup,
  onReloadServerVersion,
  onForceOverwriteDraft,
}) => {
  const [isResolving, setIsResolving] = useState(false);

  if (saveStatus === "conflict") {
    const handleReload = async () => {
      if (!onReloadServerVersion || isResolving) return;
      setIsResolving(true);
      try {
        await onReloadServerVersion();
      } finally {
        setIsResolving(false);
      }
    };

    const handleForceOverwrite = async () => {
      if (!onForceOverwriteDraft || isResolving) return;
      setIsResolving(true);
      try {
        await onForceOverwriteDraft();
      } finally {
        setIsResolving(false);
      }
    };

    return (
      <div
        role="alert"
        data-testid="studio-conflict-banner"
        className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950"
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-medium">
            Conflit de version : cette boutique a été modifiée sur un autre onglet ou appareil. Choisissez quelle version conserver.
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
            onClick={() => void handleForceOverwrite()}
            className="h-7 px-2.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-white font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Conserver et forcer ma version</span>
          </button>
        </div>
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
            {recoverableBackup.sections.length > 1 ? "s" : ""}) plus récente que le serveur.
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
