import React from "react";
import { Image as ImageIcon, Upload, Check } from "lucide-react";
import { PRESET_LIBRARY } from "./types";

interface CategoryPhotoFormProps {
  selectedKey: string;
  title: string;
  setTitle: (val: string) => void;
  subtitle: string;
  setSubtitle: (val: string) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CategoryPhotoForm: React.FC<CategoryPhotoFormProps> = ({
  selectedKey,
  title,
  setTitle,
  subtitle,
  setSubtitle,
  imageUrl,
  setImageUrl,
  onFileUpload,
}) => {
  const presetImages = PRESET_LIBRARY[selectedKey] || [
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
      <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-emerald-600" />
        <span>Éditer les paramètres de la photo pour "{selectedKey}"</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Titre de la carte</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Tech & Performance"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Sous-titre explicatif</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ex: Gadgets connectés"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold text-slate-700 block">
          Choix de la Photo de Couverture
        </label>

        <div className="flex items-center gap-3">
          <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors border border-slate-200">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Importer un fichier photo local</span>
            <input
              type="file"
              accept="image/*"
              onChange={onFileUpload}
              className="hidden"
            />
          </label>
          <span className="text-[11px] text-slate-400 font-medium">PNG, JPG, WEBP jusqu'à 5 Mo</span>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-500">Ou collez une URL d'image directe :</span>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-extrabold text-slate-700 block">
            Ou choisissez une photo HD suggérée pour "{selectedKey}" :
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {presetImages.map((pUrl, pIdx) => {
              const isPresetActive = imageUrl === pUrl;
              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setImageUrl(pUrl)}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                    isPresetActive ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-md" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <img src={pUrl} alt={`Preset ${pIdx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  {isPresetActive && (
                    <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white font-bold" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
