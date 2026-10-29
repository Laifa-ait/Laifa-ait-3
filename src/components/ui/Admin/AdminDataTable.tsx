import React from "react";
import { motion } from "motion/react";

export interface Column<T> {
  header: React.ReactNode;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  mobileLabel?: string;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function AdminDataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyState,
  onRowClick,
  isLoading,
}: AdminDataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl md:rounded-3xl border border-zinc-100 shadow-sm p-8 md:p-10 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#A54055] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl md:rounded-3xl border border-zinc-100 shadow-sm p-8 md:p-12 text-center flex flex-col items-center justify-center">
        {emptyState || (
          <div className="text-zinc-400 font-bold text-sm">Aucune donnée disponible.</div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
      {/* Vue Mobile : Cartes empilées ergonomiques (aucun débordement horizontal) */}
      <div className="md:hidden divide-y divide-zinc-100">
        {data.map((item, rowIdx) => (
          <motion.div
            key={keyExtractor(item)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(rowIdx * 0.03, 0.25) }}
            onClick={() => onRowClick?.(item)}
            className={`p-4 space-y-2.5 transition-colors ${
              onRowClick ? "cursor-pointer active:bg-zinc-50" : ""
            }`}
          >
            {columns.map((col, colIdx) => {
              const cellValue =
                typeof col.accessor === "function"
                  ? col.accessor(item)
                  : (item[col.accessor] as React.ReactNode);
              const isHeaderString = typeof col.header === "string";

              return (
                <div
                  key={colIdx}
                  className="flex items-start justify-between gap-3 text-xs tabular-nums"
                >
                  <div className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider shrink-0 pt-0.5 max-w-[42%]">
                    {col.mobileLabel || (isHeaderString ? col.header : colIdx === 0 ? "Sélection" : col.header)}
                  </div>
                  <div className="text-right font-medium text-zinc-800 min-w-0 flex-1 flex justify-end">
                    {cellValue}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ))}
      </div>

      {/* Vue Desktop & Tablette : Tableau haute densité */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-50/80 border-b border-zinc-100">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-5 py-4 text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100/80 tabular-nums">
            {data.map((item, rowIdx) => (
              <motion.tr
                key={keyExtractor(item)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(rowIdx * 0.03, 0.25) }}
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-zinc-50/70 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-5 py-4 ${col.className || ""}`}>
                    {typeof col.accessor === "function"
                      ? col.accessor(item)
                      : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

