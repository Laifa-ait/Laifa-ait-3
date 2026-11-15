import React, { useRef, useState } from "react";
import { AlertCircle, Check, FolderOpen, Link2, ShoppingBag, Layers, Trash2, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { Product } from "../../../../../../domains/product/product.types";
import { STUDIO_BACKDROP_PRESETS } from "./studioStockPhotos";
import { useStudioMediaContext } from "../../../context/StudioMediaContext";
import { validateMediaFile } from "../../../utils/studioMediaValidation";

interface StudioImagePickerProps {
  label: string;
  value: string;
  onChange: (newUrl: string) => void;
  products?: Product[];
  placeholder?: string;
  compact?: boolean;
}

export const StudioImagePicker: React.FC<StudioImagePickerProps> = ({
  label, value, onChange, products = [], placeholder = "https://...", compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mediaGallery, onUploadMedia, uploadProgress = 0 } = useStudioMediaContext();
  const [pickerMode, setPickerMode] = useState<"none" | "library" | "products" | "stock" | "url">("none");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [brokenPreviewUrl, setBrokenPreviewUrl] = useState<string | null>(null);

  const libraryPhotos = mediaGallery.filter((m) => m.type === "image");
  const productPhotos = products
    .map((p) => ({
      id: p.id,
      title: p.name,
      url: Array.isArray(p.images) && p.images[0] ? p.images[0] : p.image || "",
    }))
    .filter((p) => Boolean(p.url));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      await validateMediaFile(file, { allowVideo: false });
      if (!onUploadMedia) {
        throw new Error("Import sécurisé indisponible dans ce contexte. Utilisez la Médiathèque ou une URL HTTPS.");
      }
      const item = await onUploadMedia(file, { folder: "images", allowVideo: false });
      setBrokenPreviewUrl(null);
      onChange(item.url);
      setPickerMode("none");
      toast.success("Photo importée dans votre médiathèque et appliquée");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Échec de l'import de l'image.";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isPreviewBroken = Boolean(value && brokenPreviewUrl === value);

  return (
    <div className="space-y-2 bg-white p-2.5 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-800">{label}</span>
        {value && (
          <button
            type="button" onClick={() => onChange("")}
            className="text-[10.5px] font-medium text-rose-600 hover:text-rose-800 flex items-center gap-0.5 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" /><span>Retirer</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`${compact ? "w-12 h-12" : "w-16 h-16"} rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer relative group`}
          title="Cliquer pour remplacer la photo"
        >
          {value && !isPreviewBroken ? (
            <img src={value} alt={label} onError={() => setBrokenPreviewUrl(value)} className="w-full h-full object-cover" />
          ) : value && isPreviewBroken ? (
            <div data-testid="image-picker-broken-badge" className="flex flex-col items-center justify-center text-rose-600 p-1 text-center">
              <AlertCircle className="w-4 h-4" />
              <span className="text-[8px] font-bold">Brisée</span>
            </div>
          ) : (
            <Upload className="w-4 h-4 text-slate-400" />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-semibold text-center px-1 transition-opacity">
            Changer
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-1.5">
          <input
            ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileChange} className="hidden" data-testid="image-picker-file-input"
          />
          <button
            type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
            data-testid="image-picker-upload-btn"
            className="col-span-2 h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? `Envoi ${Math.round(uploadProgress)}%...` : "Importer une photo"}</span>
          </button>

          <button
            type="button" data-testid="image-picker-library-btn"
            onClick={() => setPickerMode(pickerMode === "library" ? "none" : "library")}
            className={`col-span-2 h-7 px-2 rounded-md border text-[10.5px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              pickerMode === "library" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <FolderOpen className="w-3 h-3" /><span>Médiathèque ({libraryPhotos.length})</span>
          </button>

          <button
            type="button" onClick={() => setPickerMode(pickerMode === "products" ? "none" : "products")}
            className={`h-7 px-2 rounded-md border text-[10.5px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              pickerMode === "products" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ShoppingBag className="w-3 h-3" /><span>Produits ({productPhotos.length})</span>
          </button>

          <button
            type="button" onClick={() => setPickerMode(pickerMode === "stock" ? "none" : "stock")}
            className={`h-7 px-2 rounded-md border text-[10.5px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              pickerMode === "stock" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-3 h-3" /><span>Fonds studio</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div data-testid="image-picker-upload-error" className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[10.5px] font-medium text-rose-700">
          {uploadError}
        </div>
      )}

      <div className="flex items-center justify-between pt-0.5">
        <button
          type="button" onClick={() => setPickerMode(pickerMode === "url" ? "none" : "url")}
          className="text-[10.5px] font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <Link2 className="w-3 h-3" />
          <span>{pickerMode === "url" ? "Masquer l'URL" : "Coller une URL d'image"}</span>
        </button>
      </div>

      {pickerMode === "url" && (
        <input
          type="url" value={value.startsWith("data:") ? "" : value} onChange={(e) => { setBrokenPreviewUrl(null); onChange(e.target.value); }}
          placeholder={placeholder}
          className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 text-[11px] font-mono text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none"
        />
      )}

      {pickerMode === "library" && (
        <div className="pt-2 border-t border-slate-100" data-testid="image-picker-library-grid">
          {libraryPhotos.length === 0 ? (
            <p className="text-[11px] text-slate-400 py-2 text-center">Aucun visuel dans votre médiathèque. Importez une image ci-dessus.</p>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-0.5">
              {libraryPhotos.map((item) => {
                const isSelected = value === item.url;
                return (
                  <button
                    key={item.id} type="button" data-testid={`image-picker-library-item-${item.id}`}
                    onClick={() => { setBrokenPreviewUrl(null); onChange(item.url); setPickerMode("none"); }}
                    className={`group relative aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      isSelected ? "border-slate-900 ring-2 ring-slate-900/20" : "border-slate-200 hover:border-slate-400"
                    }`}
                    title={item.name || item.id}
                  >
                    <img src={item.url} alt={item.name || "Média"} className="w-full h-full object-cover" />
                    {isSelected && <div className="absolute inset-0 bg-slate-900/45 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {pickerMode === "products" && (
        <div className="pt-2 border-t border-slate-100">
          {productPhotos.length === 0 ? (
            <p className="text-[11px] text-slate-400 py-2 text-center">Aucun produit avec photo dans votre catalogue.</p>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-0.5">
              {productPhotos.map((item) => {
                const isSelected = value === item.url;
                return (
                  <button
                    key={item.id} type="button"
                    onClick={() => { setBrokenPreviewUrl(null); onChange(item.url); setPickerMode("none"); }}
                    className={`group relative aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      isSelected ? "border-slate-900 ring-2 ring-slate-900/20" : "border-slate-200 hover:border-slate-400"
                    }`}
                    title={item.title}
                  >
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    {isSelected && <div className="absolute inset-0 bg-slate-900/45 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {pickerMode === "stock" && (
        <div className="pt-2 border-t border-slate-100 grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto p-0.5">
          {STUDIO_BACKDROP_PRESETS.map((stock) => {
            const isSelected = value === stock.url;
            return (
              <button
                key={stock.label} type="button"
                onClick={() => { setBrokenPreviewUrl(null); onChange(stock.url); setPickerMode("none"); }}
                className={`group relative aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer ${
                  isSelected ? "border-slate-900 ring-2 ring-slate-900/20" : "border-slate-200 hover:border-slate-400"
                }`}
                title={stock.label}
              >
                <img src={stock.url} alt={stock.label} className="w-full h-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[8.5px] font-medium px-1 py-0.5 truncate">{stock.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
