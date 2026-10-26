import React, { useRef, useState } from "react";
import { Upload, ShoppingBag, Sparkles, Link2, Trash2, Check } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";

interface StudioImagePickerProps {
  label: string;
  value: string;
  onChange: (newUrl: string) => void;
  products?: Product[];
  placeholder?: string;
  compact?: boolean;
}

const STUDIO_STOCK_PHOTOS = [
  { label: "Mode & Prêt-à-porter", url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80" },
  { label: "Boutique Luxe", url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" },
  { label: "Sneakers & Street", url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80" },
  { label: "Sacs & Maroquinerie", url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80" },
  { label: "Montres & Bijoux", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" },
  { label: "Beauté & Parfums", url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80" },
  { label: "Tech & Smartphones", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80" },
  { label: "Déco & Maison", url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80" },
];

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas non supporté"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = () => reject(new Error("Image invalide"));
      img.src = String(event.target?.result || "");
    };
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
    reader.readAsDataURL(file);
  });
}

export const StudioImagePicker: React.FC<StudioImagePickerProps> = ({
  label,
  value,
  onChange,
  products = [],
  placeholder = "https://...",
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pickerMode, setPickerMode] = useState<"none" | "products" | "stock" | "url">("none");
  const [isUploading, setIsUploading] = useState(false);

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
    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImageFile(file);
      onChange(compressedDataUrl);
      setPickerMode("none");
    } catch {
      // Fallback ignored if file invalid
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2 bg-white p-2.5 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-700">{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[10px] font-semibold text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Retirer</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`${
            compact ? "w-12 h-12" : "w-16 h-16"
          } rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer relative group`}
          title="Cliquer pour remplacer la photo"
        >
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <Upload className="w-5 h-5 text-slate-400" />
          )}
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold text-center px-1 transition-opacity">
            Changer
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-1.5">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="col-span-2 h-8 px-2.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? "Compression..." : "Importer photo (Téléphone / PC)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setPickerMode(pickerMode === "products" ? "none" : "products")}
            className={`h-7 px-2 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              pickerMode === "products"
                ? "border-[#F97316] bg-[#FFF7ED] text-[#EA580C]"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <ShoppingBag className="w-3 h-3 text-[#F97316]" />
            <span>Mes Produits ({productPhotos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setPickerMode(pickerMode === "stock" ? "none" : "stock")}
            className={`h-7 px-2 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              pickerMode === "stock"
                ? "border-[#F97316] bg-[#FFF7ED] text-[#EA580C]"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Galerie Pro</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <button
          type="button"
          onClick={() => setPickerMode(pickerMode === "url" ? "none" : "url")}
          className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
        >
          <Link2 className="w-3 h-3" />
          <span>{pickerMode === "url" ? "Masquer le lien URL" : "Ou coller un lien d'image (URL)"}</span>
        </button>
      </div>

      {pickerMode === "url" && (
        <input
          type="url"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-mono text-slate-800 focus:border-[#F97316] focus:bg-white focus:outline-none"
        />
      )}

      {pickerMode === "products" && (
        <div className="pt-1.5 border-t border-slate-100">
          {productPhotos.length === 0 ? (
            <p className="text-[11px] text-slate-500 py-2 text-center">
              Aucun produit avec photo dans votre catalogue.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1">
              {productPhotos.map((item) => {
                const isSelected = value === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { onChange(item.url); setPickerMode("none"); }}
                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected ? "border-[#F97316] ring-2 ring-orange-200" : "border-slate-200 hover:border-orange-300"
                    }`}
                    title={item.title}
                  >
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#F97316]/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {pickerMode === "stock" && (
        <div className="pt-1.5 border-t border-slate-100 grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto p-1">
          {STUDIO_STOCK_PHOTOS.map((stock) => {
            const isSelected = value === stock.url;
            return (
              <button
                key={stock.url}
                type="button"
                onClick={() => { onChange(stock.url); setPickerMode("none"); }}
                className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  isSelected ? "border-[#F97316] ring-2 ring-orange-200" : "border-slate-200 hover:border-orange-300"
                }`}
                title={stock.label}
              >
                <img src={stock.url} alt={stock.label} className="w-full h-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/65 text-white text-[8px] font-semibold px-1 py-0.5 truncate">
                  {stock.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
