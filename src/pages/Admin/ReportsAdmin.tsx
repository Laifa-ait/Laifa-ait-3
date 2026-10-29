import React, { useState } from "react";
import { Download, FileText, BarChart3, TrendingUp, Users, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../lib/api";
import { exportToCSVNative } from "../../utils/csvExport";

interface ReportDefinition {
  code: "finances" | "orders" | "sellers" | "users";
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

export const ReportsAdmin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");
  const [generating, setGenerating] = useState<string | null>(null);

  const reports: ReportDefinition[] = [
    {
      code: "finances",
      title: "Rapport Financier",
      desc: "Toutes les transactions, demandes de retrait et commissions plateforme",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      code: "orders",
      title: "Export Commandes",
      desc: "Liste détaillée des commandes clients avec montants et statuts",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      code: "sellers",
      title: "Performance Vendeurs",
      desc: "Répertoire des boutiques partenaires, statuts KYC et Wilayas",
      icon: BarChart3,
      color: "text-[#A54055]",
      bg: "bg-rose-50",
    },
    {
      code: "users",
      title: "Base Utilisateurs & B2B",
      desc: "Comptes acheteurs, segments B2C/B2B, artisans et rôles actifs",
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const downloadReport = async (report: ReportDefinition) => {
    setGenerating(report.code);
    const toastId = toast.loading(
      isArabic
        ? `جاري إنشاء وجمع بيانات ${report.title}...`
        : `Extraction des données pour "${report.title}"...`
    );

    try {
      const res = await apiGet<{
        success: boolean;
        headers: string[];
        rows: (string | number)[][];
        filename: string;
        error?: string;
      }>(`/api/v1/admin/reports/export?type=${encodeURIComponent(report.code)}`);

      if (res && res.success) {
        exportToCSVNative(res.headers, res.rows, res.filename);
        toast.success(
          isArabic
            ? `تم تصدير ملف '${report.title}' بنجاح !`
            : `Rapport "${report.title}" (${res.rows.length} lignes) exporté !`,
          { id: toastId }
        );
      } else {
        throw new Error(res.error || "Erreur lors de la génération du rapport");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur serveur";
      toast.error(
        isArabic ? `حدث خطأ أثناء تصدير التقرير: ${msg}` : `Erreur lors de l'exportation : ${msg}`,
        { id: toastId }
      );
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-2">
        <h2 className="text-3xl font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950 uppercase">
          {t("Exports & Rapports Comptables")}
        </h2>
        <p className="text-zinc-500 font-medium text-sm">
          {t("Générez des extractions CSV/Excel certifiées depuis la base Firestore pour la comptabilité et le pilotage.")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report, idx) => {
          const isThisLoading = generating === report.code;

          return (
            <div
              key={report.code}
              className="bg-white p-6 rounded-[2rem] border border-zinc-200/80 shadow-sm flex flex-col justify-between gap-4 hover:border-[#A54055]/40 transition-all"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.bg} ${report.color}`}>
                  <report.icon className="w-6 h-6" />
                </div>
                <div className="min-h-[72px]">
                  <h3 className="font-sans font-bold text-base text-zinc-900">{t(report.title)}</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">{t(report.desc)}</p>
                </div>
              </div>
              <button
                onClick={() => void downloadReport(report)}
                disabled={generating !== null}
                className="mt-4 px-5 py-3 bg-[#1A1836] hover:bg-[#42164B] disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-widest rtl:tracking-normal text-[10px] flex items-center gap-2 w-full justify-center transition-colors cursor-pointer"
                id={`btn-report-${idx}`}
              >
                {isThisLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#E99856]" />
                ) : (
                  <Download className="w-4 h-4 text-[#E99856]" />
                )}
                {isThisLoading ? t("Extraction...") : t("Télécharger CSV")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
