import React from "react";
import { HelpCircle } from "lucide-react";

interface ProductStepHeaderProps {
  stepNumber: number;
  totalSteps?: number;
  title: string;
  subtitle: string;
  whyExplanation?: string;
}

export const ProductStepHeader: React.FC<ProductStepHeaderProps> = ({
  stepNumber,
  totalSteps = 7,
  title,
  subtitle,
  whyExplanation,
}) => {
  return (
    <div className="space-y-2 mb-8">
      <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C75C1A] uppercase tracking-wider">
        <span>Étape {String(stepNumber).padStart(2, "0")} sur {String(totalSteps).padStart(2, "0")}</span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {title}
      </h2>
      <p className="text-sm sm:text-base text-slate-600 font-medium">
        {subtitle}
      </p>
      {whyExplanation && (
        <div className="pt-1 flex items-start gap-2 text-xs text-slate-500 bg-amber-50/60 border border-amber-200/50 rounded-xl px-3 py-2 max-w-2xl">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span><strong className="text-slate-700">Pourquoi ?</strong> {whyExplanation}</span>
        </div>
      )}
    </div>
  );
};
