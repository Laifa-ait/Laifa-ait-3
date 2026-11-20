import React from "react";
import {
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  CustomPageSection,
  CustomPageTheme,
  SellerStoreConfig,
} from "../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../domains/product/product.types";
import {
  AuditAutoFixType,
  StoreQualityCheckResult,
  buildStoreQualityReport,
} from "../../utils/storeQualityAuditor";
import { CatalogLoadStatus } from "../../hooks/studioCatalogLoader";

interface PreviewAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: CustomPageSection[];
  theme: CustomPageTheme;
  products?: Product[];
  catalogStatus?: CatalogLoadStatus;
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
  catalogStatus = "loaded",
  storeConfig,
  shopName,
  shopSlug,
}) => {
  const report = React.useMemo(() => {
    if (!isOpen) return null;
    return buildStoreQualityReport({
      sections,
      theme,
      products,
      catalogStatus,
      storeConfig,
      shopName,
      shopSlug,
    });
  }, [isOpen, sections, theme, products, catalogStatus, storeConfig, shopName, shopSlug]);

  if (!isOpen || !report) return null;

  const triggerAutoFix = (fixType: AuditAutoFixType) => {
    window.dispatchEvent(
      new CustomEvent("studio:audit-autofix", { detail: { fixType } })
    );
    if (fixType === "open-seo" || fixType === "fix-contrast") {
      onClose();
    }
  };

  const handleNavigateToPanel = (check: StoreQualityCheckResult) => {
    if (check.targetSectionId) {
      window.dispatchEvent(
        new CustomEvent("studio:open-inspector-tab", {
          detail: { sectionId: check.targetSectionId, tab: "content" },
        })
      );
    } else if (check.targetNav) {
      window.dispatchEvent(
        new CustomEvent("studio:select-nav-mode", {
          detail: { mode: check.targetNav },
        })
      );
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
      data-testid="studio-quality-audit-modal"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--studio-border)] bg-[var(--studio-background)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[var(--studio-green)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--studio-black)]">
                Audit Qualité, Accessibilité WCAG & SEO
              </h3>
              <p className="text-[11px] text-slate-500">
                Contraste WCAG 2.1, Alt-Text, Poids Médias, Mobile, SEO & Catalogue
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l'audit"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="p-4 rounded-xl bg-[var(--studio-highlight-soft)] border border-[var(--studio-border)] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--studio-primary)] uppercase tracking-wider block">
                Score Technique & Conversion
              </span>
              <p className="text-2xl font-black text-[var(--studio-black)] mt-0.5 tabular-nums" data-testid="audit-overall-score">
                {report.overallScore} / 100
              </p>
              <p className="text-[11px] text-[var(--studio-muted)] mt-1">
                {report.overallScore >= 85
                  ? "Votre vitrine respecte les standards WCAG, SEO et Mobile."
                  : "Chaque point signalé ci-dessous est relié au panneau permettant de le corriger."}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-[var(--studio-border)] flex items-center justify-center text-[var(--studio-primary)]">
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
                  data-testid={`audit-check-${check.id}`}
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
                      <span className="font-bold text-[var(--studio-black)]">{check.title}</span>
                      <span className={`px-2 py-0.5 rounded-md border text-[10.5px] font-bold ${badgeColor}`}>
                        {check.badgeText}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {check.summary}
                    </p>
                    {!isPass && (check.targetNav || (check.autoFixActions && check.autoFixActions.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {check.targetNav && (
                          <button
                            type="button"
                            data-testid={`audit-nav-${check.id}`}
                            onClick={() => handleNavigateToPanel(check)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{check.targetLabel || "Ouvrir le panneau"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {check.autoFixActions?.map((act) => (
                          <button
                            key={act.fixType}
                            type="button"
                            data-testid={`audit-autofix-${act.fixType}`}
                            onClick={() => triggerAutoFix(act.fixType)}
                            className="px-2.5 py-1 rounded-lg bg-[var(--studio-primary)] hover:bg-[var(--studio-primary-hover)] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
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

        <div className="p-4 border-t border-[var(--studio-border)] bg-[var(--studio-background)] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl bg-[var(--studio-primary)] hover:bg-[var(--studio-primary-hover)] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Fermer l&apos;audit
          </button>
        </div>
      </div>
    </div>
  );
};
