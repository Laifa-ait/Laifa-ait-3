import React from "react";
import { ShieldCheck, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { BadgeSemanticType } from "./tokens";

export interface AutoBadgeProps {
  type: BadgeSemanticType;
  label: string;
  subtext?: string;
  className?: string;
}

export const AutoBadge: React.FC<AutoBadgeProps> = ({
  type,
  label,
  subtext,
  className = "",
}) => {
  if (type === "declared_document") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/90 ${className}`}
        title="Document déclaré par le vendeur, en attente de vérification formelle"
      >
        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
        <span className="font-semibold">{label}</span>
        {subtext ? (
          <span className="text-[10px] text-slate-500 font-normal">({subtext})</span>
        ) : (
          <span className="text-[10px] text-slate-400 font-normal">· Déclaré</span>
        )}
      </div>
    );
  }

  if (type === "verified_document") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#0B1730] text-white border border-[#23416A] shadow-2xs ${className}`}
        title="Document vérifié et validé par un inspecteur Olmart"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#D9F66F] shrink-0" aria-hidden="true" />
        <span>{label}</span>
        <span className="text-[10px] text-[#D9F66F] font-bold tracking-wide uppercase">
          {subtext || "Certifié"}
        </span>
      </div>
    );
  }

  if (type === "sponsored") {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300/80 shadow-2xs ${className}`}
        title="Mise en avant sponsorisée par le vendeur"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
        <span className="tracking-tight uppercase text-[10px]">{label || "Sponsorisé"}</span>
      </div>
    );
  }

  if (type === "status") {
    const isSold = label.toLowerCase().includes("vendu");
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
          isSold
            ? "bg-slate-200 text-slate-600 border border-slate-300"
            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
        } ${className}`}
      >
        <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </div>
    );
  }

  // Technical metadata: clean, unboxed text per zero-pill discipline
  return (
    <span
      className={`inline-flex items-center text-xs text-slate-600 font-medium ${className}`}
    >
      {label}
    </span>
  );
};
