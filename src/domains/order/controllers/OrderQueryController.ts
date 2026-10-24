import { Router, Response } from "express";
import { admin, db } from "../../../config/firebase-admin";
import { authenticateToken, AuthenticatedRequest } from "../../../middlewares/auth";
import { safeLogger } from "../../../utils/logger";

interface OrderItemDoc {
  id?: string;
  sellerId?: string;
  sellerIds?: string[];
  items?: Array<{ sellerId?: string; [key: string]: unknown }>;
  total?: number;
  [key: string]: unknown;
}

const router = Router();

// Update Order Status Securely
router.post("/calculate-order-totals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders)) return res.status(400).json({ error: "Valid orders array required" });

    // 1. Role-Based Access Validation Middleware / Integrity Check
    const userRole = req.user?.role;
    const userId = req.user?.uid;
    if (userRole !== "admin" && userRole !== "seller") {
      return res.status(403).json({ error: "Accès refusé. Autorisation insuffisante pour consulter les montants des commandes." });
    }

    // 2. Fetch authentic order data from Firestore DB to override incoming client data
    const incomingOrderIds = orders.map((o: { id?: string; orderId?: string }) => o.id || o.orderId).filter(Boolean) as string[];
    const dbOrdersMap = new Map<string, OrderItemDoc>();

    if (incomingOrderIds.length > 0) {
      // Chunk size of 30 due to Firestore "in" operator limits
      const chunks: string[][] = [];
      for (let i = 0; i < incomingOrderIds.length; i += 30) {
        chunks.push(incomingOrderIds.slice(i, i + 30));
      }
      for (const chunk of chunks) {
        const snap = await db.collection("orders").where(admin.firestore.FieldPath.documentId(), "in", chunk).get();
        snap.docs.forEach((doc) => {
          dbOrdersMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
      }
    }

    // 3. Absolute Integrity Sanitization: Overwrite parameters with values from DB, and filter out unauthorized data
    const validatedOrders: OrderItemDoc[] = [];
    for (const o of orders) {
      const oid = (o as { id?: string; orderId?: string }).id || (o as { id?: string; orderId?: string }).orderId;
      if (oid && dbOrdersMap.has(oid)) {
        const dbOrder = dbOrdersMap.get(oid)!;

        // Sellers can only read totals for their own orders.
        if (userRole === "seller") {
          const isMyOrder =
            dbOrder.sellerId === userId ||
            (dbOrder.sellerIds && dbOrder.sellerIds.includes(userId || "")) ||
            (dbOrder.items && dbOrder.items.some((item) => item.sellerId === userId));
          if (!isMyOrder) {
            continue;
          }
        }
        validatedOrders.push(dbOrder);
      }
    }

    const totalVolume = validatedOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const calculatedOrders = validatedOrders.map((order) => ({
      ...order,
      commissionCalc: 0,
      commissionAmount: 0,
      netPayout: Math.max(0, Number(order.total) || 0),
    }));
    const totalCommission = 0;
    const sellersNetPayout = totalVolume;

    return res.json({
      calculatedOrders,
      totalVolume,
      totalCommission,
      sellersNetPayout,
    });
  } catch (error: unknown) {
    safeLogger.error("Calculate commissions error", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: "Failed to calculate commissions" });
  }
});

// Server-side bypass for writing delivery information (bypasses Firestore Security Rules limitations)

router.get("/orders", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const limitVal = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const snap = await db.collection("orders")
      .where("userId", "==", callerUid)
      .orderBy("createdAt", "desc")
      .limit(limitVal)
      .get();
    const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ orders });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// GET single order details

router.get("/orders/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerUid = req.user?.uid;
    if (!callerUid) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const { id } = req.params;
    const snap = await db.collection("orders").doc(id).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Order not found" });
    }
    const orderData = snap.data();

    const isAdmin =
      (req.user?.role === "admin" || req.user?.role === "superadmin") &&
      req.user?.status !== "suspended" &&
      req.user?.status !== "blocked";
    const isBuyer =
      orderData?.userId === callerUid || orderData?.buyerId === callerUid;
    const isSeller =
      orderData?.sellerId === callerUid ||
      (Array.isArray(orderData?.sellerIds) && orderData.sellerIds.includes(callerUid));

    if (!isAdmin && !isBuyer && !isSeller) {
      return res.status(403).json({ error: "Access denied" });
    }
    return res.json({ id: snap.id, ...orderData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});



export default router;
