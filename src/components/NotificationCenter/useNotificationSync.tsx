import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost } from "../../lib/api";
import { NotificationItem, RawDirectNotif } from "./notification.types";
import { useTranslation } from "react-i18next";
import {
  fetchWithClientCache,
  getCachedClientData,
  invalidateClientReadCache,
} from "../../utils/clientReadCache";

interface NotificationsApiPayload {
  orders?: Array<{ id: string; status: string; total: number; updatedAt: unknown }>;
  direct?: Array<RawDirectNotif & { id: string }>;
}

const NOTIF_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes anti-F5 shield

export const useNotificationSync = () => {
  const { currentUser, userProfile } = useAuth();
  const { i18n } = useTranslation();
  const lang = (i18n.language || "fr").substring(0, 2) as "fr" | "ar" | "en";

  const cacheKey = currentUser ? `auth:notifications:${currentUser.uid}` : "";
  const cachedPayload = cacheKey ? getCachedClientData<NotificationsApiPayload>(cacheKey) : null;

  const [directRaw, setDirectRaw] = useState<Array<RawDirectNotif & { id: string }>>(cachedPayload?.direct || []);
  const [orderNotifs, setOrderNotifs] = useState<NotificationItem[]>([]);

  const parseTs = (val: unknown): number => {
    if (!val) return Date.now();
    if (typeof val === "number") return val;
    if (typeof val === "string") return Date.parse(val) || Date.now();
    if (val && typeof val === "object") {
      const obj = val as { seconds?: number; _seconds?: number };
      if (obj.seconds) return obj.seconds * 1000;
      if (obj._seconds) return obj._seconds * 1000;
    }
    return Date.now();
  };

  const mapOrdersToNotifications = useCallback(
    (orders?: Array<{ id: string; status: string; total: number; updatedAt: unknown }>): NotificationItem[] => {
      if (!Array.isArray(orders)) return [];
      return orders.map((o) => {
        const ts = parseTs(o.updatedAt);
        const time = new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        return {
          id: `order-status-${o.id}`,
          title: `Commande #${o.id.substring(0, 8).toUpperCase()}`,
          description: `Statut actuel : ${o.status}`,
          time,
          createdAt: ts,
          type: "order_status" as const,
          link: `/orders/${o.id}`,
          orderId: o.id,
          read: localStorage.getItem(`notif_read_order-status-${o.id}`) === "true",
        };
      });
    },
    []
  );

  const fetchNotificationsSync = useCallback(async () => {
    if (!currentUser) {
      setDirectRaw([]);
      setOrderNotifs([]);
      return;
    }
    try {
      const res = await fetchWithClientCache<NotificationsApiPayload>(
        `auth:notifications:${currentUser.uid}`,
        () => apiGet<NotificationsApiPayload>("/api/v1/auth/notifications"),
        NOTIF_CACHE_TTL_MS
      );
      if (res?.direct && Array.isArray(res.direct)) {
        setDirectRaw(res.direct);
      }
      if (res?.orders) {
        setOrderNotifs(mapOrdersToNotifications(res.orders));
      }
    } catch {
      // Ignore network/quota errors gracefully
    }
  }, [currentUser, mapOrdersToNotifications]);

  useEffect(() => {
    fetchNotificationsSync();
  }, [fetchNotificationsSync]);

  const directNotifs = useMemo<NotificationItem[]>(() => {
    const isSeller = userProfile?.role === "seller";
    return directRaw.map((data) => {
      const ts = parseTs(data.createdAt);
      const timeStr = new Date(ts).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const title =
        typeof data.title === "string"
          ? data.title
          : data.title?.[lang] || data.title?.fr || "Notification";
      const desc =
        typeof data.message === "string"
          ? data.message
          : data.message?.[lang] || data.message?.fr || "";

      let targetLink = "/dashboard/buyer";
      const oId = data.orderId;

      if (data.type === "new_order") {
        targetLink = isSeller ? "/seller/orders" : oId ? `/orders/${oId}` : "/dashboard/buyer";
      } else if (data.type === "new_message" || data.type === "message") {
        targetLink = oId ? `/orders/${oId}` : isSeller ? "/seller/orders" : "/dashboard/buyer";
      } else if (data.type === "order_status") {
        targetLink = oId ? `/orders/${oId}` : "/dashboard/buyer";
      } else if (data.type === "dispute") {
        targetLink = isSeller ? "/seller/disputes" : oId ? `/orders/${oId}` : "/dashboard/buyer";
      }

      return {
        id: data.id,
        title,
        description: desc,
        time: timeStr,
        createdAt: ts,
        type: (data.type as NotificationItem["type"]) || "system",
        link: targetLink,
        orderId: data.orderId,
        read: Boolean(data.read),
      };
    });
  }, [directRaw, lang, userProfile?.role]);

  const allNotifications = useMemo(() => {
    const combined = [...directNotifs, ...orderNotifs];
    combined.sort((a, b) => b.createdAt - a.createdAt);
    return combined.slice(0, 30);
  }, [directNotifs, orderNotifs]);

  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => !n.read).length;
  }, [allNotifications]);

  const markAllAsRead = async () => {
    setDirectRaw((prev) => prev.map((n) => ({ ...n, read: true })));
    setOrderNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    orderNotifs.forEach((n) => localStorage.setItem(`notif_read_${n.id}`, "true"));
    if (currentUser) invalidateClientReadCache(`auth:notifications:${currentUser.uid}`);

    try {
      await apiPost("/api/v1/auth/notifications/read-all", {});
    } catch {
      // ignore
    }
  };

  const markOneAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser) invalidateClientReadCache(`auth:notifications:${currentUser.uid}`);
    if (id.startsWith("order-status-")) {
      localStorage.setItem(`notif_read_${id}`, "true");
      setOrderNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } else {
      setDirectRaw((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      try {
        await apiPost(`/api/v1/auth/notifications/${id}/read`, {});
      } catch {
        // ignore
      }
    }
  };

  return {
    notifications: allNotifications,
    unreadCount,
    markAllAsRead,
    markOneAsRead,
  };
};
