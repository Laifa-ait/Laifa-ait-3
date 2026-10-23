import React, { useState, useRef } from "react";
import { Upload, X, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { validateAndCompressAutoImage } from "../../domains/auto/auto.imageOptimizer";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUploaderWithMagicBytes: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 8,
}) => {
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);
    setProcessing(true);

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Vous avez atteint la limite de ${maxImages} photos.`);
      setProcessing(false);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    const newCompressedList: string[] = [];

    for (const file of filesToProcess) {
      try {
        const compressedDataUrl = await validateAndCompressAutoImage(file);
        newCompressedList.push(compressedDataUrl);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur de validation de l'image";
        setErrorMessage(`Erreur sur "${file.name}": ${msg}`);
      }
    }

    if (newCompressedList.length > 0) {
      onChange([...images, ...newCompressedList]);
    }
    setProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const addSamplePhoto = () => {
    // Photos de démo haute définition pour showroom automobile
    const samplePhotos = [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    ];
    const nextPhoto = samplePhotos[images.length % samplePhotos.length];
    if (images.length < maxImages) {
      onChange([...images, nextPhoto]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-800">
          Photos du véhicule ({images.length}/{maxImages})
          <span className="text-red-500 ml-1">*</span>
        </label>
        <button
          type="button"
          onClick={addSamplePhoto}
          disabled={images.length >= maxImages}
          className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ajouter photo démo
        </button>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          processing
            ? "border-slate-300 bg-slate-50 cursor-wait"
            : "border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/20 bg-white"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={processing || images.length >= maxImages}
        />

        {processing ? (
          <div className="flex flex-col items-center justify-center py-2">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
            <p className="text-sm font-medium text-slate-700">Contrôle binaire & compression WebP...</p>
            <p className="text-xs text-slate-500 mt-1">Inspection des signatures de fichiers (Anti-malware)</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Cliquez pour importer des photos ou glissez-déposez
            </p>
            <p className="text-xs text-slate-500 mt-1">
              JPG, PNG ou WebP réels uniquement (Vérification Magic Bytes stricte)
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {images.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100 shadow-sm"
            >
              <img
                src={imgUrl}
                alt={`Photo véhicule ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 0 && (
                <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  Photo Principale
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(idx);
                }}
                className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 text-white rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow"
                title="Supprimer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
