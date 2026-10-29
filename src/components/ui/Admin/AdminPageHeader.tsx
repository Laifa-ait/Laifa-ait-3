import React from "react";
import { motion } from "motion/react";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="min-w-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold tracking-tight text-[#1A1836] rtl:tracking-normal break-words">
          {title}
        </h2>
        {subtitle && <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">{subtitle}</p>}
      </motion.div>
      {actions && (
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center gap-2.5 shrink-0"
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
};

