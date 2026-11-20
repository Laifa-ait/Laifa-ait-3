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
    <div className="relative z-10 w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#B8C8C4]">
      <div className="flex items-center gap-2 text-center sm:text-start">
        <span className="font-semibold text-[11px] text-white">
          © {new Date().getFullYear()}{" "}
          {t(
            "footer_copyright",
            "Olmart Marketplace Algérie. Tous droits réservés."
          )}
        </span>
        {supportEmail && (
          <span className="text-[10px] text-[#E59A42] font-mono hidden sm:inline">
            · {supportEmail}
          </span>
        )}
      </div>

      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#B8C8C4]">
        <Handshake className="w-3.5 h-3.5 text-[#E59A42] shrink-0" />
        <span>
          {t(
            "footer_intermediation_badge",
            "Plateforme d'intermédiation Acheteurs & Vendeurs indépendants"
          )}
        </span>
      </div>
    </div>
  );
};
