import React, { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { CleanupCategorySummary } from "../../types/firebaseCleanup";

interface FirebaseCleanupCategoryCardProps {
  category: CleanupCategorySummary;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export const FirebaseCleanupCategoryCard: React.FC<FirebaseCleanupCategoryCardProps> = ({
  category,
  selected,
  disabled,
  onToggle,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isEmpty = category.count === 0;

  return (
    <div
      className={`rounded-3xl border p-5 transition-all ${
        isEmpty
          ? "bg-zinc-50/70 border-zinc-200/70"
          : selected
            ? "bg-red-50/40 border-red-300 shadow-sm"
            : "bg-white border-zinc-200 hover:border-zinc-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <label className="flex items-start gap-3.5 cursor-pointer flex-1 min-w-0">
          <input
            type="checkbox"
            checked={selected && !isEmpty}
            disabled={disabled || isEmpty}
            onChange={onToggle}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500 disabled:opacity-40 cursor-pointer"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-zinc-900">{category.title}</h3>
              {category.riskLevel === "moderate" && !isEmpty && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-3 h-3" /> Vérifier avant purge
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{category.description}</p>
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              {category.collections.map((col) => (
                <span
                  key={col}
                  className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-mono text-[10px]"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        </label>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {isEmpty ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Propre (0)
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black">
              {category.count}
              {category.truncated ? "+" : ""} doc{category.count > 1 ? "s" : ""}
            </span>
          )}

          {category.samples.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              {expanded ? "Masquer aperçu" : "Voir aperçu"}
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {expanded && category.samples.length > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-200/70 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Exemples ciblés ({category.samples.length} affichés)
          </p>
          <ul className="space-y-1">
            {category.samples.map((sample) => (
              <li
                key={`${sample.collection}-${sample.id}`}
                className="text-xs text-zinc-700 flex items-center justify-between gap-3 bg-white/80 border border-zinc-200/60 rounded-xl px-3 py-1.5"
              >
                <span className="truncate font-medium">{sample.label}</span>
                <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                  {sample.collection}/{sample.id.slice(0, 14)}
                </span>
              </li>
            ))}
          </ul>
          {category.truncated && (
            <p className="text-[11px] font-medium text-amber-700 pt-1">
              Plus de 500 documents détectés : après cette purge, relancez un scan pour vider le lot suivant.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
