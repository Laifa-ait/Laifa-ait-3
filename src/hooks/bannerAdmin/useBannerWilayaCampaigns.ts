import { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { compressAndResizeImage, PromoBanner, WilayaBannerData, WilayaCampaign } from "./useBannerTypes";
import { generateClientUUID } from "../../utils/secureCrypto";
import { uploadFileWithProgress } from "../../services/storage.service";
import { apiGet, apiPost } from "../../lib/api";

export type { PromoBanner, WilayaBannerData, WilayaCampaign };

function campaignToFlatData(wilayaLabel: string, c?: WilayaCampaign): WilayaBannerData {
  return {
    heroTitle: c?.heroTitle || `Sélection Spéciale ${wilayaLabel}`,
    heroSubtitle: c?.heroSubtitle || "Livraison rapide à domicile et point relais dans votre wilaya",
    heroButtonText: c?.heroButtonText || "Découvrir les offres locales",
    heroImage:
      c?.heroImage ||
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=1600",
    promoLeftTitle: c?.promoLeft?.title || "Jusqu'à -40% sur l'Électroménager",
    promoLeftSubtitle: c?.promoLeft?.subtitle || c?.promoLeft?.badge || "OFFRE LOCALE",
    promoLeftImage:
      c?.promoLeft?.image ||
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=600",
    promoRightTitle: c?.promoRight?.title || "Artisans & Boutiques Certifiées",
    promoRightSubtitle: c?.promoRight?.subtitle || c?.promoRight?.badge || "LIVRAISON EXPRESS",
    promoRightImage:
      c?.promoRight?.image ||
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600",
  };
}

export function useBannerWilayaCampaigns() {
  const [wilayaCampaigns, setWilayaCampaigns] = useState<Record<string, WilayaCampaign>>({});
  const [selectedWilayaToEdit, setSelectedWilayaToEdit] = useState<string>("16 - Alger");
  const [hasWilayaCampaign, setHasWilayaCampaign] = useState(false);
  const [isSavingWilaya, setIsSavingWilaya] = useState(false);
  const [isUploadingWilayaImg, setIsUploadingWilayaImg] = useState<string | null>(null);

  const [currentWilayaData, setCurrentWilayaData] = useState<WilayaBannerData>(() =>
    campaignToFlatData("16 - Alger")
  );

  const [isUploadingWilayaHero, setIsUploadingWilayaHero] = useState(false);
  const [uploadProgressWilayaHero, setUploadProgressWilayaHero] = useState(0);
  const [isUploadingWilayaPromoLeft, setIsUploadingWilayaPromoLeft] = useState(false);
  const [uploadProgressWilayaPromoLeft, setUploadProgressWilayaPromoLeft] = useState(0);
  const [isUploadingWilayaPromoRight, setIsUploadingWilayaPromoRight] = useState(false);
  const [uploadProgressWilayaPromoRight, setUploadProgressWilayaPromoRight] = useState(0);

  const wilayaBanners = useMemo<Record<string, WilayaBannerData>>(() => {
    const mapped: Record<string, WilayaBannerData> = {};
    for (const [key, val] of Object.entries(wilayaCampaigns || {})) {
      if (val && typeof val === "object") {
        mapped[key] = campaignToFlatData(key, val);
      }
    }
    return mapped;
  }, [wilayaCampaigns]);

  const loadWilayaCampaigns = useCallback(async () => {
    try {
      const apiData = await apiGet<{ campaigns?: Record<string, WilayaCampaign> }>(
        "/api/v1/settings/wilaya_campaigns"
      );
      if (apiData && apiData.campaigns && typeof apiData.campaigns === "object") {
        setWilayaCampaigns(apiData.campaigns);
        return;
      }
    } catch {
      // Fallback to direct Firestore read
    }
    try {
      const snap = await getDoc(doc(db, "settings", "wilaya_campaigns"));
      if (snap.exists() && snap.data()?.campaigns) {
        setWilayaCampaigns(snap.data().campaigns as Record<string, WilayaCampaign>);
      }
    } catch {
      // Non-fatal if document does not exist yet
    }
  }, []);

  useEffect(() => {
    void loadWilayaCampaigns();
  }, [loadWilayaCampaigns]);

  useEffect(() => {
    if (!selectedWilayaToEdit) {
      setHasWilayaCampaign(false);
      return;
    }
    const existing = wilayaCampaigns[selectedWilayaToEdit];
    setHasWilayaCampaign(Boolean(existing));
    setCurrentWilayaData(campaignToFlatData(selectedWilayaToEdit, existing));
  }, [selectedWilayaToEdit, wilayaCampaigns]);

  const updateCurrentWilayaField = useCallback((field: keyof WilayaBannerData, value: string) => {
    setCurrentWilayaData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const uploadWilayaAsset = async (
    file: File | undefined,
    fieldKey: "heroImage" | "promoLeftImage" | "promoRightImage",
    w: number,
    h: number
  ) => {
    if (!file) return;
    setIsUploadingWilayaImg(fieldKey);
    if (fieldKey === "heroImage") setIsUploadingWilayaHero(true);
    if (fieldKey === "promoLeftImage") setIsUploadingWilayaPromoLeft(true);
    if (fieldKey === "promoRightImage") setIsUploadingWilayaPromoRight(true);

    const toastId = `up-wilaya-${fieldKey}`;
    try {
      toast.loading("Optimisation de l'image régionale...", { id: toastId });
      const { blob } = await compressAndResizeImage(file, w, h);
      const uuid = generateClientUUID().substring(0, 12);
      const path = `banners/wilaya_${fieldKey}_${uuid}_${file.name.replace(/\s+/g, "_")}`;
      const finalUrl = await new Promise<string>((resolve, reject) => {
        uploadFileWithProgress(
          path,
          blob,
          (p) => {
            const rounded = Math.round(p);
            if (fieldKey === "heroImage") setUploadProgressWilayaHero(rounded);
            if (fieldKey === "promoLeftImage") setUploadProgressWilayaPromoLeft(rounded);
            if (fieldKey === "promoRightImage") setUploadProgressWilayaPromoRight(rounded);
          },
          (err) => reject(err),
          (url) => resolve(url)
        );
      });
      updateCurrentWilayaField(fieldKey, finalUrl);
      toast.success("Image régionale importée !", { id: toastId });
    } catch (err: unknown) {
      toast.error(`Erreur: ${err instanceof Error ? err.message : "Veuillez réessayer."}`, { id: toastId });
    } finally {
      setIsUploadingWilayaImg(null);
      setIsUploadingWilayaHero(false);
      setIsUploadingWilayaPromoLeft(false);
      setIsUploadingWilayaPromoRight(false);
    }
  };

  const handleWilayaImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "heroImage" | "promoLeftImage" | "promoRightImage"
  ) => {
    const dims = field === "heroImage" ? { w: 1600, h: 1000 } : { w: 800, h: 800 };
    await uploadWilayaAsset(e.target.files?.[0], field, dims.w, dims.h);
  };

  const persistWilayaCampaigns = async (nextCampaigns: Record<string, WilayaCampaign>) => {
    const payload = { campaigns: nextCampaigns, updatedAt: new Date().toISOString() };
    try {
      await apiPost("/api/v1/settings/wilaya_campaigns", payload);
    } catch {
      await setDoc(doc(db, "settings", "wilaya_campaigns"), payload, { merge: true });
    }
  };

  const handleSaveWilayaCampaign = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && "preventDefault" in e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!selectedWilayaToEdit) {
      toast.error("Veuillez choisir une Wilaya");
      return;
    }
    setIsSavingWilaya(true);
    try {
      const updated: Record<string, WilayaCampaign> = {
        ...wilayaCampaigns,
        [selectedWilayaToEdit]: {
          heroTitle: currentWilayaData.heroTitle,
          heroSubtitle: currentWilayaData.heroSubtitle,
          heroButtonText: currentWilayaData.heroButtonText,
          heroImage: currentWilayaData.heroImage,
          promoLeft: {
            title: currentWilayaData.promoLeftTitle,
            subtitle: currentWilayaData.promoLeftSubtitle,
            badge: currentWilayaData.promoLeftSubtitle,
            ctaLink: "/shop",
            image: currentWilayaData.promoLeftImage,
          },
          promoRight: {
            title: currentWilayaData.promoRightTitle,
            subtitle: currentWilayaData.promoRightSubtitle,
            badge: currentWilayaData.promoRightSubtitle,
            ctaLink: "/shop",
            image: currentWilayaData.promoRightImage,
          },
        },
      };
      await persistWilayaCampaigns(updated);
      setWilayaCampaigns(updated);
      setHasWilayaCampaign(true);
      toast.success(`Campagne pour ${selectedWilayaToEdit} sauvegardée !`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur de sauvegarde");
    } finally {
      setIsSavingWilaya(false);
    }
  };

  const handleDeleteWilayaCampaign = async (wilayaName?: string) => {
    const targetWilaya = wilayaName || selectedWilayaToEdit;
    if (!targetWilaya || !wilayaCampaigns[targetWilaya]) return;
    setIsSavingWilaya(true);
    try {
      const next = { ...wilayaCampaigns };
      delete next[targetWilaya];
      await persistWilayaCampaigns(next);
      setWilayaCampaigns(next);
      setHasWilayaCampaign(false);
      toast.success(`Campagne régionale ${targetWilaya} réinitialisée.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur de suppression");
    } finally {
      setIsSavingWilaya(false);
    }
  };

  return {
    wilayaCampaigns,
    setWilayaCampaigns,
    wilayaBanners,
    selectedWilaya: selectedWilayaToEdit,
    setSelectedWilaya: setSelectedWilayaToEdit,
    selectedWilayaToEdit,
    setSelectedWilayaToEdit,
    currentWilayaData,
    updateCurrentWilayaField,
    hasWilayaCampaign,
    setHasWilayaCampaign,
    isSavingWilaya,
    isUploadingWilayaImg,
    isUploadingWilayaHero,
    uploadProgressWilayaHero,
    isUploadingWilayaPromoLeft,
    uploadProgressWilayaPromoLeft,
    isUploadingWilayaPromoRight,
    uploadProgressWilayaPromoRight,
    handleWilayaImageUpload,
    handleSaveWilayaCampaign,
    handleDeleteWilayaCampaign,
  };
}
