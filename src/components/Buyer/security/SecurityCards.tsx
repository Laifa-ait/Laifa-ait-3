import React from "react";
import {
  Key,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Mail,
  Phone,
  Laptop,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthUser as User, UserProfile } from "../../../domains/user/user.types";

interface SecurityCardsProps {
  currentUser: User | null;
  userProfile: UserProfile | null;
  onOpenPasswordModal: () => void;
  onOpen2FAModal?: () => void;
  onOpenEmailModal: () => void;
  onOpenPhoneModal: () => void;
}

export const SecurityCards: React.FC<SecurityCardsProps> = ({
  currentUser,
  userProfile,
  onOpenPasswordModal,
  onOpen2FAModal,
  onOpenEmailModal,
  onOpenPhoneModal,
}) => {
  const { t } = useTranslation();

  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
  const browserName = /Chrome/i.test(userAgent)
    ? "Chrome"
    : /Safari/i.test(userAgent)
    ? "Safari"
    : /Firefox/i.test(userAgent)
    ? "Firefox"
    : "Navigateur Web";

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1A1836] via-[#42164B] to-[#622347] border border-[#A54055]/30 rounded-3xl p-5 flex items-start gap-4 text-white shadow-md">
        <div className="w-10 h-10 rounded-xl bg-[#E99856]/20 text-[#E99856] flex items-center justify-center shrink-0 border border-[#E99856]/30">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-[#E99856]">
            {t("Votre compte Olmart est sécurisé et protégé")}
          </h4>
          <p className="text-xs text-[#E0B4B2] leading-relaxed">
            {t(
              "Transactions protégées par cryptographie ACID, synchronisation Firebase Auth en temps réel et contrôle strict anti-IDOR."
            )}
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E0B4B2]/40 rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-[#FAF7F8]">
          <h3 className="text-base font-extrabold text-[#1A1836]">
            {t("Comment vous vous connectez à Olmart")}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t("Options de connexion, double authentification 2FA et méthodes de récupération.")}
          </p>
        </div>

        <div className="divide-y divide-[#FAF7F8]">
          <button
            type="button"
            onClick={onOpenPasswordModal}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#FAF7F8] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1A1836]/10 text-[#1A1836] flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                  {t("Mot de passe")}
                </span>
                <p className="text-sm font-extrabold text-[#1A1836]">••••••••</p>
                <p className="text-xs text-zinc-500">{t("Modifier ou réinitialiser votre mot de passe Firebase")}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={onOpen2FAModal}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#FAF7F8] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E99856]/15 text-[#E99856] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                  {t("Validation en deux étapes (2FA / OTP)")}
                </span>
                <p className="text-sm font-extrabold text-[#1A1836] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {userProfile?.twoFactorEnabled
                    ? t("Activée • Code OTP & Codes de secours")
                    : t("Configurer ou tester le code OTP par Email")}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={onOpenEmailModal}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#FAF7F8] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#A54055]/10 text-[#A54055] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                  {t("Adresse e-mail principale")}
                </span>
                <p className="text-sm font-extrabold text-[#1A1836]">{currentUser?.email}</p>
                <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("Vérifiée et protégée")}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={onOpenPhoneModal}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#FAF7F8] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#622347]/10 text-[#622347] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                  {t("Numéro de téléphone de récupération")}
                </span>
                <p className="text-sm font-extrabold text-[#1A1836]">
                  {userProfile?.phone || (currentUser?.phoneNumber as string) || t("Ajouter un numéro (+213)")}
                </p>
                <p className="text-xs text-zinc-500">{t("Utilisé pour le suivi des livraisons et la sécurité")}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E0B4B2]/40 rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-[#FAF7F8]">
          <h3 className="text-base font-extrabold text-[#1A1836]">{t("Vos appareils")}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t("Appareils actuellement connectés à votre compte Olmart.")}
          </p>
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F8] border border-[#E0B4B2]/40 text-[#622347] flex items-center justify-center shrink-0">
              {isMobile ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-[#1A1836]">
                  {browserName} • {isMobile ? "Smartphone" : "Ordinateur"}
                </p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {t("Cet appareil")}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                {t("Session active • Algérie • Sécurisée via Firebase Bearer Token")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E0B4B2]/40 rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-[#FAF7F8]">
          <h3 className="text-base font-extrabold text-[#1A1836]">
            {t("Activité et sécurité récente")}
          </h3>
        </div>
        <div className="divide-y divide-[#FAF7F8] text-xs text-zinc-600">
          <div className="px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#A54055]" />
              <span>{t("Connexion récente authentifiée")}</span>
            </div>
            <span className="text-emerald-700 font-bold">{t("Sécurisée")}</span>
          </div>
          <div className="px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t("Protection anti-IDOR et jeton Firebase actif")}</span>
            </div>
            <span className="text-emerald-700 font-bold">{t("Conforme")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
