import React from "react";

export interface AutoInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightAddon?: string;
}

export const AutoInput = React.forwardRef<HTMLInputElement, AutoInputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightAddon,
      id,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold text-slate-900 tracking-wide select-none"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#0B1730] focus-visible:border-[#0B1730] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
              leftIcon ? "pl-10" : ""
            } ${rightAddon ? "pr-14" : ""} ${
              error
                ? "border-red-400 focus-visible:ring-red-500 focus-visible:border-red-500"
                : "border-slate-300 hover:border-slate-400"
            } ${className}`}
            {...props}
          />

          {rightAddon && (
            <span className="absolute right-3.5 text-xs font-semibold text-slate-500 pointer-events-none select-none">
              {rightAddon}
            </span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600 font-medium">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

AutoInput.displayName = "AutoInput";
