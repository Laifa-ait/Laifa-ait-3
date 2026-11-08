import React, { useState, useEffect, useRef } from "react";

export interface InlineEditConfig {
  sectionId: string;
  settingKey: string;
  subElement?: string;
  alsoUpdateSectionTitle?: boolean;
}

interface CanvasInlineTextProps {
  value: string;
  placeholder?: string;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4";
  multiline?: boolean;
  isEditable?: boolean;
  editConfig?: InlineEditConfig;
  className?: string;
  style?: React.CSSProperties;
  dir?: "rtl" | "ltr";
  onClick?: (e: React.MouseEvent) => void;
}

export function emitSectionSettingPatch(
  config: InlineEditConfig,
  nextValue: string
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("studio:patch-section-settings", {
      detail: {
        sectionId: config.sectionId,
        patch: {
          [config.settingKey]: nextValue,
          ...(config.alsoUpdateSectionTitle ? { __sectionTitle: nextValue } : {}),
        },
      },
    })
  );
}

export const CanvasInlineText: React.FC<CanvasInlineTextProps> = ({
  value,
  placeholder = "Cliquez pour saisir votre texte...",
  as: Tag = "span",
  multiline = false,
  isEditable = false,
  editConfig,
  className = "",
  style,
  dir,
  onClick,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(value);
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitChange = () => {
    setIsEditing(false);
    const trimmed = draftValue.trim();
    const finalVal = trimmed.length > 0 ? draftValue : value;
    setDraftValue(finalVal);
    if (editConfig && finalVal !== value) {
      emitSectionSettingPatch(editConfig, finalVal);
    }
  };

  const cancelChange = () => {
    setIsEditing(false);
    setDraftValue(value);
  };

  if (isEditable && editConfig && isEditing) {
    const sharedProps = {
      value: draftValue,
      dir,
      draggable: false,
      onDragStart: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      },
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
      onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const next = e.target.value;
        setDraftValue(next);
        emitSectionSettingPatch(editConfig, next);
      },
      onBlur: commitChange,
      onKeyDown: (e: React.KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === "Escape") {
          e.preventDefault();
          cancelChange();
        } else if (e.key === "Enter" && (!multiline || e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          commitChange();
        }
      },
      style: {
        ...style,
        minWidth: "120px",
      },
      className: `${className} bg-white/95 text-slate-900 ring-2 ring-[#023859] rounded-md px-2 py-0.5 outline-none shadow-sm`,
      "data-testid": `canvas-inline-input-${editConfig.settingKey}`,
    };

    if (multiline) {
      return (
        <textarea
          {...sharedProps}
          ref={(el) => {
            inputRef.current = el;
          }}
          rows={3}
        />
      );
    }

    return (
      <input
        {...sharedProps}
        type="text"
        ref={(el) => {
          inputRef.current = el;
        }}
      />
    );
  }

  return (
    <Tag
      dir={dir}
      style={style}
      title={isEditable && editConfig ? "Cliquez pour modifier ce texte directement" : undefined}
      data-testid={editConfig ? `canvas-inline-text-${editConfig.settingKey}` : undefined}
      onClick={(e) => {
        onClick?.(e);
        if (isEditable && editConfig) {
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
      className={`${className} ${
        isEditable && editConfig
          ? "cursor-text hover:ring-1 hover:ring-[#54ACBF]/80 rounded transition-all"
          : ""
      }`}
    >
      {value || placeholder}
    </Tag>
  );
};
