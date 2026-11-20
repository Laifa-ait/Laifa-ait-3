import React from "react";
import { ArrowLeft, Mail, MailCheck, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PasswordResetSentViewProps {
  userEmail: string;
  resendCooldown: number;
  resetSending: boolean;
  onResend: () => void;
  onBackToForm: () => void;
  onClose: () => void;
}

export const PasswordResetSentView: React.FC<PasswordResetSentViewProps> = ({
  userEmail,
  resendCooldown,
  resetSending,
  onResend,
  onBackToForm,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 overflow-y-auto space-y-5 text-left">
      <div className="flex flex-col items-center text-center space-y-3 pt-1">
        <div className="w-14 h-14 rounded-2xl bg-[#e9f4f1] border border-[#0d5c4b]/15 text-[#0d5c4b] flex items-center justify-center">
          <MailCheck className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h4 className="text-base font-semibold text-slate-900">
            {t("Lien de réinitialisation envoyé")}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            {t("Nous avons envoyé un email sécurisé à usage unique à l'adresse associée à votre compte :")}
          </p>
        </div>

        <div className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold">
          <Mail className="w-3.5 h-3.5 text-[#0d5c4b] shrink-0" />
          <span className="truncate">{userEmail}</span>
        </div>
      </div>

      <ol className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-2.5 text-xs text-slate-600">
        <li className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-800 font-semibold text-[11px] flex items-center justify-center shrink-0">
            1
          </span>
          <span className="leading-relaxed">
            {t("Ouvrez votre boîte de réception (pensez à vérifier vos courriers indésirables / spams).")}
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-800 font-semibold text-[11px] flex items-center justify-center shrink-0">
            2
          </span>
          <span className="leading-relaxed">
            {t("Cliquez sur le lien sécurisé pour choisir votre nouveau mot de passe.")}
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-800 font-semibold text-[11px] flex items-center justify-center shrink-0">
            3
          </span>
          <span className="leading-relaxed">
            {t("Revenez sur Olmart et connectez-vous avec votre nouveau mot de passe.")}
          </span>
        </li>
      </ol>

      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-5 rounded-xl bg-[#0d5c4b] hover:bg-[#084236] text-white text-sm font-medium transition-colors cursor-pointer border-none shadow-xs"
        >
          {t("Compris, fermer")}
        </button>

        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <button
            type="button"
            onClick={onBackToForm}
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 bg-transparent border-none p-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("Retour au formulaire")}</span>
          </button>

          <button
            type="button"
            disabled={resetSending || resendCooldown > 0}
            onClick={onResend}
            className="inline-flex items-center gap-1.5 font-medium text-[#0d5c4b] hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed bg-transparent border-none p-0 cursor-pointer tabular-nums"
          >
            {resetSending && <RefreshCw className="w-3 h-3 animate-spin" />}
            <span>
              {resetSending
                ? t("Envoi...")
                : resendCooldown > 0
                  ? `${t("Renvoyer dans")} ${resendCooldown}s`
                  : t("Renvoyer l'email")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
