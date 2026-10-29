import React from "react";
import { Search, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SupportTicket } from "../../../pages/Admin/Support";
import { AppTimestamp, normalizeTimestamp } from "../../../utils/date";

interface SupportTicketSidebarProps {
  tickets: SupportTicket[];
  loadingTickets: boolean;
  selectedTicket: string | null;
  onSelectTicket: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
}

export const SupportTicketSidebar: React.FC<SupportTicketSidebarProps> = ({
  tickets,
  loadingTickets,
  selectedTicket,
  onSelectTicket,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const { t } = useTranslation();

  const formatDateSimple = (date: AppTimestamp) => {
    if (!date) return "";
    return normalizeTimestamp(date).toDate().toLocaleDateString("fr-FR");
  };

  return (
    <div
      className={`${
        selectedTicket ? "hidden lg:flex" : "flex"
      } w-full lg:w-96 bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/80 flex-col shrink-0 overflow-hidden shadow-sm max-h-[70vh] lg:max-h-none`}
    >
      <div className="p-3.5 sm:p-4 border-b border-zinc-100 space-y-3 shrink-0">
        <div className="relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={t("Chercher une boutique ou sujet...")}
            className="w-full ps-10 pe-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-medium text-xs focus:border-[#A54055] transition-colors"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-nowrap">
          {[
            { id: "all", label: "Tous" },
            { id: "open", label: "Ouverts" },
            { id: "in_progress", label: "En cours" },
            { id: "resolved", label: "Résolus" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => onStatusFilterChange(st.id)}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                statusFilter === st.id
                  ? "bg-[#1A1836] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {loadingTickets ? (
          <div className="p-8 text-center text-zinc-400 text-xs font-bold uppercase animate-pulse">
            {t("Chargement...")}
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs font-medium">{t("Aucun ticket")}</div>
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              className={`w-full text-start p-4 transition-colors flex items-center justify-between group cursor-pointer ${
                selectedTicket === ticket.id ? "bg-[#A54055]/5" : "hover:bg-zinc-50"
              }`}
            >
              <div className="flex-1 min-w-0 pe-3">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`text-xs truncate font-bold ${
                      selectedTicket === ticket.id ? "text-[#1A1836]" : "text-zinc-700"
                    }`}
                  >
                    {ticket.shopName || ticket.buyerName || "Client Olmart"}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      ticket.status === "resolved"
                        ? "bg-emerald-100 text-emerald-700"
                        : ticket.status === "in_progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {ticket.status === "resolved"
                      ? "Résolu"
                      : ticket.status === "in_progress"
                      ? "En cours"
                      : "Ouvert"}
                  </span>
                </div>
                <p className="text-xs font-bold text-zinc-800 truncate mb-0.5">{ticket.subject}</p>
                <p className="text-[11px] text-zinc-500 truncate">{ticket.lastMessage}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ticket.priority === "high" || ticket.priority === "P0" || ticket.priority === "P1"
                        ? "bg-red-500"
                        : ticket.priority === "medium" || ticket.priority === "P2"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    title={`Priorité ${ticket.priority}`}
                  />
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider tabular-nums">
                    {formatDateSimple(ticket.createdAt)}
                  </span>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-colors ${
                  selectedTicket === ticket.id
                    ? "text-[#A54055]"
                    : "text-zinc-300 group-hover:text-zinc-400"
                }`}
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
};
