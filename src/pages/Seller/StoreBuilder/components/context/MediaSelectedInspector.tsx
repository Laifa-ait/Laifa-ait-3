import React, { useState } from "react";
import {
  MediaFolderCategory,
  MediaGalleryItem,
} from "../../../../../domains/seller/customPage.types";
import { AlertTriangle, Check, Copy, Edit3, Folder, Trash2 } from "lucide-react";

interface MediaSelectedInspectorProps {
  selectedMedia: MediaGalleryItem;
  selectedUsages: string[];
  copiedUrl: string | null;
  dims?: string;
  deletingId: string | null;
  onCopy: (url: string) => void;
  onDetectedDimensions: (id: string, dims: string) => void;
  onSaveRenameOrFolder: (
    item: MediaGalleryItem,
    patch: { name?: string; folder?: MediaFolderCategory }
  ) => Promise<void>;
  onConfirmDelete?: (id: string) => Promise<void>;
}

export const MediaSelectedInspector: React.FC<MediaSelectedInspectorProps> = ({
  selectedMedia,
  selectedUsages,
  copiedUrl,
  dims,
  deletingId,
  onCopy,
  onDetectedDimensions,
  onSaveRenameOrFolder,
  onConfirmDelete,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamingName, setRenamingName] = useState(selectedMedia.name || "");
  const [pendingDeleteConfirm, setPendingDeleteConfirm] = useState(false);

  return (
    <div
      className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl space-y-2.5"
      data-testid="selected-media-details"
    >
      <div className="flex items-center gap-3">
        <img
          src={selectedMedia.url}
          alt={selectedMedia.name || "Média"}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              onDetectedDimensions(selectedMedia.id, `${img.naturalWidth}×${img.naturalHeight}px`);
            }
          }}
          className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] bg-white shrink-0"
        />
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={renamingName}
                onChange={(e) => setRenamingName(e.target.value)}
                data-testid="media-rename-input"
                className="w-full px-2 py-1 text-xs bg-white border border-[#D0D5DD] rounded"
              />
              <button
                type="button"
                data-testid="media-rename-save-btn"
                onClick={async () => {
                  await onSaveRenameOrFolder(selectedMedia, { name: renamingName.trim() });
                  setIsRenaming(false);
                }}
                className="px-2 py-1 bg-[#023859] text-white text-[10px] font-bold rounded"
              >
                OK
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-[#17191C] truncate">
                {selectedMedia.name || "Média sans titre"}
              </p>
              <button
                type="button"
                data-testid="media-rename-start-btn"
                onClick={() => {
                  setRenamingName(selectedMedia.name || "");
                  setIsRenaming(true);
                }}
                className="p-0.5 text-[#667085] hover:text-[#023859]"
                title="Renommer le fichier"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
          <p className="text-[10px] text-[#667085] mt-0.5">
            {selectedMedia.sizeBytes ? `${Math.round(selectedMedia.sizeBytes / 1024)} Ko • ` : ""}
            {dims ||
              (selectedMedia.width && selectedMedia.height
                ? `${selectedMedia.width}×${selectedMedia.height}px`
                : "Dimensions auto")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="flex items-center gap-1 text-[#475467] font-semibold">
          <Folder className="w-3.5 h-3.5 text-[#023859]" /> Dossier :
        </span>
        <select
          value={selectedMedia.folder || "images"}
          onChange={(e) =>
            onSaveRenameOrFolder(selectedMedia, {
              folder: e.target.value as MediaFolderCategory,
            })
          }
          data-testid="media-folder-select"
          className="px-2 py-1 bg-white border border-[#D0D5DD] rounded-md text-[11px] font-semibold"
        >
          <option value="images">Images</option>
          <option value="logos">Logos</option>
          <option value="banners">Bannières</option>
          <option value="collections">Collections</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onCopy(selectedMedia.url)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-bold text-[#17191C]"
        >
          {copiedUrl === selectedMedia.url ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Copié</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copier l&apos;URL</span>
            </>
          )}
        </button>
        {onConfirmDelete && (
          <button
            type="button"
            data-testid="media-request-delete-btn"
            onClick={() => setPendingDeleteConfirm(true)}
            disabled={deletingId === selectedMedia.id}
            className="flex items-center justify-center gap-1 py-1.5 px-2.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] rounded-lg text-xs font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer</span>
          </button>
        )}
      </div>

      {pendingDeleteConfirm && onConfirmDelete && (
        <div
          className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#F59E0B] space-y-2"
          data-testid="media-delete-confirm-banner"
        >
          <div className="flex items-start gap-2 text-[#92400E]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
            <div className="text-[11px] leading-snug">
              {selectedUsages.length > 0 ? (
                <>
                  <p className="font-black text-[#78350F]">
                    Attention : Ce média est utilisé dans {selectedUsages.length} emplacement(s) !
                  </p>
                  <p className="mt-0.5">
                    Utilisé dans : <strong>{selectedUsages.join(", ")}</strong>. Le supprimer entraînera une image manquante.
                  </p>
                </>
              ) : (
                <p className="font-semibold text-[#78350F]">
                  Confirmer la suppression définitive de « {selectedMedia.name || "ce média"} » ?
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPendingDeleteConfirm(false)}
              className="px-2.5 py-1 rounded bg-white border border-[#D0D5DD] text-[11px] font-semibold"
            >
              Annuler
            </button>
            <button
              type="button"
              data-testid="media-confirm-delete-btn"
              onClick={async () => {
                await onConfirmDelete(selectedMedia.id);
                setPendingDeleteConfirm(false);
              }}
              className="px-2.5 py-1 rounded bg-[#DC2626] text-white text-[11px] font-bold"
            >
              Confirmer la suppression
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
