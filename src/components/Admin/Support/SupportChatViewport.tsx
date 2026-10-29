import React, { useRef } from "react";
import { MessageSquare, Send, Clock, User, Store, Paperclip, FileText, Loader2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SupportTicket, SupportMessage } from "../../../pages/Admin/Support";
import { AppTimestamp, normalizeTimestamp } from "../../../utils/date";
import { LazyRichTextEditor } from "../../ui/LazyRichTextEditor";

const CANNED_RESPONSES = [
  "Bonjour, nous avons bien reçu votre demande et notre équipe l'analyse.",
  "Pourriez-vous nous fournir le numéro de commande ou une capture d'écran s'il vous plaît ?",
  "Votre demande a été traitée et résolue. N'hésitez pas à nous recontacter si besoin.",
  "Votre dossier a été transmis à notre cellule financière et logistique.",
];

interface SupportChatViewportProps {
  currentTicket: SupportTicket | undefined;
  messages: SupportMessage[];
  loadingMessages: boolean;
  newMessage: string;
  setNewMessage: (val: string) => void;
  isInternal: boolean;
  setIsInternal: (val: boolean) => void;
  sending: boolean;
  uploading: boolean;
  onSendMessage: (e?: React.FormEvent) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeStatus: (st: string) => void;
  onUpdatePriority: (pr: string) => void;
  onBackToList?: () => void;
}

