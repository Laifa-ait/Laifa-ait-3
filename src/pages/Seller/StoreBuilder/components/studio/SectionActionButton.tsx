import React from "react";

interface SectionActionButtonProps {
  label: string;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function SectionActionButton({
  label,
  disabled = false,
  danger = false,
  children,
  onClick,
}: SectionActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex h-9 w-9 shrink-0 items-center justify-center cursor-pointer",
        "rounded-lg transition-colors",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[#F97316]",
        danger
          ? "text-[#DC2626] hover:bg-red-50"
          : "text-[#475467] hover:bg-[#FFF1E7] hover:text-[#EA580C]",
        "disabled:cursor-not-allowed disabled:opacity-30",
        "max-[767px]:h-11 max-[767px]:w-11",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
