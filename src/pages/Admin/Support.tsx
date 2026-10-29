import React, { useState, useEffect, useMemo } from "react";
import { Clock, CheckCircle2, Shield, BarChart3 } from "lucide-react";
import { apiGet, apiPost, apiPut } from "../../lib/api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AppTimestamp } from "../../utils/date";
import { SupportTicketSidebar } from "../../components/Admin/Support/SupportTicketSidebar";
import { SupportChatViewport } from "../../components/Admin/Support/SupportChatViewport";

export interface SupportTicket {
  id: string;
  userId: string;
  userRole: string;
  userName?: string;
  shopName?: string;
  buyerName?: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: AppTimestamp;
  updatedAt: AppTimestamp;
  lastMessage?: string;
  lastMessageAt?: AppTimestamp;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId?: string;
  senderRole?: string;
  sender?: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  text: string;
  attachments?: string[];
  isInternal?: boolean;
  createdAt: AppTimestamp;
}

export const SupportAdmin: React.FC = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isInternal, setIsInternal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await apiGet<{ tickets: SupportTicket[] }>("/api/v1/admin/support/tickets");
        setTickets(data.tickets || []);
      } catch (err: unknown) {
        console.error("Error fetching support tickets:", err);
      } finally {
        setLoadingTickets(false);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    if (!selectedTicket) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const data = await apiGet<{ messages: SupportMessage[] }>(
          `/api/v1/admin/support/tickets/${encodeURIComponent(selectedTicket)}/messages`
        );
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    setLoadingMessages(true);
    fetchMessages().finally(() => setLoadingMessages(false));

    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, [selectedTicket]);

  const currentTicket = tickets.find((tk) => tk.id === selectedTicket);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedTicket || !currentTicket || newMessage === "<p><br></p>") return;

    setSending(true);
    try {
      const response = await apiPost<{ success: boolean; message: SupportMessage }>(
        `/api/v1/admin/support/tickets/${encodeURIComponent(selectedTicket)}/messages`,
        { text: newMessage.trim(), isInternal }
      );

      if (response.success) {
        setMessages((prev) => [...prev, response.message]);
        setTickets((prevTickets) =>
          prevTickets.map((tk) =>
            tk.id === selectedTicket
              ? {
                  ...tk,
                  lastMessage: isInternal ? tk.lastMessage : newMessage.trim(),
                  lastMessageAt: new Date().toISOString(),
                }
              : tk
          )
        );
      }
      setNewMessage("");
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedTicket || !currentTicket) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Seules les images et les PDF sont acceptés.");
      return;
    }
    if (file.size > 1048576) {
      toast.error("Le fichier dépasse la taille maximale autorisée de 1 Mo.");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(",")[1];
          const uploadRes = await apiPost<{
            success: boolean;
            fileUrl?: string;
            fileName?: string;
            fileType?: string;
          }>(`/api/v1/support/tickets/${encodeURIComponent(selectedTicket)}/upload`, {
            fileName: file.name,
            mimeType: file.type,
            base64Data,
          });

          if (uploadRes.success) {
            const response = await apiPost<{ success: boolean; message: SupportMessage }>(
              `/api/v1/admin/support/tickets/${encodeURIComponent(selectedTicket)}/messages`,
              {
                text: `Fichier envoyé : ${file.name}`,
                fileUrl: uploadRes.fileUrl,
                fileName: uploadRes.fileName,
                fileType: uploadRes.fileType,
                isInternal: false,
              }
            );

            if (response.success) {
              setMessages((prev) => [...prev, response.message]);
            }
            toast.success("Fichier envoyé.");
          }
        } catch (error: unknown) {
          toast.error(error instanceof Error ? error.message : "Erreur lors de l'envoi du fichier.");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Erreur lors de la préparation du fichier.");
      setUploading(false);
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!selectedTicket || currentTicket?.status === newStatus) return;
    try {
      await apiPut(`/api/v1/admin/support/tickets/${encodeURIComponent(selectedTicket)}/status`, {
        status: newStatus,
      });
      toast.success(`Statut changé à ${newStatus}`);
      setTickets((prev) => prev.map((tk) => (tk.id === selectedTicket ? { ...tk, status: newStatus } : tk)));
    } catch {
      toast.error("Erreur lors du changement de statut.");
    }
  };

  const handleUpdatePriority = async (newPriority: string) => {
    if (!selectedTicket || currentTicket?.priority === newPriority) return;
    try {
      await apiPut(`/api/v1/admin/support/tickets/${encodeURIComponent(selectedTicket)}/priority`, {
        priority: newPriority,
      });
      toast.success(`Priorité mise à jour : ${newPriority}`);
      setTickets((prev) => prev.map((tk) => (tk.id === selectedTicket ? { ...tk, priority: newPriority } : tk)));
    } catch {
      toast.error("Erreur lors de la mise à jour de la priorité.");
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((tk) => {
      if (statusFilter !== "all" && tk.status !== statusFilter) return false;
      const q = searchTerm.toLowerCase();
      return (
        (tk.shopName || tk.buyerName || "").toLowerCase().includes(q) ||
        (tk.subject || "").toLowerCase().includes(q)
      );
    });
  }, [tickets, statusFilter, searchTerm]);

  const kpiStats = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter((tk) => tk.status === "resolved").length;
    const openCount = tickets.filter((tk) => tk.status !== "resolved").length;
    const urgentCount = tickets.filter((tk) => tk.priority === "P0" || tk.priority === "P1" || tk.priority === "high").length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    return { total, resolved, openCount, urgentCount, resolutionRate };
  }, [tickets]);

  return (
    <div className="space-y-4 sm:space-y-6 min-h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[#1A1836]">
            {t("Helpdesk & Support Marchands / Clients")}
          </h2>
          <p className="text-zinc-500 text-xs font-medium">
            {t("Gérez les demandes d'assistance, notes internes et priorités SLA.")}
          </p>
        </div>
        <button
          onClick={() => setShowDashboard(!showDashboard)}
          className="min-h-[42px] px-4 py-2 bg-[#1A1836] hover:bg-[#42164B] text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <BarChart3 className="w-4 h-4 text-[#E99856]" />
          {showDashboard ? t("Masquer KPIs SLA") : t("Afficher KPIs SLA")}
        </button>
      </div>

      {showDashboard && (
        <div className={`${selectedTicket ? "hidden lg:grid" : "grid"} grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 shrink-0`}>
          <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-200/80 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Taux de Résolution Réel</p>
              <p className="text-xl sm:text-2xl font-sans font-extrabold text-[#1A1836] tabular-nums">
                {kpiStats.resolutionRate}% ({kpiStats.resolved}/{kpiStats.total})
              </p>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-200/80 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Tickets Actifs / En cours</p>
              <p className="text-xl sm:text-2xl font-sans font-extrabold text-[#1A1836] tabular-nums">{kpiStats.openCount}</p>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-200/80 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#A54055]/10 text-[#A54055] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Priorité Haute (P0/P1)</p>
              <p className="text-xl sm:text-2xl font-sans font-extrabold text-[#A54055] tabular-nums">{kpiStats.urgentCount}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
        <SupportTicketSidebar
          tickets={filteredTickets}
          loadingTickets={loadingTickets}
          selectedTicket={selectedTicket}
          onSelectTicket={setSelectedTicket}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <SupportChatViewport
          currentTicket={currentTicket}
          messages={messages}
          loadingMessages={loadingMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          isInternal={isInternal}
          setIsInternal={setIsInternal}
          sending={sending}
          uploading={uploading}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          onChangeStatus={handleChangeStatus}
          onUpdatePriority={handleUpdatePriority}
          onBackToList={() => setSelectedTicket(null)}
        />
      </div>
    </div>
  );
};

