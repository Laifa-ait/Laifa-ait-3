import React, { useCallback, useRef } from "react";
import { Bold, Italic, Underline, List, Eraser } from "lucide-react";
import { sanitizeHTML } from "../../utils/sanitization";

interface LazyRichTextEditorProps {
  theme?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const LazyRichTextEditor: React.FC<LazyRichTextEditorProps> = ({
  onChange,
  value,
  placeholder = "Écrire votre message...",
  className = "",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const plainDisplayValue = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<\/li>\s*<li>/gi, "\n• ")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, "");

  const emitSanitized = useCallback(
    (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed) {
        onChange("");
        return;
      }
      const htmlParagraphs = rawText
        .split(/\n{2,}/)
        .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
        .join("");
      onChange(sanitizeHTML(htmlParagraphs));
    },
    [onChange]
  );

  const wrapSelection = (openTag: string, closeTag: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = plainDisplayValue.slice(start, end) || "texte";
    const updated =
      plainDisplayValue.slice(0, start) +
      `${openTag}${selected}${closeTag}` +
      plainDisplayValue.slice(end);
    emitSanitized(updated);
  };

  return (
    <div className={`flex flex-col bg-white ${className}`}>
      <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-zinc-200 bg-zinc-50/80">
        <button
          type="button"
          onClick={() => wrapSelection("<strong>", "</strong>")}
          className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors cursor-pointer"
          title="Gras"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => wrapSelection("<em>", "</em>")}
          className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors cursor-pointer"
          title="Italique"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => wrapSelection("<u>", "</u>")}
          className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors cursor-pointer"
          title="Souligné"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => wrapSelection("<ul><li>", "</li></ul>")}
          className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors cursor-pointer"
          title="Liste à puces"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-zinc-200 mx-1" />
        <button
          type="button"
          onClick={() => onChange("")}
          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200/70 hover:text-red-600 transition-colors cursor-pointer"
          title="Effacer"
        >
          <Eraser className="w-3.5 h-3.5" />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        rows={4}
        value={plainDisplayValue}
        onChange={(e) => emitSanitized(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 text-xs sm:text-sm text-zinc-800 bg-transparent outline-none resize-y min-h-[110px]"
      />
    </div>
  );
};
