import React, { useState, useEffect, useCallback } from "react";
import { Save, Info, ShieldCheck, Mail, Scale } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AdminPageHeader } from "../../components/ui/Admin/AdminPageHeader";
import { Button } from "../../components/ui/Button";
import { apiGet, apiPost } from "../../lib/api";

interface GlobalSettingsPayload {
  aboutText?: string;
  registrationRules?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  supportEmail?: string;
}

export const SettingsAdmin: React.FC = () => {
  const { t } = useTranslation();
  const [aboutText, setAboutText] = useState("");
  const [registrationRules, setRegistrationRules] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [refundPolicy, setRefundPolicy] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<{ success?: boolean; data?: GlobalSettingsPayload }>("/api/v1/settings/global");
      const data = res?.data || (res as GlobalSettingsPayload);
      if (data) {
        if (data.aboutText) setAboutText(data.aboutText);
        if (data.registrationRules) setRegistrationRules(data.registrationRules);
        if (data.privacyPolicy) setPrivacyPolicy(data.privacyPolicy);
        if (data.refundPolicy) setRefundPolicy(data.refundPolicy);
        if (data.supportEmail) setSupportEmail(data.supportEmail);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Impossible de charger les paramètres globaux.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!aboutText.trim()) {
      toast.error("Le texte À propos ne peut pas être vide.");
      return;
    }

    setIsSaving(true);
    try {
      await apiPost("/api/v1/settings/global", {
        aboutText,
        registrationRules,
        privacyPolicy,
        refundPolicy,
        supportEmail,
      });
      toast.success("Paramètres globaux enregistrés avec succès.");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erreur lors de l'enregistrement des paramètres.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <AdminPageHeader
        title={t("Paramètres Généraux & Gouvernance Légale")}
        subtitle={t("Configurez les chartes légales, coordonnées de support et règles de la marketplace Olmart.")}
        actions={
          <Button onClick={handleSave} disabled={isSaving} isLoading={isSaving} icon={Save}>
            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        }
      />

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-zinc-100 rounded-2xl w-full" />
          <div className="h-40 bg-zinc-100 rounded-2xl w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#A54055]/10 flex items-center justify-center text-[#A54055]">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-base text-[#1A1836]">{t("À propos d'Olmart")}</h2>
                <p className="text-xs font-medium text-zinc-500">
                  {t("Présentation officielle affichée sur les pages d'information et le menu mobile.")}
                </p>
              </div>
            </div>

            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder={t("Texte 'À propos d'Olmart'...")}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#A54055] font-medium text-sm min-h-[150px]"
            />
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E99856]/15 flex items-center justify-center text-[#A54055]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-base text-[#1A1836]">{t("Email de Support & Contact")}</h2>
                <p className="text-xs font-medium text-zinc-500">
                  {t("Adresse officielle de contact affichée dans le pied de page et les notifications.")}
                </p>
              </div>
            </div>

            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="Ex: support@olmart.dz"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#A54055] font-medium text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-sans font-bold text-base text-[#1A1836]">{t("Politique de Confidentialité")}</h2>
                  <p className="text-xs font-medium text-zinc-500">{t("Protection des données personnelles.")}</p>
                </div>
              </div>

              <textarea
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                placeholder={t("Texte de la politique de confidentialité...")}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#A54055] font-medium text-sm min-h-[180px]"
              />
            </div>

            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-sans font-bold text-base text-[#1A1836]">{t("Politique de Retour & Litiges")}</h2>
                  <p className="text-xs font-medium text-zinc-500">{t("Conditions de médiation et remboursement.")}</p>
                </div>
              </div>

              <textarea
                value={refundPolicy}
                onChange={(e) => setRefundPolicy(e.target.value)}
                placeholder={t("Texte de la politique de remboursement...")}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#A54055] font-medium text-sm min-h-[180px]"
              />
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#42164B]/10 flex items-center justify-center text-[#42164B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-base text-[#1A1836]">{t("Conditions Générales d'Utilisation (CGU)")}</h2>
                <p className="text-xs font-medium text-zinc-500">
                  {t("Règles d'inscription acceptées par les acheteurs et marchands indépendants.")}
                </p>
              </div>
            </div>

            <textarea
              value={registrationRules}
              onChange={(e) => setRegistrationRules(e.target.value)}
              placeholder={t("Texte des conditions d'utilisation...")}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#A54055] font-medium text-sm min-h-[160px]"
            />
          </div>

          <div className="bg-[#1A1836] text-white rounded-3xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E99856] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                {t("Modèle de Responsabilité Marketplace Direct Vendeur")}
              </h3>
              <p className="text-xs text-[#E0B4B2]/90 leading-relaxed">
                Olmart agit exclusivement comme tiers technologique de mise en relation sur les 69 Wilayas. Chaque marchand indépendant assume la gestion de ses stocks, ses tarifs et ses expéditions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
