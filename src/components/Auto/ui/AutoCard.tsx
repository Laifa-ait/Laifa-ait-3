import React from "react";

export interface AutoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  as?: "article" | "div" | "section";
}

const PADDING_MAP = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8",
};

export const AutoCard = React.forwardRef<HTMLDivElement, AutoCardProps>(
  (
    {
      hoverable = false,
      padding = "md",
      as: Component = "div",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={`bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${
          hoverable
            ? "transition-all duration-200 hover:border-slate-300 hover:shadow-[0_10px_25px_-5px_rgba(11,23,48,0.08)]"
            : ""
        } ${PADDING_MAP[padding]} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

AutoCard.displayName = "AutoCard";
