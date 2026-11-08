import React from "react";
import {
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  CustomPageSection,
  CustomPageTheme,
  SellerStoreConfig,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import {
  AuditAutoFixType,
  buildStoreQualityReport,
} from "../../utils/storeQualityAuditor";

interface PreviewAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: CustomPageSection[];
  theme: CustomPageTheme;
  products?: Product[];
  storeConfig?: SellerStoreConfig | null;
  shopName?: string;
  shopSlug?: string;
}

export const PreviewAuditModal: React.FC<PreviewAuditModalProps> = ({
  isOpen,
  onClose,
  sections,
  theme,
  products = [],
  storeConfig,
  shopName,
  shopSlug,
}) => {
  if (!isOpen) return null;

  const report = buildStoreQualityReport({
    sections,
    theme,
    products,
    storeConfig,
    shopName,
    shopSlug,
  });

  const triggerAutoFix = (fixType: AuditAutoFixType) => {
    window.dispatchEvent(
      new CustomEvent("studio:audit-autofix", { detail: { fixType } })
    );
    if (fixType === "open-seo") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-[#F8FBFC] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#011C40]">
                Audit Qualité, Accessibilité WCAG & SEO
              </h3>
              <p className="text-[11px] text-slate-500">
                Contraste WCAG 2.1, Alt-Text, Poids Médias, Mobile, SEO & 69 Wilayas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#F0F7FA] to-[#F8FBFC] border border-[#54ACBF]/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#023859] uppercase tracking-wider block">
                Score Technique & Conversion
              </span>
              <p className="text-2xl font-black text-[#011C40] mt-0.5">
                {report.overallScore} / 100
              </p>
              <p className="text-[11px] text-[#26658C] mt-1">
                {report.overallScore >= 85
                  ? "Votre vitrine respecte les standards WCAG, SEO et Mobile."
                  : "Corrigez les points signalés en Échec ou Avertissement ci-dessous."}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-[#54ACBF]/40 flex items-center justify-center text-[#023859]">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-2.5">
            {report.checks.map((check) => {
              const isPass = check.status === "pass";
              const isFail = check.status === "fail";
              const badgeColor = isPass
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : isFail
                ? "text-rose-700 bg-rose-50 border-rose-200"
                : "text-amber-700 bg-amber-50 border-amber-200";

              return (
                <div
                  key={check.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3"
                >
                  {isPass ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  ) : isFail ? (
                    <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 text-xs space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-[#011C40]">{check.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md border text-[10.5px] font-bold ${badgeColor}`}
                      >
                        {check.badgeText}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {check.summary}
                    </p>
                    {check.autoFixActions && check.autoFixActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {check.autoFixActions.map((act) => (
                          <button
                            key={act.fixType}
                            type="button"
                            onClick={() => triggerAutoFix(act.fixType)}
                            className="px-2.5 py-1 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Zap className="w-3 h-3" />
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl bg-[#023859] hover:bg-[#011C40] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Fermer l&apos;audit
          </button>
        </div>
      </div>
    </div>
  );
};
