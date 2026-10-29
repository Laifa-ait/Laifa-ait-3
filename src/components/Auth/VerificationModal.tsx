import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiPost } from "../../lib/api";
import { safeLogger } from "../../utils/logger";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  method: "email" | "sms";
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, method }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await apiPost("/api/v1/auth/2fa/verify", { code: code.trim() });
      toast.success(t("Compte vérifié avec succès !"));
      setCode("");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      safeLogger.warn("Failed to verify code", { err: msg });
      toast.error(t("Code invalide ou expiré."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] bg-[#1A1836]/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-[#E0B4B2]/40 relative"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF7F8] hover:bg-[#E0B4B2]/30 text-[#1A1836] flex items-center justify-center cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 bg-gradient-to-br from-[#1A1836] to-[#622347] text-[#E99856] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-[#1A1836] text-center mb-1.5">
              {t("Vérification 2FA")}
            </h3>
            <p className="text-xs text-zinc-500 text-center mb-6">
              {t("Entrez le code à 6 chiffres reçu par")} {method === "email" ? "e-mail" : "SMS"}.
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="w-full text-center text-2xl font-black tracking-[0.4em] py-4 bg-[#FAF7F8] border border-[#E0B4B2]/60 rounded-2xl mb-6 outline-none focus:border-[#A54055] text-[#1A1836]"
              placeholder="000000"
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full py-3.5 bg-gradient-to-r from-[#1A1836] to-[#42164B] hover:from-[#42164B] hover:to-[#622347] text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer border-none shadow-md"
            >
              {loading ? t("Vérification...") : t("Valider le code")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
