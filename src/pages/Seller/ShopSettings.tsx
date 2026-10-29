import React, { useState } from "react";
import { motion } from "motion/react";
import { Save, Image as ImageIcon, Upload, ShieldCheck, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiPut } from "../../lib/api";
import { ALGERIA_WILAYAS } from "../../constants";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { maskSensitiveData, hasExternalChannel } from "../../utils/masking";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import { TwoFactorSecurityModal } from "../../components/Security/TwoFactorSecurityModal";

interface ShopSettingsForm {
  shopName: string;
  shopDescription: string;
  logoUrl: string;
  bannerUrl: string;
  wilaya: string;
}

export const ShopSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { userProfile, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  const [shopData, setShopData] = useState<ShopSettingsForm>({
    shopName:
      typeof userProfile?.shopName === "string"
        ? userProfile.shopName
        : typeof userProfile?.displayName === "string"
        ? userProfile.displayName
        : "",
    shopDescription: typeof userProfile?.shopDescription === "string" ? userProfile.shopDescription : "",
    logoUrl:
      typeof userProfile?.logoUrl === "string"
        ? userProfile.logoUrl
        : typeof userProfile?.photoURL === "string"
        ? userProfile.photoURL
        : "",
    bannerUrl: typeof userProfile?.bannerUrl === "string" ? userProfile.bannerUrl : "",
    wilaya: typeof userProfile?.wilaya === "string" ? userProfile.wilaya : "16-Alger",
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return void toast.error(t("Utilisateur non identifié"));
    if (hasExternalChannel(shopData.shopName) || hasExternalChannel(shopData.shopDescription)) {
      toast.error(t("external_channel_blocked", "Les coordonnées de communication extérieure ne sont pas autorisées dans ce champ."));
      return;
    }

    setLoading(true);
    try {
      await apiPut("/api/v1/seller/profile/settings", {
        shopName: shopData.shopName,
        shopDescription: maskSensitiveData(shopData.shopDescription || ""),
        logoUrl: shopData.logoUrl,
        bannerUrl: shopData.bannerUrl,
        wilaya: shopData.wilaya,
      });
      toast.success(t("Paramètres boutique sauvegardés !"));
    } catch (err) {
      console.error(err);
      toast.error(t("Erreur de sauvegarde."));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (field: "logoUrl" | "bannerUrl") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return void toast.error(t("Le fichier est trop lourd (Max 2 Mo)."));

    const { ref: storageRef, uploadBytes, getDownloadURL } = await import("firebase/storage");
    const { storage } = await import("../../lib/firebase");

    if (field === "logoUrl") setUploadingLogo(true);
    if (field === "bannerUrl") setUploadingBanner(true);

    const loaderId = toast.loading(t("Téléchargement du fichier..."));
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileRef = storageRef(storage, `shops/${userProfile?.uid || "temp"}/${field}_${Date.now()}.${ext}`);
      await uploadBytes(fileRef, file, { contentType: file.type });
      const publicUrl = await getDownloadURL(fileRef);
      setShopData((prev) => ({ ...prev, [field]: publicUrl }));
      toast.success(t("Fichier mis à jour avec succès !"), { id: loaderId });
    } catch (err: unknown) {
      console.error(err);
      toast.error(t("Échec de l'upload"), { id: loaderId });
    } finally {
      if (field === "logoUrl") setUploadingLogo(false);
      if (field === "bannerUrl") setUploadingBanner(false);
    }
  };

  const isShopValidated = userProfile?.status === "ACTIVE" || userProfile?.status === "active";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {!isShopValidated && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl">
          <h3 className="font-bold text-xs sm:text-sm">{t("Boutique en attente de vérification")}</h3>
          <p className="text-xs text-amber-700/80 mt-0.5">
            {t("Le nom public de la boutique sera modifiable dès validation de votre dossier KYC.")}
          </p>
        </div>
      )}

      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A1836]">{t("Paramètres Boutique & Sécurité 2FA")}</h2>
        <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">{t("Configurez l'identité visuelle de votre boutique et la protection de votre compte.")}</p>
      </div>

      {/* Security & 2FA Card Mindazzle */}
      <div className="bg-gradient-to-br from-[#1A1836] via-[#42164B] to-[#622347] text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#A54055]/30">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3.5 bg-white/10 text-[#E99856] rounded-2xl border border-white/15 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                {isArabic ? "أمان الحساب والمصادقة الثنائية (2FA)" : "Sécurité du Compte & Double Authentification (2FA)"}
              </h3>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${is2FAEnabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-[#E99856]/20 text-[#E99856] border border-[#E99856]/30"}`}>
                {is2FAEnabled ? t("ACTIVÉ") : t("INACTIF")}
              </span>
            </div>
            <p className="text-xs text-[#E0B4B2] max-w-xl">
              {t("Protégez votre boutique en exigeant un code OTP e-mail pour chaque action sensible.")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIs2FAModalOpen(true)}
          className="px-5 py-3 bg-gradient-to-r from-[#E99856] to-[#d8823e] text-[#1A1836] font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-sm shrink-0 flex items-center gap-2 cursor-pointer border-none"
        >
          <KeyRound className="w-4 h-4" />
          <span>{is2FAEnabled ? t("Gérer le 2FA") : t("Activer le 2FA")}</span>
        </button>
      </div>

      <TwoFactorSecurityModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        userEmail={currentUser?.email || userProfile?.email}
        isInitiallyEnabled={is2FAEnabled}
        onStatusChange={(status) => setIs2FAEnabled(status)}
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-[#E0B4B2]/40 shadow-2xs p-6 sm:p-8 overflow-hidden">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">{t("Nom Public de la Boutique")}</label>
                <input required disabled={!isShopValidated} type="text" className="w-full px-4 py-3.5 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-2xl outline-none font-bold text-sm text-[#1A1836] disabled:opacity-50" value={shopData.shopName || ""} onChange={(e) => setShopData({ ...shopData, shopName: e.target.value })} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">{t("Wilaya d'Expédition Principale")}</label>
                <select className="w-full px-4 py-3.5 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-2xl outline-none font-bold text-sm text-[#1A1836] cursor-pointer" value={shopData.wilaya || ""} onChange={(e) => setShopData({ ...shopData, wilaya: e.target.value })}>
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">{t("Slogan / Courte Description")}</label>
                <textarea rows={3} className="w-full px-4 py-3.5 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-2xl outline-none font-medium resize-none text-sm text-[#1A1836]" value={shopData.shopDescription || ""} onChange={(e) => setShopData({ ...shopData, shopDescription: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">{t("Logo de la Boutique")}</label>
                <div className="flex gap-3">
                  <div className="relative flex-1 bg-[#FAF7F8] border border-[#E0B4B2] border-dashed rounded-2xl flex items-center justify-center hover:bg-[#E0B4B2]/15 transition-colors cursor-pointer p-4">
                    <input type="file" accept="image/*" onChange={handleFileChange("logoUrl")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex items-center gap-2 pointer-events-none">
                      <Upload className="w-4 h-4 text-[#A54055]" />
                      <span className="text-xs font-bold text-[#1A1836]">{shopData.logoUrl ? t("Changer de Logo") : t("Uploader votre Logo")}</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF7F8] shrink-0 overflow-hidden border border-[#E0B4B2]/50 flex items-center justify-center text-[#A54055]">
                    {shopData.logoUrl ? (
                      <img loading="lazy" src={getOptimizedImageUrl(shopData.logoUrl, 200)} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <ImageIcon className="w-6 h-6" />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">{t("Bannière de la Boutique")}</label>
                <div className="relative overflow-hidden w-full px-4 py-4 bg-[#FAF7F8] border border-[#E0B4B2] border-dashed rounded-2xl flex items-center justify-center hover:bg-[#E0B4B2]/15 transition-colors cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileChange("bannerUrl")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="flex items-center gap-2 pointer-events-none">
                    <Upload className="w-4 h-4 text-[#A54055]" />
                    <span className="text-xs font-bold text-[#1A1836]">{shopData.bannerUrl ? t("Changer la Bannière") : t("Uploader la Bannière")}</span>
                  </div>
                </div>
                {shopData.bannerUrl && (
                  <div className="mt-3 aspect-[4/1] w-full rounded-2xl overflow-hidden border border-[#E0B4B2]/50 bg-[#FAF7F8]">
                    <img loading="lazy" src={getOptimizedImageUrl(shopData.bannerUrl, 800)} className="w-full h-full object-cover" alt="" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingLogo || uploadingBanner}
            className="w-full bg-gradient-to-r from-[#1A1836] to-[#42164B] hover:from-[#42164B] hover:to-[#622347] text-white py-4 rounded-2xl font-extrabold uppercase tracking-wider text-xs transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            <Save className="w-4 h-4 text-[#E99856]" />
            <span>{loading ? t("Sauvegarde...") : uploadingLogo || uploadingBanner ? t("Transfert d'image en cours...") : t("Sauvegarder les paramètres")}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
