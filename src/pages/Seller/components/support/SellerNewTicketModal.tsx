import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SellerNewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  priority: string;
  onChangeSubject: (val: string) => void;
  onChangePriority: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
}

export const SellerNewTicketModal: React.FC<SellerNewTicketModalProps> = ({
  isOpen,
  onClose,
  subject,
  priority,
  onChangeSubject,
  onChangePriority,
  onSubmit,
  creating,
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#1A1836]/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#E0B4B2]/40 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-[#FAF7F8] bg-gradient-to-r from-[#1A1836] to-[#42164B] text-white flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold">{t("Ouvrir un ticket vendeur")}</h3>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 bg-white/10 text-white hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors border-none cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-extrabold text-[#622347] uppercase tracking-wider mb-2">
                  {t("Catégorie de la demande")}
                </label>
                <select
                  required
                  value={subject}
                  onChange={(e) => onChangeSubject(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-2xl outline-none text-sm font-semibold text-[#1A1836] focus:border-[#A54055] focus:bg-white transition-colors"
                >
                  <option value="" disabled>{t("Sélectionner un motif...")}</option>
                  <option value="Problème de livraison">{t("Problème de livraison")}</option>
                  <option value="Litige Client">{t("Litige Client")}</option>
                  <option value="Contestation Trust Score">{t("Contestation Trust Score (-10 pts)")}</option>
                  <option value="Problème Technique">{t("Problème Technique")}</option>
                  <option value="Facturation / Paiement">{t("Facturation / Paiement")}</option>
                  <option value="Autre">{t("Autre demande")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#622347] uppercase tracking-wider mb-2">
                  {t("Priorité")}
                </label>
                <select
                  value={priority}
                  onChange={(e) => onChangePriority(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-2xl outline-none text-sm font-semibold text-[#1A1836] focus:border-[#A54055] focus:bg-white transition-colors"
                >
                  <option value="low">{t("Basse - Information générale")}</option>
                  <option value="medium">{t("Moyenne - Problème mineur")}</option>
                  <option value="high">{t("Haute - Blocage critique / Litige")}</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={creating || !subject.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-[#A54055] to-[#622347] hover:brightness-110 text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{t("Créer le ticket")}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
