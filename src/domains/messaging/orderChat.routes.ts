import { Router, Response } from "express";
import { db, admin } from "../../config/firebase-admin";
import { authenticateToken, AuthenticatedRequest } from "../../middlewares/auth";
import { chatLimiter } from "../../middlewares/rateLimiters";
import { SAFE_RESOURCE_ID_REGEX } from "../../middlewares/validation";
import { hasExternalChannel, maskSensitiveData } from "../../utils/masking";
import { safeLogger } from "../../utils/logger";

const router = Router();

router.post("/api/v1/messages/send", authenticateToken, chatLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, text, imageUrl } = req.body;
  const senderId = req.user?.uid || "";

  if (!orderId || typeof orderId !== "string" || !SAFE_RESOURCE_ID_REGEX.test(orderId.trim()) || (!text && !imageUrl)) {
    return res.status(400).json({ error: "Champs requis manquants ou identifiant invalide" });
  }
  if (text && typeof text === "string" && text.length > 2000) {
    return res.status(400).json({ error: "Message trop long (maximum 2000 caractères)" });
  }

  try {
    const cleanOrderId = orderId.trim();
    const orderRef = db.collection("orders").doc(cleanOrderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return res.status(404).json({ error: "Order not found" });

    const orderData = orderSnap.data() || {};
    const buyerId = orderData.userId || orderData.buyerId;
    const sellerId = orderData.sellerId || (orderData.sellerIds && orderData.sellerIds[0]);
    if (senderId !== buyerId && senderId !== sellerId) {
      return res.status(403).json({ error: "Not a participant" });
    }

    const recipientId = senderId === buyerId ? sellerId : buyerId;
    let secureText = text || "";
    let violationDetected = false;
    if (text && hasExternalChannel(text)) {
      violationDetected = true;
      secureText = maskSensitiveData(text);
    }

    const messageObj: Record<string, unknown> = {
      orderId: cleanOrderId,
      senderId,
      recipientId,
      text: secureText,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      violation: violationDetected,
      read: false,
    };

    if (imageUrl) {
      if (typeof imageUrl !== "string") return res.status(400).json({ error: "Format d'image invalide" });
      const isAllowedStorageHost =
        imageUrl.startsWith("https://firebasestorage.googleapis.com/") ||
        imageUrl.startsWith("https://storage.googleapis.com/") ||
        imageUrl.startsWith("data:image/");
      if (!isAllowedStorageHost) {
        return res.status(400).json({ error: "Image non autorisée : les images doivent être hébergées sur le stockage sécurisé Olmart" });
      }
      messageObj.imageUrl = imageUrl;
    }

    await orderRef.collection("messages").add(messageObj);
    const isSenderBuyer = senderId === buyerId;
    await orderRef.update({
      lastMessageText: imageUrl ? "[Image]" : secureText,
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessageSenderId: senderId,
      unreadBuyerMessages: !isSenderBuyer,
      unreadSellerMessages: isSenderBuyer,
    });

    if (violationDetected) {
      await db.collection("admin_alerts").add({
        type: "DLP_VIOLATION",
        userId: senderId,
        orderId: cleanOrderId,
        originalText: text,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        resolved: false,
      });

      const userRef = db.collection("users").doc(senderId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const currentViolations = (userData?.dlpViolations || 0) + 1;
        const updates: Record<string, unknown> = {
          dlpViolations: admin.firestore.FieldValue.increment(1),
          lastDlpViolationAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (userData?.role === "seller") {
          updates.trustScore = Math.max(0, (userData?.trustScore || 50) - 10);
          if (currentViolations >= 3) {
            updates.visibilityRestricted = true;
            updates.moderationStatus = "review_required";
          }
        }
        await userRef.update(updates);
        await db.collection("notifications").add({
          userId: senderId,
          title: "Avertissement de sécurité : Message modéré",
          message: "Votre message a été modéré pour partage de coordonnées externes. Vos violations répétées peuvent entraîner la restriction de visibilité de votre boutique.",
          type: "ALERT",
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    await db.collection("user_notifications").add({
      recipientId,
      title: { fr: "Nouveau message", ar: "رسالة جديدة", en: "New message" },
      message: {
        fr: `Vous avez reçu un nouveau message pour la commande #${cleanOrderId.substring(0, 8)}.`,
        ar: `تلقيت رسالة جديدة للطلب #${cleanOrderId.substring(0, 8)}.`,
        en: `You received a new message for order #${cleanOrderId.substring(0, 8)}.`,
      },
      type: "new_message",
      orderId: cleanOrderId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, masked: violationDetected, deliveredText: secureText });
  } catch (error: unknown) {
    safeLogger.error("[orderChat] POST /api/v1/messages/send error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de l'envoi du message" });
  }
});

router.post("/api/v1/messages/mark-read", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.body;
  const userId = req.user?.uid || "";
  if (!orderId || typeof orderId !== "string" || !SAFE_RESOURCE_ID_REGEX.test(orderId.trim())) {
    return res.status(400).json({ error: "Missing or invalid orderId" });
  }
  try {
    const orderRef = db.collection("orders").doc(orderId.trim());
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return res.status(404).json({ error: "Order not found" });

    const orderData = orderSnap.data() || {};
    const buyerId = orderData.userId || orderData.buyerId;
    const sellerId = orderData.sellerId || (orderData.sellerIds && orderData.sellerIds[0]);
    if (userId !== buyerId && userId !== sellerId) return res.status(403).json({ error: "Not an order participant" });

    await orderRef.update({ [userId === buyerId ? "unreadBuyerMessages" : "unreadSellerMessages"]: false });
    const unreadSnap = await orderRef.collection("messages").where("senderId", "!=", userId).where("read", "==", false).get();
    if (!unreadSnap.empty) {
      const batch = db.batch();
      unreadSnap.docs.forEach((d) => batch.update(d.ref, { read: true, readAt: admin.firestore.FieldValue.serverTimestamp() }));
      await batch.commit();
    }
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("[orderChat] POST /api/v1/messages/mark-read error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de la mise à jour des messages" });
  }
});

router.post("/api/v1/messages/report", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, messageId, reason } = req.body;
  const reporterId = req.user?.uid || "";
  const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";
  if (!orderId || typeof orderId !== "string" || !SAFE_RESOURCE_ID_REGEX.test(orderId.trim()) || !messageId || typeof messageId !== "string" || !SAFE_RESOURCE_ID_REGEX.test(messageId.trim())) {
    return res.status(400).json({ error: "Missing or invalid orderId or messageId" });
  }
  try {
    const cleanOrderId = orderId.trim();
    const cleanMessageId = messageId.trim();
    const orderSnap = await db.collection("orders").doc(cleanOrderId).get();
    if (!orderSnap.exists) return res.status(404).json({ error: "Order not found" });

    const orderData = orderSnap.data() || {};
    const buyerId = orderData.userId || orderData.buyerId;
    const sellerId = orderData.sellerId || (orderData.sellerIds && orderData.sellerIds[0]);
    if (!isAdmin && reporterId !== buyerId && reporterId !== sellerId) {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas participant de cette commande." });
    }

    const messageRef = db.collection("orders").doc(cleanOrderId).collection("messages").doc(cleanMessageId);
    const messageSnap = await messageRef.get();
    if (!messageSnap.exists) return res.status(404).json({ error: "Message not found" });

    const safeReason = typeof reason === "string" && reason.trim() ? reason.trim().slice(0, 500) : "Inapproprié / Signalé par l'utilisateur";
    await messageRef.update({ flagged: true, flaggedBy: reporterId, flaggedReason: safeReason, flaggedAt: admin.firestore.FieldValue.serverTimestamp() });
    await db.collection("admin_alerts").add({
      type: "INAPPROPRIATE_MESSAGE",
      userId: reporterId,
      orderId: cleanOrderId,
      messageId: cleanMessageId,
      reason: safeReason,
      originalText: messageSnap.data()?.text || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      resolved: false,
    });
    return res.json({ success: true, message: "Le message a été signalé avec succès." });
  } catch (error: unknown) {
    safeLogger.error("[orderChat] POST /api/v1/messages/report error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors du signalement du message" });
  }
});

