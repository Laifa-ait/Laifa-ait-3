import React from "react";
import { Handshake } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FooterBottomBarProps {
  supportEmail: string;
}

export const FooterBottomBar: React.FC<FooterBottomBarProps> = ({
  supportEmail,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#E0B4B2]">
      <div className="flex items-center gap-2 text-center sm:text-start">
        <span className="font-semibold text-[11px] text-white">
          © {new Date().getFullYear()}{" "}
          {t("footer_copyright") ||
            "Olmart Marketplace Algérie. Tous droits réservés."}
        </span>
        {supportEmail && (
          <span className="text-[10px] text-[#E99856] font-mono hidden sm:inline">
            · {supportEmail}
          </span>
        )}
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161429] border border-[#E99856]/30 text-[10px] font-bold text-[#E0B4B2] shadow-sm">
        <Handshake className="w-3.5 h-3.5 text-[#E99856] shrink-0" />
        <span>Plateforme d&apos;intermédiation Acheteurs & Vendeurs indépendants</span>
      </div>
    </div>
  );
};
