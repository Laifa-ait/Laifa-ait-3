import React, { useEffect, useState } from "react";
import { X, Key, Eye, EyeOff, Check, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  getCurrentAuthUser,
  reauthenticateUser,
  updateUserPassword,
  sendPasswordReset,
} from "../../../services/auth.service";
import { PasswordResetSentView } from "./PasswordResetSentView";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  userEmail,
}) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleClose = (): void => {
    setResetSent(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  const handlePasswordSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      toast.error(t("Veuillez saisir votre mot de passe actuel."));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("Le nouveau mot de passe doit comporter au moins 6 caractères."));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("Les deux mots de passe ne correspondent pas."));
      return;
    }

    const fbUser = getCurrentAuthUser();
    if (!fbUser) {
      toast.error(t("Utilisateur non connecté."));
      return;
    }

    setLoading(true);
    try {
      await reauthenticateUser(fbUser, currentPassword);
      await updateUserPassword(fbUser, newPassword);
      toast.success(t("Votre mot de passe a été modifié avec succès !"));
      handleClose();
    } catch (err: unknown) {
      console.error("[Security] ❌ Password update error:", err);
      const authErr = err as { code?: string; message?: string };
      if (authErr.code === "auth/wrong-password" || authErr.code === "auth/invalid-credential") {
        toast.error(t("Mot de passe actuel incorrect."));
      } else if (authErr.code === "auth/weak-password") {
        toast.error(t("Le mot de passe choisi est trop faible."));
      } else {
        toast.error(authErr.message || t("Impossible de modifier le mot de passe."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (): Promise<void> => {
    if (!userEmail) {
      toast.error(t("Adresse email non disponible."));
      return;
    }
    setResetSending(true);
    try {
      await sendPasswordReset(userEmail);
      setResetSent(true);
      setResendCooldown(60);
    } catch (err: unknown) {
      console.error("[Security] ❌ Password reset error:", err);
      const authErr = err as { code?: string };
      if (authErr.code === "auth/too-many-requests") {
        toast.error(t("Trop de tentatives récentes. Veuillez patienter quelques minutes."));
      } else {
        toast.error(t("Impossible d'envoyer l'email de réinitialisation."));
      }
    } finally {
      setResetSending(false);
    }
  };

  const inputClass =
    "w-full ps-9 pe-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0d5c4b] focus:ring-2 focus:ring-[#0d5c4b]/15 text-slate-900 placeholder:text-slate-400 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            {resetSent ? t("Réinitialisation du mot de passe") : t("Modifier le mot de passe")}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("Fermer")}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {resetSent && userEmail ? (
          <PasswordResetSentView
            userEmail={userEmail}
            resendCooldown={resendCooldown}
            resetSending={resetSending}
            onResend={() => void handleForgotPassword()}
            onBackToForm={() => setResetSent(false)}
            onClose={handleClose}
          />
        ) : (
          <form onSubmit={handlePasswordSubmit} className="p-6 overflow-y-auto space-y-4 text-left">
            <p className="text-xs text-slate-500 leading-relaxed">
              {t("Choisissez un mot de passe robuste d'au moins 6 caractères contenant lettres, chiffres et symboles pour sécuriser votre compte.")}
            </p>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">{t("Mot de passe actuel")}</label>
              <div className="relative">
                <Key className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showCurrent ? "text" : "password"} required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 border-none bg-transparent cursor-pointer">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">{t("Nouveau mot de passe")}</label>
              <div className="relative">
                <Key className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showNew ? "text" : "password"} required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 border-none bg-transparent cursor-pointer">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">{t("Confirmer le nouveau mot de passe")}</label>
              <div className="relative">
                <Key className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showNew ? "text" : "password"} required value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                  className="w-full ps-9 pe-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0d5c4b] focus:ring-2 focus:ring-[#0d5c4b]/15 text-slate-900 placeholder:text-slate-400 transition-colors"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button" disabled={resetSending} onClick={() => void handleForgotPassword()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0d5c4b] hover:underline cursor-pointer border-none bg-transparent p-0 disabled:opacity-50"
              >
                {resetSending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{resetSending ? t("Envoi de l'email en cours...") : t("Mot de passe actuel oublié ? Envoyer un email de réinitialisation")}</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button type="button" onClick={handleClose} className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors cursor-pointer">
                {t("Annuler")}
              </button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-[#0d5c4b] hover:bg-[#084236] text-white text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 border-none">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{loading ? t("Mise à jour...") : t("Modifier le mot de passe")}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
