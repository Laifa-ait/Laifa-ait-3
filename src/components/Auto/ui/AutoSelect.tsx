import React from "react";
import { ChevronDown } from "lucide-react";

export interface AutoSelectOption {
  value: string;
  label: string;
}

export interface AutoSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: AutoSelectOption[];
  placeholder?: string;
}

export const AutoSelect = React.forwardRef<HTMLSelectElement, AutoSelectProps>(
  (
    {
      label,
      error,
      hint,
      options = [],
      placeholder,
      id,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-bold text-slate-900 tracking-wide select-none"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
            className={`w-full min-h-[44px] pl-3.5 pr-10 py-2.5 bg-white border rounded-xl text-sm text-slate-900 transition-colors appearance-none outline-none focus-visible:ring-2 focus-visible:ring-[#0B1730] focus-visible:border-[#0B1730] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer ${
              error
                ? "border-red-400 focus-visible:ring-red-500 focus-visible:border-red-500"
                : "border-slate-300 hover:border-slate-400"
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {children}
          </select>

          <span
            className="absolute right-3.5 text-slate-500 pointer-events-none flex items-center"
            aria-hidden="true"
          >
            <ChevronDown className="w-4 h-4" />
          </span>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="text-xs text-red-600 font-medium">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${selectId}-hint`} className="text-xs text-slate-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

AutoSelect.displayName = "AutoSelect";