export const SupportChatViewport: React.FC<SupportChatViewportProps> = ({
  currentTicket,
  messages,
  loadingMessages,
  newMessage,
  setNewMessage,
  isInternal,
  setIsInternal,
  sending,
  uploading,
  onSendMessage,
  onFileUpload,
  onChangeStatus,
  onUpdatePriority,
  onBackToList,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formatDate = (date: AppTimestamp) => (date ? normalizeTimestamp(date).toDate().toLocaleString("fr-FR") : "");

  if (!currentTicket) {
    return (
      <div className="hidden lg:flex flex-1 bg-white rounded-3xl border border-zinc-200/80 flex-col items-center justify-center text-zinc-400 gap-4 min-h-[400px]">
        <MessageSquare className="w-14 h-14 text-zinc-200" />
        <p className="font-bold text-sm">{t("Sélectionnez un ticket pour afficher la conversation")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/80 flex flex-col overflow-hidden shadow-sm min-h-[480px]">
      <div className="p-3.5 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBackToList && (
            <button
              type="button"
              onClick={onBackToList}
              className="lg:hidden min-w-[40px] min-h-[40px] px-2.5 bg-zinc-100 hover:bg-zinc-200 text-[#1A1836] rounded-xl flex items-center justify-center gap-1 text-xs font-bold shrink-0 cursor-pointer border-none"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tickets</span>
            </button>
          )}
          <div className="w-10 h-10 bg-[#1A1836]/10 rounded-xl hidden sm:flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-[#1A1836]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-sans font-bold text-sm sm:text-base text-[#1A1836] truncate">
              {currentTicket.shopName || currentTicket.buyerName || "Utilisateur Olmart"}
            </h3>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">{currentTicket.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={currentTicket.priority || "P3"}
            onChange={(e) => onUpdatePriority(e.target.value)}
            className="flex-1 sm:flex-none min-h-[38px] px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-wider outline-none text-zinc-700 cursor-pointer"
          >
            <option value="P0">P0 (Urgent)</option>
            <option value="P1">P1 (Haute)</option>
            <option value="P2">P2 (Moyenne)</option>
            <option value="P3">P3 (Basse)</option>
          </select>
          <select
            value={currentTicket.status || "open"}
            onChange={(e) => onChangeStatus(e.target.value)}
            className="flex-1 sm:flex-none min-h-[38px] px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-wider outline-none text-zinc-700 cursor-pointer"
          >
            <option value="open">Ouvert</option>
            <option value="in_progress">En Cours</option>
            <option value="resolved">Résolu (Clôturer)</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 bg-zinc-50/30">
        {loadingMessages ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin rounded-full h-8 w-8 text-zinc-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-400 text-xs font-medium">
            {t("La conversation est vide.")}
          </div>
        ) : (
          messages.map((m) => {
            if (m.sender === "system") {
              return (
                <div key={m.id} className="flex justify-center my-3">
                  <div className="bg-zinc-100 border border-zinc-200 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-500 tabular-nums">
                    {m.text} - {formatDate(m.createdAt)}
                  </div>
                </div>
              );
            }
            const isAdmin = m.sender === "admin";
            return (
              <div key={m.id} className={`flex gap-3.5 ${isAdmin ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isAdmin ? "bg-[#1A1836] text-white" : "bg-[#A54055]/10 text-[#A54055]"
                  }`}
                >
                  {isAdmin ? <User className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl p-4 ${
                    isAdmin
                      ? m.isInternal
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-zinc-100 border border-zinc-200/60"
                      : "bg-white border border-zinc-200 shadow-sm"
                  }`}
                >
                  {m.fileUrl && m.fileType && (
                    <div className="mb-3">
                      {m.fileType.startsWith("image/") ? (
                        <div className="rounded-xl overflow-hidden border border-zinc-200">
                          <img loading="lazy" src={m.fileUrl} alt={m.fileName} className="max-w-full max-h-60 object-contain" />
                        </div>
                      ) : (
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 p-2.5 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-zinc-500" />
                          <span className="text-xs font-bold text-zinc-700 truncate">{m.fileName}</span>
                        </a>
                      )}
                    </div>
                  )}
                  <div
                    className={`text-xs font-medium leading-relaxed break-words ${
                      m.isInternal ? "text-amber-900" : "text-zinc-800"
                    }`}
                    dangerouslySetInnerHTML={{ __html: m.text }}
                  />
                  {m.createdAt && (
                    <div className="mt-2.5 flex items-center justify-end gap-1.5 text-[9px] font-sans font-bold uppercase text-zinc-400 tabular-nums">
                      <Clock className="w-3 h-3" />
                      {formatDate(m.createdAt)}
                      {m.isInternal && (
                        <span className="ms-2 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          {t("NOTE INTERNE")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {currentTicket.status !== "resolved" ? (
        <div className="p-3.5 sm:p-4 bg-white border-t border-zinc-100 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2.5 gap-2">
            <select
              onChange={(e) => e.target.value && setNewMessage(e.target.value)}
              className="min-h-[38px] px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-wider outline-none text-zinc-600"
            >
              <option value="">{t("Réponses rapides...")}</option>
              {CANNED_RESPONSES.map((resp, i) => (
                <option key={i} value={resp}>{resp.substring(0, 42)}...</option>
              ))}
            </select>
            <label className="min-h-[36px] flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-500 hover:text-zinc-900">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="accent-amber-500 w-4 h-4"
              />
              {t("Note interne (Invisible pour le client)")}
            </label>
          </div>
          <div className={`border rounded-2xl overflow-hidden ${isInternal ? "border-amber-300 bg-amber-50" : "border-zinc-200"}`}>
            <LazyRichTextEditor
              theme="snow"
              value={newMessage}
              onChange={setNewMessage}
              placeholder={isInternal ? "Écrire une note interne..." : "Écrire votre réponse..."}
              className="border-none"
            />
          </div>
          <div className="flex items-center justify-between mt-3 gap-2">
            <div className="flex items-center gap-2">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={onFileUpload} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="min-w-[42px] min-h-[42px] bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-xl flex items-center justify-center border border-zinc-200 cursor-pointer"
                title={t("Joindre un fichier (Image, PDF)")}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
              </button>
              <span className="text-[10px] font-bold text-zinc-400 hidden sm:inline">Images ou PDF • 1 Mo max</span>
            </div>
            <button
              onClick={() => onSendMessage()}
              disabled={sending || (!newMessage.trim() && !uploading) || newMessage === "<p><br></p>"}
              className={`min-h-[42px] px-5 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer ${
                isInternal ? "bg-amber-600 hover:bg-amber-700" : "bg-[#1A1836] hover:bg-[#42164B]"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              {t("Envoyer")}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-xs font-bold text-zinc-500">{t("Ticket résolu et clôturé.")}</p>
          <button onClick={() => onChangeStatus("open")} className="min-h-[38px] px-4 text-xs font-bold text-[#A54055] hover:underline cursor-pointer">
            {t("Réouvrir le ticket")}
          </button>
        </div>
      )}
    </div>
  );
};

