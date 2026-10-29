import React from "react";
import { motion } from "motion/react";
import { XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SellerDocPreviewModalProps {
  previewDocUrl: string | null;
  onClose: () => void;
}

export const SellerDocPreviewModal: React.FC<SellerDocPreviewModalProps> = ({
  previewDocUrl,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!previewDocUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-6"
    >
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h4 className="text-xl font-sans font-bold text-[#1A1836]">
            {t("Aperçu du Document KYC")}
          </h4>
          <button
            onClick={onClose}
            className="p-2 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors border-none cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 bg-zinc-950 flex items-center justify-center p-4 relative">
          {previewDocUrl.includes(".pdf") ? (
            <iframe
              src={previewDocUrl}
              className="w-full h-full rounded-xl bg-white"
              title="Document Preview"
            />
          ) : (
            <img
              loading="lazy"
              src={previewDocUrl}
              className="max-w-full max-h-full object-contain"
              alt="Document Preview"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
