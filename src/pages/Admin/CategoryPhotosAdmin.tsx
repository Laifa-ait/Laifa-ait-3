import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Save } from "lucide-react";
import { apiGet, apiPost } from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import toast from "react-hot-toast";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase";
import { CATEGORY_KEYS, CategoryPhotoConfig } from "./CategoryPhotos/types";
import { CategoryPhotosList } from "./CategoryPhotos/CategoryPhotosList";
import { CategoryPhotoPreview } from "./CategoryPhotos/CategoryPhotoPreview";
import { CategoryPhotoForm } from "./CategoryPhotos/CategoryPhotoForm";

export const CategoryPhotosAdmin: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedKey, setSelectedKey] = useState<string>("Électronique");
  const [configs, setConfigs] = useState<Record<string, CategoryPhotoConfig>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const loadAllConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const newConfigs: Record<string, CategoryPhotoConfig> = {};
      CATEGORY_KEYS.forEach((item) => {
        newConfigs[item.key] = {
          key: item.key,
          title: item.defaultTitle,
          subtitle: item.defaultSubtitle,
          image: item.defaultImage,
        };
      });

      try {
        const dataList = await apiGet<Array<{ id: string; key?: string; title?: string; subtitle?: string; image?: string }>>(
          "/api/v1/settings/homepage-categories"
        );
        if (Array.isArray(dataList)) {
          dataList.forEach((docItem) => {
            const catKey = docItem.id || docItem.key;
            if (catKey) {
              const prev = newConfigs[catKey] || {
                key: catKey,
                title: catKey,
                subtitle: "Découvrez nos sélections",
                image: "/images/placeholders/product.svg",
              };
              newConfigs[catKey] = {
                key: catKey,
                title: docItem.title || prev.title,
                subtitle: docItem.subtitle || prev.subtitle,
                image: docItem.image || prev.image,
              };
            }
          });
        }
      } catch (err) {
        console.warn("Could not fetch remote categories list, using defaults:", err);
      }

      setConfigs(newConfigs);
    } catch (err) {
      console.error(err);
      toast.error(t("Erreur de chargement des catégories photo"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadAllConfigs();
  }, [loadAllConfigs]);

  useEffect(() => {
    const current = configs[selectedKey] || CATEGORY_KEYS.find((c) => c.key === selectedKey);
    if (current) {
      setTitle(current.title || "");
      setSubtitle(current.subtitle || "");
      setImageUrl(current.image || "");
    }
  }, [selectedKey, configs]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error(t("La taille du fichier doit être inférieure à 8 Mo"));
      return;
    }

    toast.loading(t("Téléversement de l'image de catégorie..."), { id: "upload-cat-photo" });
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
      const cleanKey = selectedKey.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
      const safeName = `cat_${cleanKey}_${Date.now()}.${safeExt}`;
      const storageRef = ref(storage, `categories_covers/${safeName}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      setImageUrl(url);
      toast.success(t("Photo téléversée dans le stockage Olmart !"), { id: "upload-cat-photo" });
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImageUrl(reader.result);
          toast.success(t("Image prête ! Pensez à enregistrer."), { id: "upload-cat-photo" });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCurrent = async () => {
    setIsSaving(true);
    toast.loading(t("Enregistrement de la photo de catégorie..."), { id: "save-cat-photo" });

    try {
      const updatedItem = {
        id: selectedKey,
        key: selectedKey,
        title: title.trim() || selectedKey,
        subtitle: subtitle.trim() || "Découvrez nos sélections",
        image: imageUrl.trim() || "/images/placeholders/product.svg",
      };

      await apiPost(`/api/v1/homepage-categories-v2/${encodeURIComponent(selectedKey)}`, updatedItem);

      setConfigs((prev) => ({
        ...prev,
        [selectedKey]: updatedItem,
      }));

      await queryClient.invalidateQueries({ queryKey: queryKeys.home.data() });
      toast.success(t(`Photo et titres pour "${selectedKey}" enregistrés ! ✨`), { id: "save-cat-photo" });
    } catch (err) {
      console.error(err);
      toast.error(t("Erreur lors de la sauvegarde via le serveur"), { id: "save-cat-photo" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4" />
            <span>{t("Administration des Visuels")}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {t("Catégorie Photo")}
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {t("Gérez directement les photos, visuels, titres et sous-titres des cartes de catégories affichées sur la page d'accueil (section Univers Produits).")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveCurrent}
          disabled={isSaving}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0"
        >
          <Save className="w-4.5 h-4.5" />
          <span>{isSaving ? t("Enregistrement...") : t("Enregistrer cette photo")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <CategoryPhotosList
            selectedKey={selectedKey}
            onSelectKey={setSelectedKey}
            configs={configs}
            loading={loading}
            onRefresh={loadAllConfigs}
          />
        </div>

        <div className="lg:col-span-8 space-y-6">
          <CategoryPhotoPreview
            selectedKey={selectedKey}
            title={title}
            subtitle={subtitle}
            imageUrl={imageUrl}
          />

          <CategoryPhotoForm
            selectedKey={selectedKey}
            title={title}
            setTitle={setTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
};
