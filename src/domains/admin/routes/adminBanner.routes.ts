import { Response, Router } from "express";
import { z } from "zod";
import { admin, db } from "../../../config/firebase-admin";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { CoreService } from "../../../services/CoreService";

const router = Router();

const AdminBannerSchema = z
  .object({
    title: z.string().max(250).optional(),
    title_color: z.string().max(30).optional(),
    subtitle: z.string().max(600).optional(),
    subtitle_color: z.string().max(30).optional(),
    badge: z.string().max(120).optional(),
    badge_color: z.string().max(30).optional(),
    discount_label: z.string().max(120).optional(),
    button_text: z.string().max(120).optional(),
    btn_bg_color: z.string().max(30).optional(),
    btn_text_color: z.string().max(30).optional(),
    secondary_button_text: z.string().max(120).optional(),
    secondary_cta_link: z.string().max(500).optional(),
    desktop_image: z.string().max(1500000).optional(),
    mobile_image: z.string().max(1500000).nullable().optional(),
    imageUrl: z.string().max(1500000).optional(),
    mobileImageUrl: z.string().max(1500000).nullable().optional(),
    linkUrl: z.string().max(500).optional(),
    redirect_type: z.enum(["tag", "campaign", "category", "custom_url", "shop"]).optional(),
    tag_id: z.string().max(120).optional(),
    cta_link: z.string().max(500).optional(),
    ctaLink: z.string().max(500).optional(),
    target_category: z.string().max(150).optional(),
    targetType: z.string().max(50).optional(),
    targetId: z.string().max(100).optional(),
    order: z.number().int().min(0).optional(),
    sort_order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    is_active: z.boolean().optional(),
    active: z.boolean().optional(),
    featured_products: z.array(z.string()).optional(),
    target_user_type: z.enum(["all", "new", "logged_in"]).optional(),
    target_regions: z.array(z.string()).optional(),
    ab_group: z.enum(["all", "A", "B"]).optional(),
    zone: z.enum(["carousel_main", "grid_top", "grid_bottom", "sidebar"]).optional(),
    startDate: z.string().nullable().optional(),
    start_date: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    show_countdown: z.boolean().optional(),
    text_align: z.enum(["left", "center", "right"]).optional(),
    content_position: z.enum(["bottom", "center", "top"]).optional(),
    overlay_opacity: z.number().min(0).max(100).optional(),
    overlay_color: z.string().max(30).optional(),
    shadow_intensity: z.enum(["none", "soft", "medium", "strong", "glow"]).optional(),
    image_margin: z.number().min(0).max(64).optional(),
    image_fit: z.enum(["cover", "contain"]).optional(),
    image_position: z.enum(["center", "top", "bottom", "left", "right"]).optional(),
    bg_color: z.string().max(30).optional(),
    translations: z.record(z.string(), z.record(z.string(), z.string())).optional(),
    wilayaCode: z.string().max(10).nullable().optional(),
    type: z.string().max(50).optional(),
    category: z.string().max(100).optional(),
    views: z.number().int().min(0).optional(),
    clicks: z.number().int().min(0).optional(),
    created_at: z.string().optional(),
  })
  .strict();

router.get(
  ["/admin/banners", "/banners"],
  authenticateToken,
  authorizeAdmin,
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const snap = await db.collection("banners").get();
      const banners = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Record<string, unknown> & { id: string })
        .sort((a, b) => {
          const orderA = Number(a.sort_order ?? a.order ?? 999);
          const orderB = Number(b.sort_order ?? b.order ?? 999);
          return orderA - orderB;
        });
      return res.json({ success: true, data: banners, banners });
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  }
);

// Reorder route MUST be registered before /admin/banners/:id
router.put(
  ["/admin/banners/reorder", "/banners/reorder"],
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { items } = req.body as { items?: Array<{ id: string; order?: number; sort_order?: number }> };
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Items array required" });
      }
      const batch = db.batch();
      items.forEach((item, index) => {
        const nextOrder = item.sort_order ?? item.order ?? index + 1;
        const ref = db.collection("banners").doc(item.id);
        batch.update(ref, { order: nextOrder, sort_order: nextOrder });
      });
      await batch.commit();
      CoreService.invalidateHomeDataCache();

      await db.collection("audit_logs").add({
        type: "MARKETING_MANAGEMENT",
        action: "REORDER_BANNERS",
        adminId: req.user?.uid || "admin",
        adminEmail: req.user?.email || "",
        itemCount: items.length,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({ success: true, data: { count: items.length } });
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  }
);

router.get(
  ["/admin/banners/:id", "/banners/:id"],
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const docSnap = await db.collection("banners").doc(req.params.id).get();
      if (!docSnap.exists) return res.status(404).json({ error: "Banner not found" });
      const banner = { id: docSnap.id, ...docSnap.data() };
      return res.json({ success: true, data: banner, banner });
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  }
);

router.post(
  ["/admin/banners", "/banners"],
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const parseResult = AdminBannerSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Données de bannière invalides", details: parseResult.error.issues });
      }
      const bannerData = {
        ...parseResult.data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const ref = await db.collection("banners").add(bannerData);
      CoreService.invalidateHomeDataCache();

      await db.collection("audit_logs").add({
        type: "MARKETING_MANAGEMENT",
        action: "CREATE_BANNER",
        adminId: req.user?.uid || "admin",
        adminEmail: req.user?.email || "",
        bannerId: ref.id,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      const created = { id: ref.id, ...bannerData };
      return res.json({ success: true, data: created, banner: created });
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  }
);

router.put(
  ["/admin/banners/:id", "/banners/:id"],
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const parseResult = AdminBannerSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Données de bannière invalides", details: parseResult.error.issues });
      }
      await db.collection("banners").doc(req.params.id).update({
        ...parseResult.data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      CoreService.invalidateHomeDataCache();

      await db.collection("audit_logs").add({
        type: "MARKETING_MANAGEMENT",
        action: "UPDATE_BANNER",
        adminId: req.user?.uid || "admin",
        adminEmail: req.user?.email || "",
        bannerId: req.params.id,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({ success: true, data: { id: req.params.id } });
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  }
);

router.delete(
  ["/admin/banners/:id", "/banners/:id"],
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await db.collection("banners").doc(req.params.id).delete();
      CoreService.invalidateHomeDataCache();

      await db.collection("audit_logs").add({
        type: "MARKETING_MANAGEMENT",
        action: "DELETE_BANNER",
        adminId: req.user?.uid || "admin",
        adminEmail: req.user?.email || "",
        bannerId: req.params.id,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({ success: true, data: { id: req.params.id } });
    } catch (error: unknown) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne" });
    }
  }
);

export default router;
