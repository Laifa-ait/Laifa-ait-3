import React, { useState } from "react";
import { MediaFolderCategory, MediaGalleryItem } from "../../../../../domains/seller/customPage.types";
import { AlertTriangle, Check, Copy, Edit3, Film, Folder, RefreshCw, Trash2 } from "lucide-react";
import { isSystemOrCatalogMedia } from "../../utils/studioMediaValidation";

interface MediaSelectedInspectorProps {
  selectedMedia: MediaGalleryItem;
  allMedia?: MediaGalleryItem[];
  selectedUsages: string[];
  copiedUrl: string | null;
  dims?: string;
  deletingId: string | null;
  onCopy: (url: string) => void;
  onDetectedDimensions: (id: string, dims: string) => void;
  onSaveRenameOrFolder: (item: MediaGalleryItem, patch: { name?: string; folder?: MediaFolderCategory }) => Promise<void>;
  onConfirmDelete?: (id: string) => Promise<void>;
  onReplaceUrl?: (oldUrl: string, newUrl: string) => Promise<number>;
}

export const MediaSelectedInspector: React.FC<MediaSelectedInspectorProps> = ({
  selectedMedia, allMedia = [], selectedUsages, copiedUrl, dims, deletingId,
  onCopy, onDetectedDimensions, onSaveRenameOrFolder, onConfirmDelete, onReplaceUrl,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamingName, setRenamingName] = useState(selectedMedia.name || "");
  const [pendingDeleteConfirm, setPendingDeleteConfirm] = useState(false);
  const [showReplacePanel, setShowReplacePanel] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceNotice, setReplaceNotice] = useState<string | null>(null);
  const [hasBrokenPreview, setHasBrokenPreview] = useState(false);

  const canDelete = Boolean(onConfirmDelete && !isSystemOrCatalogMedia(selectedMedia.id));
  const replaceCandidates = allMedia.filter(
    (m) => m.id !== selectedMedia.id && m.url !== selectedMedia.url && m.type === selectedMedia.type
  );
  const metaParts: string[] = [];
  if (selectedMedia.mimeType) metaParts.push(selectedMedia.mimeType.replace(/^(image|video)\//, "").toUpperCase());
  if (selectedMedia.sizeBytes) metaParts.push(`${Math.round(selectedMedia.sizeBytes / 1024)} Ko`);
  metaParts.push(
    dims || (selectedMedia.width && selectedMedia.height ? `${selectedMedia.width}×${selectedMedia.height}px` : "Dimensions auto")
  );

  const handleReplaceWith = async (candidateUrl: string) => {
    if (!onReplaceUrl) return;
    setIsReplacing(true);
    setReplaceNotice(null);
    try {
      const count = await onReplaceUrl(selectedMedia.url, candidateUrl);
      setReplaceNotice(
        count > 0
          ? `Remplacé dans ${count} emplacement(s) sans modifier vos autres réglages.`
          : "Aucune section n'utilisait cette adresse."
      );
      setShowReplacePanel(false);
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl space-y-2.5" data-testid="selected-media-details">
      <div className="flex items-center gap-3">
        {selectedMedia.type === "video" ? (
          <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Film className="w-5 h-5" />
          </div>
        ) : (
          <img
            src={selectedMedia.url}
            alt={selectedMedia.name || "Média"}
            onError={() => setHasBrokenPreview(true)}
            onLoad={(e) => {
              setHasBrokenPreview(false);
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                onDetectedDimensions(selectedMedia.id, `${img.naturalWidth}×${img.naturalHeight}px`);
              }
            }}
            className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] bg-white shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-1">
              <input
                type="text" value={renamingName} onChange={(e) => setRenamingName(e.target.value)}
                data-testid="media-rename-input" className="w-full px-2 py-1 text-xs bg-white border border-[#D0D5DD] rounded"
              />
              <button
                type="button" data-testid="media-rename-save-btn"
                onClick={async () => { await onSaveRenameOrFolder(selectedMedia, { name: renamingName.trim() }); setIsRenaming(false); }}
                className="px-2 py-1 bg-[#023859] text-white text-[10px] font-bold rounded cursor-pointer"
              >
                OK
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-[#17191C] truncate">{selectedMedia.name || "Média sans titre"}</p>
              <button
                type="button" data-testid="media-rename-start-btn" title="Renommer le fichier"
                onClick={() => { setRenamingName(selectedMedia.name || ""); setIsRenaming(true); }}
                className="p-0.5 text-[#667085] hover:text-[#023859] cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
          <p className="text-[10px] text-[#667085] mt-0.5" data-testid="selected-media-meta">{metaParts.join(" • ")}</p>
        </div>
      </div>

      {hasBrokenPreview && (
        <div data-testid="selected-media-broken-warning" className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[10.5px] font-semibold text-rose-800">
          Ce média semble inaccessible. Utilisez « Remplacer » pour restaurer l&apos;affichage dans vos sections sans perdre vos réglages.
        </div>
      )}

      {replaceNotice && (
        <div data-testid="media-replace-success" className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[10.5px] font-semibold text-emerald-800">
          {replaceNotice}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="flex items-center gap-1 text-[#475467] font-semibold">
          <Folder className="w-3.5 h-3.5 text-[#023859]" /> Dossier :
        </span>
        <select
          value={selectedMedia.folder || (selectedMedia.type === "video" ? "videos" : "images")}
          onChange={(e) => onSaveRenameOrFolder(selectedMedia, { folder: e.target.value as MediaFolderCategory })}
          data-testid="media-folder-select"
          className="px-2 py-1 bg-white border border-[#D0D5DD] rounded-md text-[11px] font-semibold"
        >
          <option value="images">Images</option>
          <option value="logos">Logos</option>
          <option value="banners">Bannières</option>
          <option value="collections">Collections</option>
          <option value="videos">Vidéos</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button" onClick={() => onCopy(selectedMedia.url)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-bold text-[#17191C] cursor-pointer"
        >
          {copiedUrl === selectedMedia.url ? (<><Check className="w-3.5 h-3.5 text-[#16A34A]" /><span>Copié</span></>) : (<><Copy className="w-3.5 h-3.5" /><span>Copier</span></>)}
        </button>
        {onReplaceUrl && (selectedUsages.length > 0 || hasBrokenPreview) && (
          <button
            type="button" data-testid="media-start-replace-btn"
            onClick={() => setShowReplacePanel((prev) => !prev)}
            className="flex items-center justify-center gap-1 py-1.5 px-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /><span>Remplacer</span>
          </button>
        )}
        {canDelete && (
          <button
            type="button" data-testid="media-request-delete-btn" onClick={() => setPendingDeleteConfirm(true)}
            disabled={deletingId === selectedMedia.id}
            className="flex items-center justify-center gap-1 py-1.5 px-2.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] rounded-lg text-xs font-bold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /><span>Supprimer</span>
          </button>
        )}
      </div>

      {showReplacePanel && onReplaceUrl && (
        <div data-testid="media-replace-panel" className="p-2.5 rounded-lg bg-white border border-sky-200 space-y-2">
          <p className="text-[11px] font-bold text-slate-800">
            Remplacer dans {selectedUsages.length} emplacement(s) sans supprimer l&apos;original :
          </p>
          {replaceCandidates.length === 0 ? (
            <p className="text-[10.5px] text-slate-500">Importez d&apos;abord un autre média du même type pour effectuer le remplacement.</p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
              {replaceCandidates.map((cand) => (
                <button
                  key={cand.id} type="button" disabled={isReplacing}
                  data-testid={`media-replace-candidate-${cand.id}`}
                  onClick={() => void handleReplaceWith(cand.url)}
                  className="p-1 rounded border border-slate-200 hover:border-sky-600 bg-slate-50 text-left cursor-pointer"
                  title={`Remplacer par ${cand.name || cand.id}`}
                >
                  {cand.type === "video" ? (
                    <div className="aspect-square bg-slate-900 text-white rounded flex items-center justify-center"><Film className="w-4 h-4" /></div>
                  ) : (
                    <img src={cand.url} alt={cand.name || "Remplacement"} className="aspect-square w-full object-cover rounded" />
                  )}
                  <span className="block truncate text-[9.5px] font-medium text-slate-700 mt-0.5">{cand.name || cand.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {pendingDeleteConfirm && canDelete && onConfirmDelete && (
        <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#F59E0B] space-y-2" data-testid="media-delete-confirm-banner">
          <div className="flex items-start gap-2 text-[#92400E]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
            <div className="text-[11px] leading-snug">
              {selectedUsages.length > 0 ? (
                <>
                  <p className="font-black text-[#78350F]">Attention : Ce média est utilisé dans {selectedUsages.length} emplacement(s) !</p>
                  <p className="mt-0.5">Utilisé dans : <strong>{selectedUsages.join(", ")}</strong>. Le supprimer entraînera une image manquante.</p>
                </>
              ) : (
                <p className="font-semibold text-[#78350F]">Confirmer la suppression définitive de « {selectedMedia.name || "ce média"} » ?</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setPendingDeleteConfirm(false)} className="px-2.5 py-1 rounded bg-white border border-[#D0D5DD] text-[11px] font-semibold cursor-pointer">Annuler</button>
            <button
              type="button" data-testid="media-confirm-delete-btn"
              onClick={async () => { await onConfirmDelete(selectedMedia.id); setPendingDeleteConfirm(false); }}
              className="px-2.5 py-1 rounded bg-[#DC2626] text-white text-[11px] font-bold cursor-pointer"
            >
              Confirmer la suppression
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
