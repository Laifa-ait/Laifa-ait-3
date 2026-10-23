import React, { useState, useEffect } from "react";
import { Palette, Upload, Image as ImageIcon, Trash2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../lib/firebase";

interface SectionFrameDecorationControlsProps {
  secBackgroundColor: string;
  setSecBackgroundColor: (val: string) => void;
  secThemeImage: string;
  setSecThemeImage: (val: string) => void;
}

const COLOR_PRESETS = [
  { label: "Blanc", value: "#ffffff", border: "border-zinc-200" },
  { label: "Albâtre", value: "#faf8f5", border: "border-amber-100" },
  { label: "Gris Perle", value: "#f8fafc", border: "border-slate-200" },
  { label: "Menthe", value: "#f0fdf4", border: "border-emerald-200" },
  { label: "Ambre", value: "#fffbeb", border: "border-amber-200" },
  { label: "Rose", value: "#fff1f2", border: "border-rose-200" },
];

const DECORATION_PRESETS = [
  { label: "Luxe & Or DZ", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800" },
  { label: "Design Géométrique", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800" },
  { label: "Lueur Ambrée", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800" },
  { label: "Feuille & Nature", url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800" },
];

export const SectionFrameDecorationControls: React.FC<SectionFrameDecorationControlsProps> = ({
  secBackgroundColor,
  setSecBackgroundColor,
  secThemeImage,
  setSecThemeImage,
}) => {
  const { t } = useTranslation();

  const [useCustomBg, setUseCustomBg] = useState<boolean>(
    () => Boolean(secBackgroundColor && secBackgroundColor !== "" && secBackgroundColor !== "transparent")
  );

  useEffect(() => {
    const isCustom = Boolean(secBackgroundColor && secBackgroundColor !== "" && secBackgroundColor !== "transparent");
    setUseCustomBg(isCustom);
  }, [secBackgroundColor]);

  const handleToggleCustomBg = (checked: boolean) => {
    setUseCustomBg(checked);
    if (checked) {
      if (!secBackgroundColor || secBackgroundColor === "transparent") {
        setSecBackgroundColor("#ffffff");
      }
    } else {
      setSecBackgroundColor("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error(t("La taille du fichier doit être inférieure à 8 Mo"));
      return;
    }

    toast.loading(t("Téléversement de l'image de décoration..."), { id: "upload-frame-decor" });
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
      const fileName = `frame_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${safeExt}`;
      const storageRef = ref(storage, `homepage_media/${fileName}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      setSecThemeImage(url);
      toast.success(t("Image de décoration du cadre enregistrée dans le stockage !"), { id: "upload-frame-decor" });
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setSecThemeImage(reader.result);
          toast.success(t("Image de décoration du cadre chargée !"), { id: "upload-frame-decor" });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 pt-3 border-t border-zinc-200/80">
      <div className="bg-zinc-50/80 p-3.5 rounded-2xl border border-zinc-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-zinc-900 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomBg}
              onChange={(e) => handleToggleCustomBg(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <Palette className="w-3.5 h-3.5 text-amber-600" />
            <span>{t("Utiliser une couleur de fond personnalisée")}</span>
          </label>

          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
            useCustomBg ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-600"
          }`}>
            {useCustomBg ? t("Couleur Active") : t("Thème du Départ Auto")}
          </span>
        </div>

        {useCustomBg ? (
          <div className="flex flex-wrap items-center gap-2.5 pt-1 animate-fade-in">
            <div className="flex items-center gap-1">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setSecBackgroundColor(p.value)}
                  style={{ backgroundColor: p.value }}
                  className={`w-6 h-6 rounded-md border ${p.border} ${
                    secBackgroundColor === p.value ? "ring-2 ring-amber-500 scale-110" : "hover:scale-105"
                  } transition-all cursor-pointer`}
                  title={p.label}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              <input
                type="color"
                value={secBackgroundColor || "#ffffff"}
                onChange={(e) => setSecBackgroundColor(e.target.value)}
                className="w-7 h-7 p-0.5 rounded-lg border border-zinc-200 cursor-pointer"
              />
              <input
                type="text"
                value={secBackgroundColor || "#ffffff"}
                onChange={(e) => setSecBackgroundColor(e.target.value)}
                className="w-20 px-2 py-1 text-[11px] font-mono rounded-lg border border-zinc-200 bg-white"
              />
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-zinc-500 italic font-medium pl-6">
            {t("Le système appliquera automatiquement le fond et le style du thème sélectionné à l'Étape 1.")}
          </p>
        )}
      </div>

      <div className="bg-zinc-50/80 p-3.5 rounded-2xl border border-zinc-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-zinc-900 flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>{t("Décoration du Cadre par Image")}</span>
          </label>
          {secThemeImage && (
            <button
              type="button"
              onClick={() => setSecThemeImage("")}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t("Supprimer l'image")}</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <label className="px-3.5 py-2 bg-white hover:bg-zinc-100 active:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors border border-zinc-200 shadow-2xs shrink-0">
            <Upload className="w-3.5 h-3.5 text-amber-600" />
            <span>{t("Importer une image depuis votre téléphone")}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <input
            type="text"
            value={secThemeImage}
            onChange={(e) => setSecThemeImage(e.target.value)}
            placeholder="Ou collez l'URL d'une image (https://...)"
            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {secThemeImage ? (
          <div className="relative rounded-xl overflow-hidden h-20 border border-zinc-300 shadow-inner group">
            <img
              src={secThemeImage}
              alt="Frame Decoration"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-zinc-950/40 p-2 flex items-center justify-between text-white">
              <span className="text-[10px] font-extrabold bg-amber-500 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {t("Décoration Active sur le Cadre")}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-500 block">
              {t("Ou choisissez un motif / texture suggéré :")}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DECORATION_PRESETS.map((dec, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSecThemeImage(dec.url)}
                  className="relative h-12 rounded-lg overflow-hidden border border-zinc-200 hover:border-amber-500 transition-all cursor-pointer group"
                >
                  <img src={dec.url} alt={dec.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-zinc-950/30 flex items-center justify-center p-1">
                    <span className="text-[9px] font-bold text-white text-center leading-tight drop-shadow-sm truncate">
                      {dec.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
