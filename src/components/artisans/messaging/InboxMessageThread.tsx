import React, { useRef, useEffect } from "react";
import { Send, RefreshCw, ShieldCheck, ChevronLeft } from "lucide-react";
import { ChatMessageDocument, ConversationDocument } from "../../../types/messaging";

interface InboxMessageThreadProps {
  conversation: ConversationDocument | null;
  peerName: string;
  currentUid: string;
  messages: ChatMessageDocument[];
  draft: string;
  loadingMessages: boolean;
  sending: boolean;
  onDraftChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  onBackMobile: () => void;
  onRefresh: () => void;
}

export const InboxMessageThread: React.FC<InboxMessageThreadProps> = ({
  conversation,
  peerName,
  currentUid,
  messages,
  draft,
  loadingMessages,
  sending,
  onDraftChange,
  onSend,
  onBackMobile,
  onRefresh,
}) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
        Sélectionnez une discussion pour afficher les messages.
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-3.5 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBackMobile}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#0F172A] truncate">{peerName}</p>
            <p className="text-[11px] text-slate-500 truncate">
              {conversation.context?.referenceTitle || "Discussion devis"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
          title="Actualiser les messages"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[390px]">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Messagerie sécurisée Olma Artisans — échangez vos détails et validez votre devis ici.</span>
        </div>

        {messages.map((msg) => {
          const isMine = msg.senderId === currentUid;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                  isMine
                    ? "bg-[#1E3A8A] text-white"
                    : "bg-white border border-slate-200 text-slate-800"
                }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 tabular-nums ${
                    isMine ? "text-blue-200" : "text-slate-400"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSend} className="bg-white p-3 border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1E3A8A] focus:bg-white text-xs text-slate-900 outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="h-10 px-4 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Envoyer</span>
        </button>
      </form>
    </>
  );
};
