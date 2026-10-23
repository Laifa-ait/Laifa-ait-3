import React, { useState } from "react";
import { Info } from "lucide-react";

interface ProductFieldProps {
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  badge?: string;
}

export const ProductField: React.FC<ProductFieldProps> = ({
  label,
  required = false,
  helpText,
  error,
  children,
  className = "",
  badge,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
          {helpText && (
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5 rounded-full inline-flex items-center"
              aria-label="Aide"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
        </label>
        {badge && (
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>

      {showHelp && helpText && (
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 leading-relaxed animate-in fade-in duration-200">
          {helpText}
        </div>
      )}

      <div>{children}</div>

      {error && (
        <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pt-0.5 animate-in fade-in">
          <span>⚠ {error}</span>
        </p>
      )}
    </div>
  );
};