router.get("/api/v1/orders/:orderId/chat", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    if (!orderId || !SAFE_RESOURCE_ID_REGEX.test(orderId.trim())) return res.status(400).json({ error: "Identifiant de commande invalide" });
    const callerUid = req.user?.uid || "";
    const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";
    const docSnap = await db.collection("orders").doc(orderId.trim()).get();
    if (!docSnap.exists) return res.status(404).json({ error: "Order not found" });

    const orderData = docSnap.data();
    const buyerId = orderData?.userId || orderData?.buyerId;
    const sellerId = orderData?.sellerId || (orderData?.sellerIds && orderData?.sellerIds[0]);
    if (!isAdmin && callerUid !== buyerId && callerUid !== sellerId) {
      return res.status(403).json({ error: "Accès refusé : vous n'êtes pas participant de cette commande." });
    }

    const buyerName = orderData?.shippingAddress?.fullName || orderData?.shippingAddress?.name || "Acheteur Olmart";
    let shopName = "Boutique Olmart";
    if (sellerId) {
      const shopSnap = await db.collection("publicProfiles").doc(sellerId).get();
      if (shopSnap.exists) shopName = shopSnap.data()?.shopName || shopName;
    }

    const [msgsSnap, logsSnap] = await Promise.all([
      db.collection("orders").doc(orderId.trim()).collection("messages").orderBy("createdAt", "asc").get(),
      db.collection("orders").doc(orderId.trim()).collection("order_logs").orderBy("date", "asc").get(),
    ]);
    return res.json({
      buyerName,
      shopName,
      messages: msgsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      logs: logsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data(), isLog: true })),
    });
  } catch (error: unknown) {
    safeLogger.error("[orderChat] GET /api/v1/orders/:orderId/chat error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur interne lors de la récupération de la messagerie" });
  }
});

export default router;
