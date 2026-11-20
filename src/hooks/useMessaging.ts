import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ChatMessageDocument,
  ConversationDocument,
  InitiateConversationDTO
} from '../types/messaging';
import { messagingApi } from '../services/messagingApi';
import { startVisibilityAwarePolling } from '../utils/visibilityPolling';
import toast from 'react-hot-toast';

export function useMessaging(
  isOpen: boolean,
  initialContext?: InitiateConversationDTO,
  initialConversationId?: string
) {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<ConversationDocument[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDocument | null>(null);
  const [messages, setMessages] = useState<ChatMessageDocument[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const stopPollingRef = useRef<(() => void) | null>(null);

  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoadingConversations(true);
    try {
      const res = await messagingApi.listConversations({ limit: 30 });
      if (res.success && res.data) {
        setConversations(res.data);
        setHasMoreConversations(res.hasMore);
      }
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUser]);

  const loadMessages = useCallback(
    async (convId: string, before?: string) => {
      if (!currentUser) return;
      if (!before) setLoadingMessages(true);
      try {
        const res = await messagingApi.listMessages(convId, { limit: 30, before });
        if (res.success && res.data) {
          if (before) setMessages((prev) => [...res.data, ...prev]);
          else setMessages(res.data);
          setHasMoreMessages(res.hasMore);
        }
      } finally {
        if (!before) setLoadingMessages(false);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    if (!isOpen || !currentUser) return;
    const init = async () => {
      await loadConversations();
      if (initialContext) {
        try {
          const res = await messagingApi.initiateConversation(initialContext);
          if (res.success && res.data) {
            setSelectedConversation(res.data);
            await loadMessages(res.data.id);
            await messagingApi.markConversationRead(res.data.id);
          }
        } catch {
          toast.error("Impossible d'ouvrir la conversation.");
        }
      } else if (initialConversationId) {
        setSelectedConversation({ id: initialConversationId } as ConversationDocument);
        await loadMessages(initialConversationId);
        await messagingApi.markConversationRead(initialConversationId);
      }
    };
    init();
  }, [isOpen, initialContext, initialConversationId, currentUser, loadConversations, loadMessages]);

  useEffect(() => {
    if (!isOpen || !selectedConversation || !currentUser) {
      stopPollingRef.current?.();
      stopPollingRef.current = null;
      return;
    }
    stopPollingRef.current = startVisibilityAwarePolling(async () => {
      try {
        const res = await messagingApi.listMessages(selectedConversation.id, { limit: 20 });
        if (res.success && res.data) setMessages(res.data);
      } catch {
        // silent polling
      }
    }, 15_000);
    return () => {
      stopPollingRef.current?.();
      stopPollingRef.current = null;
    };
  }, [isOpen, selectedConversation, currentUser]);

  return {
    currentUser,
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    setMessages,
    loadingConversations,
    loadingMessages,
    hasMoreMessages,
    hasMoreConversations,
    loadingAction,
    setLoadingAction,
    loadConversations,
    loadMessages
  };
}
