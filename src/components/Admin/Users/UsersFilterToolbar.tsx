import React from "react";
import { Search, ChevronDown, Download, UserCheck, UserX, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ALGERIA_WILAYAS } from "../../../constants";

interface UsersFilterToolbarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  roleFilter: string;
  setRoleFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  wilayaFilter: string;
  setWilayaFilter: (v: string) => void;
  sortByFilter: string;
  setSortByFilter: (v: string) => void;
  onExportCSV: () => void;
  selectedUserIds: string[];
  bulkLoading: boolean;
  onBulkStatusUpdate: (status: "active" | "suspended") => void;
  onBulkDelete: () => void;
}

export const UsersFilterToolbar: React.FC<UsersFilterToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  wilayaFilter,
  setWilayaFilter,
  sortByFilter,
  setSortByFilter,
  onExportCSV,
  selectedUserIds,
  bulkLoading,
  onBulkStatusUpdate,
  onBulkDelete,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="relative w-full xl:w-80 shrink-0">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={t("Rechercher (email, nom)...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-11 pe-4 py-3 bg-white border border-zinc-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#A54055]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <div className="relative flex-1 min-w-[130px]">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-zinc-700 outline-none cursor-pointer"
            >
              <option value="all">{t("Tous rôles")}</option>
              <option value="buyer">{t("Acheteurs")}</option>
              <option value="seller">{t("Vendeurs")}</option>
              <option value="artisan">{t("Artisans")}</option>
              <option value="property_owner">{t("Olma Immo")}</option>
              <option value="admin">{t("Admins")}</option>
            </select>
            <ChevronDown className="absolute end-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-[130px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-zinc-700 outline-none cursor-pointer"
            >
              <option value="all">{t("Tous statuts")}</option>
              <option value="active">{t("Actifs")}</option>
              <option value="suspended">{t("Suspendus")}</option>
            </select>
            <ChevronDown className="absolute end-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-[130px]">
            <select
              value={wilayaFilter}
              onChange={(e) => setWilayaFilter(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-zinc-700 outline-none cursor-pointer"
            >
              <option value="all">{t("Toutes wilayas")}</option>
              {ALGERIA_WILAYAS.map((w) => (
                <option key={String(w)} value={String(w)}>
                  {String(w)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute end-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-[130px]">
            <select
              value={sortByFilter}
              onChange={(e) => setSortByFilter(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-zinc-700 outline-none cursor-pointer"
            >
              <option value="createdAt_desc">{t("Plus récents")}</option>
              <option value="orders_desc">{t("Top Commandes")}</option>
              <option value="orders_asc">{t("Moins de commandes")}</option>
            </select>
            <ChevronDown className="absolute end-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>

          <button
            onClick={onExportCSV}
            className="px-5 py-3 bg-[#1A1836] text-white rounded-2xl font-bold uppercase tracking-wider text-[10px] hover:bg-[#42164B] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#E99856]" /> {t("Exporter CSV")}
          </button>
        </div>
      </div>

      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 bg-[#1A1836] text-white p-4 rounded-3xl shadow-2xl z-50 w-[90%] max-w-xl flex items-center justify-between gap-4 border border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider tabular-nums">
            {selectedUserIds.length} {t("sélectionné(s)")}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkStatusUpdate("active")}
              disabled={bulkLoading}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" /> Activer
            </button>
            <button
              onClick={() => onBulkStatusUpdate("suspended")}
              disabled={bulkLoading}
              className="py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] uppercase rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" /> Suspendre
            </button>
            <button
              onClick={onBulkDelete}
              disabled={bulkLoading}
              className="py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] uppercase rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Supprimer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
