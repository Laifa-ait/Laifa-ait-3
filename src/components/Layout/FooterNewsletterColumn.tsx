import React, { useState } from "react";
import { Sparkles, Mail, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { subscribeToNewsletter } from "../../services/newsletterService";
import { safeLogger } from "../../utils/logger";

export const FooterNewsletterColumn: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error(
        t("Veuillez vous connecter pour vous inscrire à la newsletter.") ||
          "Veuillez vous connecter pour vous inscrire à la newsletter."
      );
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      toast.error(t("invalid_email") || "Veuillez entrer un email valide");
      return;
    }

    setIsSubmitting(true);
    try {
      await subscribeToNewsletter(email);
      toast.success(t("newsletter_success") || "Inscription réussie aux alertes Olmart !");
      setEmail("");
    } catch (error: unknown) {
      safeLogger.error("Erreur lors de l'inscription à la newsletter", {
        err: error instanceof Error ? error.message : String(error),
      });
      if (error instanceof Error && error.message === "ALREADY_SUBSCRIBED") {
        toast.error(t("already_subscribed") || "Vous êtes déjà inscrit !");
      } else {
        toast.error(t("error_try_later") || "Erreur, veuillez réessayer ultérieurement");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg:col-span-4 space-y-3">
      <div className="p-4 rounded-2xl bg-[#161429] border border-white/10 shadow-lg shadow-black/40 space-y-3">
        <h5 className="text-xs font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E99856]" />
          <span>{t("footer_offers_app_heading") || "Restez Informé"}</span>
        </h5>

        <p className="text-[11px] text-[#E0B4B2] leading-normal font-medium">
          {t(
            "footer_newsletter_promo_desc",
            "Recevez les meilleures offres des boutiques partenaires chaque semaine."
          )}
        </p>

        <form className="flex gap-2" onSubmit={handleNewsletterSubmit}>
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-[#E99856] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("footer_email_placeholder") || "Votre adresse email"}
              className="w-full bg-[#0D0C1A] border border-white/15 pl-9 pr-3 py-2.5 text-xs text-white rounded-xl focus:outline-none focus:border-[#E99856] transition-all placeholder:text-[#E0B4B2]/60"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#E99856] to-[#A54055] hover:from-[#f3a668] hover:to-[#b84960] text-white font-black px-4 py-2.5 rounded-xl text-xs transition-all border border-white/15 shadow-md cursor-pointer shrink-0 active:scale-95 disabled:opacity-50 flex items-center gap-1"
          >
            {isSubmitting ? (
              <span>...</span>
            ) : (
              <>
                <span>{t("footer_subscribe_btn") || "S'inscrire"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-white/10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center shadow-md">
            <QRCodeSVG value="https://olmart.dz" size={36} level="M" />
          </div>
          <div className="text-[11px] leading-tight">
            <p className="font-extrabold text-white text-xs">
              {t("footer_app_title") || "Application Olmart"}
            </p>
            <p className="text-[10px] text-[#E0B4B2] mt-0.5 font-medium">
              {t("footer_app_scan") || "Scannez pour naviguer sur mobile"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
