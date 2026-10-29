import React from "react";
import {
  MessageSquare,
  Send,
  Clock,
  User,
  ShieldCheck,
  Paperclip,
  FileText,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { normalizeTimestamp, AppTimestamp } from "../../../utils/date";

export interface SupportTicket {
  id: string;
  userId: string;
  userName?: string;
  subject: string;
  priority: "low" | "medium" | "high" | "critical" | string;
  status: "open" | "in_progress" | "resolved" | "closed" | string;
  lastMessage?: string;
  createdAt: AppTimestamp;
  lastMessageAt?: AppTimestamp;
  resolvedAt?: AppTimestamp;
  updatedAt?: AppTimestamp;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  userId: string;
  text: string;
  sender: "client" | "admin" | string;
  createdAt: AppTimestamp;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

interface BuyerSupportChatProps {
  currentTicket: SupportTicket | undefined;
  selectedTicketId: string | null;
  messages: SupportMessage[];
  loadingMessages: boolean;
  newMessage: string;
  onNewMessageChange: (val: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReopenTicket: () => void;
  onBackToMobileList: () => void;
  uploading: boolean;
  sending: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const BuyerSupportChat: React.FC<BuyerSupportChatProps> = ({
  currentTicket,
  selectedTicketId,
  messages,
  loadingMessages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  onFileUpload,
  onReopenTicket,
  onBackToMobileList,
  uploading,
  sending,
  fileInputRef,
}) => {
  const { t } = useTranslation();

  if (!selectedTicketId || !currentTicket) {
    return (
      <div className="flex-1 bg-white rounded-3xl border border-[#E0B4B2]/40 flex flex-col items-center justify-center text-zinc-400 gap-3 p-8 min-h-[420px] shadow-2xs">
        <div className="w-14 h-14 rounded-2xl bg-[#FAF7F8] text-[#A54055] flex items-center justify-center">
          <MessageSquare className="w-7 h-7" />
        </div>
        <p className="text-sm font-bold text-[#1A1836]">{t("Sélectionnez un ticket pour afficher la conversation")}</p>
        <p className="text-xs text-zinc-500 text-center max-w-xs">{t("Vous pouvez aussi créer un nouveau ticket d'assistance via le bouton ci-dessus.")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-3xl border border-[#E0B4B2]/40 flex flex-col overflow-hidden shadow-2xs min-h-[460px] max-h-[680px]">
      <div className="p-4 sm:p-5 border-b border-[#FAF7F8] flex items-center justify-between gap-3 shrink-0 bg-[#FAF7F8]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToMobileList}
            className="lg:hidden w-9 h-9 rounded-xl bg-white border border-[#E0B4B2]/50 text-[#1A1836] flex items-center justify-center shrink-0 cursor-pointer"
            aria-label={t("Retour aux tickets")}
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-[#1A1836] truncate">{currentTicket.subject}</h3>
              {currentTicket.status === "resolved" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                  <CheckCircle2 className="w-3 h-3" /> {t("Résolu")}
                </span>
              )}
            </div>
            <p className="text-[11px] font-semibold text-[#622347]">
              {t("Ticket #")}{selectedTicketId.substring(0, 8).toUpperCase()} • {t("Priorité")} {currentTicket.priority}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
        {loadingMessages ? (
          <div className="h-full flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 text-[#A54055] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-400 py-12">
            <p className="text-xs font-semibold">{t("Décrivez votre besoin ci-dessous pour démarrer.")}</p>
          </div>
        ) : (
          messages.map((m) => {
            const isClient = m.sender === "client";
            return (
              <div key={m.id} className={`flex gap-3 ${isClient ? "flex-row-reverse" : ""}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${isClient ? "bg-[#A54055] text-white" : "bg-[#1A1836] text-[#E99856]"}`}>
                  {isClient ? <User className="w-4.5 h-4.5" /> : <ShieldCheck className="w-4.5 h-4.5" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-3.5 sm:p-4 ${isClient ? "bg-[#FAF7F8] rounded-tr-xs border border-[#E0B4B2]/40 text-[#1A1836]" : "bg-[#1A1836] text-white rounded-tl-xs shadow-xs"}`}>
                  {m.fileUrl && m.fileType && (
                    <div className="mb-2.5">
                      {m.fileType.startsWith("image/") ? (
                        <div className="rounded-xl overflow-hidden border border-black/10 bg-black/5">
                          <img loading="lazy" src={m.fileUrl} alt={m.fileName} className="max-w-full max-h-56 object-contain" />
                        </div>
                      ) : (
                        <a href={m.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-bold truncate">{m.fileName}</span>
                        </a>
                      )}
                    </div>
                  )}
                  <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  {m.createdAt && (
                    <div className={`mt-2 flex items-center justify-end gap-1 text-[10px] font-semibold ${isClient ? "text-zinc-400" : "text-[#E0B4B2]"}`}>
                      <Clock className="w-3 h-3" />
                      <span>{new Date(normalizeTimestamp(m.createdAt).toMillis()).toLocaleString("fr-FR")}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {currentTicket.status !== "resolved" ? (
        <div className="p-3.5 sm:p-4 bg-[#FAF7F8] border-t border-[#E0B4B2]/40 shrink-0">
          <form onSubmit={onSendMessage} className="space-y-1.5">
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={onFileUpload} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-11 h-11 bg-white hover:bg-[#E0B4B2]/20 text-[#42164B] rounded-xl flex items-center justify-center transition-colors shrink-0 disabled:opacity-50 border border-[#E0B4B2]/50 cursor-pointer"
                title={t("Joindre un fichier (Image, PDF)")}
              >
                {uploading ? <Loader2 className="w-4.5 h-4.5 animate-spin text-[#A54055]" /> : <Paperclip className="w-4.5 h-4.5" />}
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => onNewMessageChange(e.target.value)}
                placeholder={t("Écrivez votre message...")}
                className="flex-1 px-4 h-11 bg-white border border-[#E0B4B2]/50 rounded-xl outline-none text-xs sm:text-sm font-medium text-[#1A1836] focus:border-[#A54055] transition-colors"
              />
              <button
                type="submit"
                disabled={sending || (!newMessage.trim() && !uploading)}
                className="px-4 h-11 bg-gradient-to-r from-[#A54055] to-[#622347] text-white rounded-xl font-bold text-xs hover:brightness-110 transition-all shadow-xs disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer border-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-zinc-500">{t("Formats acceptés : JPG, PNG, WEBP, PDF • 1 Mo max.")}</p>
          </form>
        </div>
      ) : (
        <div className="p-5 bg-[#FAF7F8] border-t border-[#E0B4B2]/40 text-center space-y-3 shrink-0">
          <p className="text-xs font-semibold text-[#1A1836]">{t("Ce ticket est marqué comme résolu.")}</p>
          <button
            type="button"
            onClick={onReopenTicket}
            className="px-4 py-2 bg-white text-[#A54055] border border-[#A54055]/40 rounded-xl font-bold text-xs hover:bg-[#A54055]/10 transition-colors cursor-pointer"
          >
            {t("Ré-ouvrir ce ticket")}
          </button>
        </div>
      )}
    </div>
  );
};
