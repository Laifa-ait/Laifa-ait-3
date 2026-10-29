import React, { useState, useEffect, useRef } from "react";
import { Plus, FileText, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost } from "../lib/api";
import { normalizeTimestamp } from "../utils/date";
import { BuyerSupportChat, SupportTicket, SupportMessage } from "../components/Buyer/Support/BuyerSupportChat";
import { BuyerNewTicketModal } from "../components/Buyer/Support/BuyerNewTicketModal";

export type { SupportTicket, SupportMessage };

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "application/zip", "text/plain", "text/csv"];
const MAX_FILE_SIZE = 1048576;
const MESSAGE_COOLDOWN = 2000;

export const BuyerSupport: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastSentTime, setLastSentTime] = useState<number>(0);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketData, setNewTicketData] = useState({ subject: "", priority: "medium" });
  const [creatingTicket, setCreatingTicket] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const fetchTickets = async () => {
      try {
        const data = await apiGet<{ tickets: SupportTicket[] }>("/api/v1/support/tickets");
        if (data?.tickets) {
          setTickets(data.tickets);
          setSelectedTicket((prev) => {
            if (!prev && data.tickets.length > 0) return data.tickets[0].id;
            if (prev && !data.tickets.some((tk) => tk.id === prev)) return data.tickets[0]?.id || null;
            return prev;
          });
        }
      } catch (error) {
        console.error("Fetch support tickets error:", error);
      } finally {
        setLoadingTickets(false);
      }
    };
    fetchTickets();
    const interval = setInterval(fetchTickets, 8000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (!selectedTicket) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    const fetchMessages = async () => {
      try {
        const data = await apiGet<{ messages: SupportMessage[] }>(`/api/v1/support/tickets/${encodeURIComponent(selectedTicket)}/messages`);
        if (data?.messages) setMessages(data.messages);
      } catch (error) {
        console.error("Fetch support messages error:", error);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [selectedTicket]);

  const refreshAll = async (ticketId: string) => {
    const [msgRes, tkRes] = await Promise.all([
      apiGet<{ messages: SupportMessage[] }>(`/api/v1/support/tickets/${encodeURIComponent(ticketId)}/messages`),
      apiGet<{ tickets: SupportTicket[] }>("/api/v1/support/tickets"),
    ]);
    if (msgRes?.messages) setMessages(msgRes.messages);
    if (tkRes?.tickets) setTickets(tkRes.tickets);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const trimmedSubject = newTicketData.subject.trim();
    if (trimmedSubject.length < 5) return void toast.error(t("Le sujet doit contenir au moins 5 caractères."));
    setCreatingTicket(true);
    try {
      const name = userProfile?.shopName || userProfile?.displayName || "Client";
      const data = await apiPost<SupportTicket>("/api/v1/support/tickets", {
        subject: trimmedSubject,
        priority: newTicketData.priority,
        userName: name,
      });
      if (data?.id) {
        setIsNewTicketModalOpen(false);
        setNewTicketData({ subject: "", priority: "medium" });
        setSelectedTicket(data.id);
        setMobileShowChat(true);
        await refreshAll(data.id);
        toast.success(t("Ticket créé avec succès"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors de la création du ticket"));
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedTicket) return;
    const now = Date.now();
    if (now - lastSentTime < MESSAGE_COOLDOWN) return void toast.error(t("Veuillez patienter entre les messages."));
    setLastSentTime(now);
    setSending(true);
    try {
      await apiPost(`/api/v1/support/tickets/${encodeURIComponent(selectedTicket)}/messages`, { text: newMessage.trim() });
      setNewMessage("");
      await refreshAll(selectedTicket);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(t("Erreur lors de l'envoi."));
    } finally {
      setSending(false);
    }
  };

  const handleReopenTicket = async () => {
    if (!selectedTicket || !currentUser) return;
    try {
      await apiPost(`/api/v1/support/tickets/${encodeURIComponent(selectedTicket)}/reopen`, {});
      toast.success(t("Le ticket a été ré-ouvert !"));
      await refreshAll(selectedTicket);
    } catch (err) {
      console.error("Error reopening ticket:", err);
      toast.error(t("Erreur lors de la ré-ouverture."));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser || !selectedTicket) return;
    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      toast.error(t("Fichier invalide ou supérieur à 1 Mo."));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(",")[1];
        const uploadRes = await apiPost<{ success: boolean; fileUrl?: string; fileName?: string; fileType?: string }>(
          `/api/v1/support/tickets/${encodeURIComponent(selectedTicket)}/upload`,
          { fileName: file.name, mimeType: file.type, base64Data }
        );
        if (uploadRes.success) {
          await apiPost(`/api/v1/support/tickets/${encodeURIComponent(selectedTicket)}/messages`, {
            text: `Fichier joint : ${file.name}`,
            fileUrl: uploadRes.fileUrl,
            fileName: uploadRes.fileName,
            fileType: uploadRes.fileType,
          });
          toast.success(t("Fichier envoyé."));
          await refreshAll(selectedTicket);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(t("Erreur lors de l'envoi du fichier."));
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A1836]">{t("Assistance & Support Olmart")}</h2>
          <p className="text-zinc-500 text-xs sm:text-sm">{t("Échangez avec l'équipe de médiation et d'assistance plateforme.")}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsNewTicketModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#1A1836] to-[#42164B] hover:from-[#42164B] hover:to-[#622347] text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none shrink-0"
        >
          <Plus className="w-4 h-4 text-[#E99856]" />
          <span>{t("Nouveau Ticket")}</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className={`w-full lg:w-80 bg-white rounded-3xl border border-[#E0B4B2]/40 flex flex-col shrink-0 overflow-hidden shadow-2xs max-h-[680px] ${mobileShowChat ? "hidden lg:flex" : "flex"}`}>
          <div className="px-5 py-4 border-b border-[#FAF7F8] bg-[#FAF7F8]">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#622347]">{t("Vos Tickets")} ({tickets.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#FAF7F8]">
            {loadingTickets ? (
              <div className="p-8 text-center text-xs text-zinc-400">{t("Chargement...")}</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <FileText className="w-8 h-8 text-[#E0B4B2] mb-2" />
                <p className="text-zinc-500 font-semibold text-xs">{t("Aucun ticket ouvert")}</p>
              </div>
            ) : (
              tickets.map((ticket) => {
                const isSelected = selectedTicket === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => {
                      setSelectedTicket(ticket.id);
                      setMobileShowChat(true);
                    }}
                    className={`w-full text-left p-4 transition-colors flex items-center justify-between cursor-pointer border-none ${isSelected ? "bg-[#A54055]/10" : "bg-white hover:bg-[#FAF7F8]"}`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-xs sm:text-sm truncate font-bold ${isSelected ? "text-[#A54055]" : "text-[#1A1836]"}`}>{ticket.subject}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${ticket.status === "resolved" ? "bg-emerald-100 text-emerald-700" : "bg-[#E99856]/20 text-[#A54055]"}`}>
                          {ticket.status === "resolved" ? t("Résolu") : t("Ouvert")}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate">{ticket.lastMessage || t("Aucun message")}</p>
                      <span className="text-[10px] text-zinc-400 font-semibold block mt-1">
                        {ticket.createdAt ? new Date(normalizeTimestamp(ticket.createdAt).toMillis()).toLocaleDateString("fr-FR") : ""}
                      </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#A54055]" : "text-zinc-300"}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${!mobileShowChat ? "hidden lg:flex" : "flex"}`}>
          <BuyerSupportChat
            currentTicket={tickets.find((tk) => tk.id === selectedTicket)}
            selectedTicketId={selectedTicket}
            messages={messages}
            loadingMessages={loadingMessages}
            newMessage={newMessage}
            onNewMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
            onReopenTicket={handleReopenTicket}
            onBackToMobileList={() => setMobileShowChat(false)}
            uploading={uploading}
            sending={sending}
            fileInputRef={fileInputRef}
          />
        </div>
      </div>

      <BuyerNewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        subject={newTicketData.subject}
        priority={newTicketData.priority}
        onChangeSubject={(subject) => setNewTicketData((prev) => ({ ...prev, subject }))}
        onChangePriority={(priority) => setNewTicketData((prev) => ({ ...prev, priority }))}
        onSubmit={handleCreateTicket}
        creating={creatingTicket}
      />
    </div>
  );
};
