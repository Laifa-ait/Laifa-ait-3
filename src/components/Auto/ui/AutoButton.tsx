import React from "react";
import { Loader2 } from "lucide-react";
import { ButtonVariant, ButtonSize } from "./tokens";

export interface AutoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-[#D9F66F] bg-gradient-to-r from-[#D9F66F] via-[#E2FB7D] to-[#C5E94F] hover:from-[#E2FB7D] hover:to-[#BEE545] text-[#0B1730] font-black shadow-[0_4px_14px_0_rgba(217,246,111,0.39)] hover:shadow-[0_6px_20px_rgba(217,246,111,0.55)] border-t border-white/50 border-b border-black/10 focus-visible:ring-[#0B1730]",
  secondary:
    "border border-[#172B4D] bg-white text-[#172B4D] hover:bg-slate-50 hover:border-[#0B1730] font-bold shadow-xs hover:shadow-md focus-visible:ring-[#172B4D]",
  dark:
    "bg-[#0B1730] bg-gradient-to-r from-[#0B1730] to-[#172B4D] hover:from-[#172B4D] hover:to-[#23416A] text-white font-bold shadow-md hover:shadow-lg border border-[#23416A] focus-visible:ring-[#D9F66F]",
  ghost:
    "bg-transparent hover:bg-slate-100 text-[#172B4D] font-semibold border border-transparent focus-visible:ring-[#172B4D]",
  danger:
    "border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold focus-visible:ring-red-600",
  whatsapp:
    "bg-[#25D366] bg-gradient-to-r from-[#25D366] to-[#20BA5A] hover:brightness-105 text-white font-bold shadow-[0_4px_14px_rgba(37,211,102,0.35)] border-t border-white/30 focus-visible:ring-[#25D366]",
  phone:
    "bg-[#0B1730] bg-gradient-to-r from-[#0B1730] to-[#172B4D] hover:from-[#172B4D] hover:to-[#23416A] text-white font-bold shadow-md hover:shadow-lg border border-[#23416A] focus-visible:ring-[#0B1730]",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "min-h-[38px] px-3.5 py-1.5 text-xs rounded-xl gap-1.5",
  md: "min-h-[44px] px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "min-h-[48px] px-6 py-3 text-base rounded-2xl gap-2.5",
};

export const AutoButton = React.forwardRef<HTMLButtonElement, AutoButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={`inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${
          VARIANT_STYLES[variant]
        } ${SIZE_STYLES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0 flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

AutoButton.displayName = "AutoButton";
