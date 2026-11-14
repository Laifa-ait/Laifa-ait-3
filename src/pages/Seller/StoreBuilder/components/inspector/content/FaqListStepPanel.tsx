import React from "react";
import { Plus, Trash2, HelpCircle } from "lucide-react";

interface FaqListStepPanelProps {
  items: Array<Record<string, unknown>>;
  selectedSubElement: string | null;
  inputClass: string;
  onAdd: () => void;
  onUpdate: (index: number, patch: { question?: string; answer?: string }) => void;
  onDelete: (index: number) => void;
}

export const FaqListStepPanel: React.FC<FaqListStepPanelProps> = ({
  items,
  selectedSubElement,
  inputClass,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-[#011C40] flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#023859]" />
          <span>Questions / Réponses ({items.length}/24)</span>
        </h3>
        <button
          type="button"
          disabled={items.length >= 24}
          onClick={onAdd}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[11px] font-bold cursor-pointer disabled:opacity-40 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Ajouter</span>
        </button>
      </div>

      {items.map((item, index) => {
        const isHighlighted = selectedSubElement === `faq-${index}`;
        return (
          <div
            key={index}
            className={`space-y-2 rounded-xl border p-3 transition-all ${
              isHighlighted
                ? "border-[#023859] bg-[#F0F7FA]/60 ring-2 ring-[#54ACBF]/35"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex gap-2">
              <input
                value={String(item.question || "")}
                onChange={(e) => onUpdate(index, { question: e.target.value })}
                placeholder="Question"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => onDelete(index)}
                className="rounded-lg border border-rose-200 px-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <textarea
              rows={2}
              value={String(item.answer || "")}
              onChange={(e) => onUpdate(index, { answer: e.target.value })}
              placeholder="Réponse"
              className="w-full rounded-lg border border-[#E4E7EC] p-2.5 text-xs focus:border-[#023859] focus:outline-none"
            />
          </div>
        );
      })}
    </div>
  );
};
