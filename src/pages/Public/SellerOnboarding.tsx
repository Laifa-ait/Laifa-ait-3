import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Store, FileText, CreditCard, Box, CheckCircle, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiPost } from "../../lib/api";

export const SellerOnboarding: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    storeName: userProfile?.shopName || "",
    description: userProfile?.shopDescription || "",
    documentId: userProfile?.rcNumber || "",
    rib: userProfile?.rib || "",
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async () => {
    if (!currentUser) return;
    if (!formData.storeName.trim()) {
      toast.error(t("Veuillez renseigner le nom de votre boutique."));
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      await apiPost("/api/v1/auth/seller-onboard", {
        storeName: formData.storeName.trim(),
        storeDescription: formData.description.trim(),
        documentId: formData.documentId.trim(),
        rib: formData.rib.trim(),
      });
      toast.success(t("Dossier vendeur soumis ! Votre boutique sera activée dès validation KYC par nos équipes."));
      const isAlreadySeller =
        userProfile?.role === "seller" || userProfile?.role === "admin" || userProfile?.role === "superadmin";
      navigate(isAlreadySeller ? "/dashboard/seller" : "/dashboard/buyer");
    } catch (error) {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error(errorMsg || t("Erreur lors de la soumission du dossier."));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: t("Boutique"), icon: <Store className="w-5 h-5" /> },
    { id: 2, title: t("Vérification KYC"), icon: <FileText className="w-5 h-5" /> },
    { id: 3, title: t("Règlement COD"), icon: <CreditCard className="w-5 h-5" /> },
    { id: 4, title: t("Catalogue"), icon: <Box className="w-5 h-5" /> },
    { id: 5, title: t("Validation"), icon: <CheckCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F8] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#1A1836] via-[#42164B] to-[#622347] p-8 text-white shadow-xl border border-[#A54055]/30 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E99856]/20 text-[#E99856] border border-[#E99856]/30">
            <ShieldCheck className="w-4 h-4" />
            {t("Programme Partenaire Olmart Algérie • 69 Wilayas")}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{t("Devenir vendeur sur Olmart")}</h1>
          <p className="text-xs sm:text-sm text-[#E0B4B2] max-w-xl mx-auto">
            {t("Complétez votre dossier professionnel pour vendre sur les 69 Wilayas avec règlement direct à la livraison (COD).")}
          </p>
        </div>

        <div className="px-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#E0B4B2]/40 -z-10" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#A54055] to-[#E99856] transition-all duration-500 -z-10"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            />
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-colors shadow-xs ${
                    step >= s.id
                      ? "bg-[#1A1836] border-[#E99856] text-[#E99856]"
                      : "bg-white border-[#E0B4B2]/60 text-zinc-400"
                  }`}
                >
                  {s.icon}
                </div>
                <span className={`text-[11px] font-bold hidden sm:block ${step >= s.id ? "text-[#1A1836]" : "text-zinc-400"}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#E0B4B2]/40 p-6 sm:p-8">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl font-extrabold text-[#1A1836]">{t("1. Informations de la boutique")}</h2>
              <div>
                <label htmlFor="storeName" className="block text-xs font-bold text-[#1A1836] uppercase tracking-wider mb-2">
                  {t("Nom commercial de la boutique")} *
                </label>
                <input
                  id="storeName"
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-sm outline-none focus:border-[#A54055]"
                  placeholder={t("Ex: Maison Artisanale d'Alger")}
                />
              </div>
              <div>
                <label htmlFor="storeDesc" className="block text-xs font-bold text-[#1A1836] uppercase tracking-wider mb-2">
                  {t("Description et spécialité")}
                </label>
                <textarea
                  id="storeDesc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-sm outline-none focus:border-[#A54055]"
                  placeholder={t("Décrivez vos produits, votre savoir-faire et votre wilaya d'expédition...")}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl font-extrabold text-[#1A1836]">{t("2. Vérification d'identité (KYC Loi 18-05)")}</h2>
              <div className="p-5 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-2xl space-y-4">
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {t("Pour certifier votre boutique auprès des acheteurs algériens, renseignez votre numéro RC, NIF ou Carte d'Artisan.")}
                </p>
                <div>
                  <label htmlFor="kycDoc" className="block text-xs font-bold text-[#1A1836] uppercase tracking-wider mb-2">
                    {t("Numéro de Registre de Commerce (RC) / NIF / Carte Artisan")}
                  </label>
                  <input
                    id="kycDoc"
                    type="text"
                    value={formData.documentId}
                    onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-[#E0B4B2]/60 rounded-xl text-sm outline-none focus:border-[#A54055]"
                    placeholder="Ex: 16/00-1234567B20"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl font-extrabold text-[#1A1836]">{t("3. Coordonnées de reversement (CCP / RIB)")}</h2>
              <p className="text-xs text-zinc-500">
                {t("Indiquez votre compte CCP ou RIB bancaire (20 chiffres) pour vos règlements et rapprochements comptables.")}
              </p>
              <div>
                <label htmlFor="rib" className="block text-xs font-bold text-[#1A1836] uppercase tracking-wider mb-2">
                  {t("RIB / RIP CCP (20 chiffres)")}
                </label>
                <input
                  id="rib"
                  type="text"
                  value={formData.rib}
                  onChange={(e) => setFormData({ ...formData, rib: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-xl text-sm font-mono outline-none focus:border-[#A54055]"
                  placeholder="00799999000000000000"
                />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl font-extrabold text-[#1A1836]">{t("4. Charte Qualité Catalogue")}</h2>
              <div className="bg-[#FAF7F8] p-6 rounded-2xl border border-[#E0B4B2]/50 text-center space-y-3">
                <Box className="w-10 h-10 text-[#A54055] mx-auto" />
                <p className="text-xs sm:text-sm font-semibold text-[#1A1836]">
                  {t("Dès validation de votre compte vendeur, vous accéderez au gestionnaire de stock ACID et aux bordereaux 69 Wilayas.")}
                </p>
                <ul className="text-xs text-zinc-600 text-left list-disc list-inside space-y-1.5 max-w-md mx-auto">
                  <li>{t("Photos réelles haute résolution et prix affichés en Dinars (DZD)")}</li>
                  <li>{t("Tarifs de livraison Stop Desk et Domicile personnalisables par Wilaya")}</li>
                  <li>{t("Encaissement direct à la livraison (Cash on Delivery)")}</li>
                </ul>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-center py-4">
              <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
              <h2 className="text-xl font-extrabold text-[#1A1836]">{t("Prêt à soumettre votre dossier !")}</h2>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
                {t("En soumettant ce dossier, notre équipe de conformité KYC examinera votre demande d'ouverture de boutique sous 24h.")}
              </p>
            </motion.div>
          )}

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-[#FAF7F8]">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1 || loading}
              className="px-5 py-2.5 font-bold text-xs text-zinc-600 hover:text-[#1A1836] rounded-xl transition-colors disabled:opacity-40 flex items-center gap-2 cursor-pointer border border-[#E0B4B2]/50 bg-[#FAF7F8]"
            >
              <ArrowLeft className="w-4 h-4" /> {t("Précédent")}
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(Math.min(5, step + 1))}
                className="px-6 py-2.5 bg-gradient-to-r from-[#1A1836] to-[#622347] text-white font-extrabold text-xs rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-md cursor-pointer border-none"
              >
                {t("Suivant")} <ArrowRight className="w-4 h-4 text-[#E99856]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#E99856] to-[#d8823e] text-[#1A1836] font-extrabold text-xs rounded-xl hover:brightness-105 transition-all flex items-center gap-2 shadow-md cursor-pointer border-none"
              >
                {loading ? t("Envoi en cours...") : t("Soumettre mon dossier boutique")} <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
