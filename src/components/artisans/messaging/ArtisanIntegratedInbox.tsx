import React, { useEffect, useState, useCallback } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { messagingApi } from "../../../services/messagingApi";
import { ChatMessageDocument, ConversationDocument } from "../../../types/messaging";
import { InboxMessageThread } from "./InboxMessageThread";

interface ArtisanIntegratedInboxProps {
  initialConversationId?: string | null;
  emptySubtitle?: string;
}

export const ArtisanIntegratedInbox: React.FC<ArtisanIntegratedInboxProps> = ({
  initialConversationId,
  emptySubtitle = "Vos échanges sur les devis et travaux apparaîtront ici en toute sécurité.",
}) => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<ConversationDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<ChatMessageDocument[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoadingList(true);
    try {
      const res = await messagingApi.listConversations({ limit: 40 });
      const artisanConvs = (res?.data || []).filter((c) => c.type === "BRICOLAGE_QUOTE");
      setConversations(artisanConvs);
      if (initialConversationId && artisanConvs.some((c) => c.id === initialConversationId)) {
        setSelectedId(initialConversationId);
      } else if (!selectedId && artisanConvs.length > 0) {
        setSelectedId(artisanConvs[0].id);
      }
    } finally {
      setLoadingList(false);
    }
  }, [currentUser, initialConversationId, selectedId]);

  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    try {
      const res = await messagingApi.listMessages(convId, { limit: 50 });
      setMessages([...(res?.data || [])].reverse());
      messagingApi.markConversationRead(convId).catch(() => {});
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !draft.trim() || sending) return;
    setSending(true);
    try {
      const res = await messagingApi.sendMessage(selectedId, { text: draft.trim() });
      if (res?.data) {
        setMessages((prev) => [...prev, res.data]);
        setDraft("");
      }
    } finally {
      setSending(false);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedId) || null;
  const uid = currentUser?.uid || "";

  const getPeerName = (conv: ConversationDocument): string => {
    const peerId = conv.participants.find((p) => p !== uid);
    return (peerId && conv.participantDetails?.[peerId]?.displayName) || "Interlocuteur Olmart";
  };

  if (loadingList && conversations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <RefreshCw className="w-5 h-5 animate-spin text-[#1E3A8A] mx-auto" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2.5">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <MessageSquare className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-[#0F172A]">Aucune conversation de devis active</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
      <div className={`md:col-span-4 border-r border-slate-200 flex flex-col ${selectedConv ? "hidden md:flex" : "flex"}`}>
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-[#0F172A]">Discussions ({conversations.length})</span>
          <button
            type="button"
            onClick={loadConversations}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
            title="Actualiser"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
          {conversations.map((conv) => {
            const unread = conv.participantDetails?.[uid]?.unreadCount || 0;
            const active = conv.id === selectedId;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left p-3.5 transition-colors cursor-pointer ${
                  active ? "bg-blue-50/70" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#0F172A] truncate">{getPeerName(conv)}</span>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#1E3A8A] text-white text-[10px] font-bold tabular-nums">
                      {unread}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-medium text-[#1E3A8A] truncate mt-0.5">
                  {conv.context?.referenceTitle || "Demande de devis"}
                </p>
                {conv.lastMessage?.text && (
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{conv.lastMessage.text}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`md:col-span-8 flex flex-col bg-slate-50/50 ${selectedConv ? "flex" : "hidden md:flex"}`}>
        <InboxMessageThread
          conversation={selectedConv}
          peerName={selectedConv ? getPeerName(selectedConv) : ""}
          currentUid={uid}
          messages={messages}
          draft={draft}
          loadingMessages={loadingMessages}
          sending={sending}
          onDraftChange={setDraft}
          onSend={handleSend}
          onBackMobile={() => setSelectedId(null)}
          onRefresh={() => selectedConv && loadMessages(selectedConv.id)}
        />
      </div>
    </div>
  );
};
