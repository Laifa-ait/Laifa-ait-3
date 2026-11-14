import { Response, Router } from "express";
import NodeCache from "node-cache";
import { z } from "zod";
import path from "path";
import { admin, db } from "../../config/firebase-admin";
import { AuthenticatedRequest, authenticateToken } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validation";
import { safeLogger } from "../../utils/logger";
import { DocumentCategory, UserDocumentDTO, UserDataConsentPreferences } from "../../types/documents";
import { isFirestoreQuotaError } from "../../utils/firestoreTimeout";

const consentServerCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
const isServerCacheEnabled = () => process.env.NODE_ENV !== "test" && !process.env.VITEST;

const RecordDocumentSchema = z.object({
  category: z.enum([
    "identity",
    "real_estate_legal",
    "artisan_qualification",
    "seller_registry",
    "invoice",
    "dispute_evidence",
    "general",
  ]),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive().max(30 * 1024 * 1024),
  mimeType: z.string().min(1).max(100),
  downloadUrl: z.string().url().refine(
    (url) => url.startsWith("https://"),
    "L'URL de téléchargement doit utiliser le protocole HTTPS sécurisé"
  ),
  storagePath: z.string().min(1).max(500),
  description: z.string().max(1000).optional(),
});

const ConsentSchema = z.object({
  essential: z.literal(true),
  localStorageCache: z.boolean(),
  documentMemory: z.boolean(),
  analyticsPerformance: z.boolean(),
  consentTimestamp: z.string(),
  consentVersion: z.string(),
});

export const userDocumentsRouter = Router();

// 1. GET /api/v1/user-documents/my - List user's documents
userDocumentsRouter.get("/my", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.uid;
  if (!userId) return res.status(401).json({ success: false, error: "Non authentifié" });

  try {
    const category = req.query.category as DocumentCategory | undefined;
    let query: FirebaseFirestore.Query = db.collection("user_documents").where("userId", "==", userId);
    if (category) query = query.where("category", "==", category);

    const snapshot = await query.orderBy("createdAt", "desc").get();
    const documents: UserDocumentDTO[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        category: data.category,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        downloadUrl: data.downloadUrl,
        storagePath: data.storagePath,
        description: data.description,
        isVerified: data.isVerified,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
      };
    });

    safeLogger.info(`[UserDocuments] 🟢 ${documents.length} document(s) récupéré(s) pour uid=${userId}`);
    return res.json({ success: true, data: documents });
  } catch (err) {
    if (isFirestoreQuotaError(err)) {
      safeLogger.warn("[UserDocuments] ⚠️ Quota Firestore atteint sur GET /my — retour liste vide.");
      return res.json({ success: true, data: [], degraded: true });
    }
    safeLogger.error("[UserDocuments] ❌ Erreur récupération documents", { error: err });
    return res.status(500).json({ success: false, error: "Erreur serveur lors de la récupération des documents" });
  }
});

// 2. POST /api/v1/user-documents/record - Register uploaded document metadata with strict server-side verification
userDocumentsRouter.post(
  "/record",
  authenticateToken,
  validateRequest(RecordDocumentSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ success: false, error: "Non authentifié" });

    const body = req.body as z.infer<typeof RecordDocumentSchema>;
    const expectedPrefix = `user_documents/${userId}/`;
    const normalizedStoragePath = path.posix.normalize(body.storagePath);
    if (!normalizedStoragePath.startsWith(expectedPrefix) || normalizedStoragePath.includes("..")) {
      safeLogger.warn(`[UserDocuments] ⚠️ Tentative IDOR ou Path Traversal sur storagePath: ${body.storagePath} par uid=${userId}`);
      return res.status(403).json({ success: false, error: "Accès refusé : chemin de stockage non autorisé" });
    }

    const sanitizedFileName = path.basename(body.fileName).replace(/[<>"'`;\\/]/g, "_");
    let verifiedSize = body.fileSize;
    let verifiedMime = body.mimeType;

    try {
      if (admin && admin.apps && admin.apps.length > 0) {
        const bucket = admin.storage().bucket();
        const file = bucket.file(body.storagePath);
        const [exists] = await file.exists();
        if (exists) {
          const [metadata] = await file.getMetadata();
          if (metadata.size) verifiedSize = parseInt(String(metadata.size), 10);
          if (metadata.contentType) verifiedMime = metadata.contentType;
        } else {
          return res.status(404).json({ success: false, error: "Fichier introuvable sur le stockage distant" });
        }
      }
    } catch (storageErr) {
      safeLogger.warn("[UserDocuments] ⚠️ Impossible de vérifier physiquement le fichier sur Storage (mode secours)", {
        err: storageErr instanceof Error ? storageErr.message : String(storageErr),
      });
    }

    try {
      const now = new Date();
      const docRef = db.collection("user_documents").doc();
      const newDoc = {
        userId,
        category: body.category,
        fileName: sanitizedFileName,
        fileSize: verifiedSize,
        mimeType: verifiedMime,
        downloadUrl: body.downloadUrl,
        storagePath: body.storagePath,
        description: body.description || "",
        isVerified: false,
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(newDoc);
      const createdDTO: UserDocumentDTO = {
        id: docRef.id,
        ...newDoc,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      return res.status(201).json({ success: true, data: createdDTO });
    } catch (err) {
      safeLogger.error("[UserDocuments] ❌ Erreur enregistrement document", { error: err });
      return res.status(500).json({ success: false, error: "Impossible d'enregistrer le document" });
    }
  }
);

// 3. DELETE /api/v1/user-documents/:id - Delete a document (Strict IDOR)
userDocumentsRouter.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.uid;
  const docId = req.params.id;
  const isAdmin = req.user?.role === "admin" || req.user?.admin === true;
  if (!userId) return res.status(401).json({ success: false, error: "Non authentifié" });

  try {
    const docSnap = await db.collection("user_documents").doc(docId).get();
    if (!docSnap.exists) return res.status(404).json({ success: false, error: "Document introuvable" });

    const docData = docSnap.data();
    if (docData?.userId !== userId && !isAdmin) {
      safeLogger.warn(`[UserDocuments] ⚠️ Tentative IDOR de suppression: docId=${docId} par uid=${userId}`);
      return res.status(403).json({ success: false, error: "Accès refusé" });
    }

    await db.collection("user_documents").doc(docId).delete();
    if (docData?.storagePath) {
      try {
        if (admin && admin.apps && admin.apps.length > 0) {
          await admin.storage().bucket().file(docData.storagePath).delete({ ignoreNotFound: true });
        }
      } catch (storageDelErr) {
        safeLogger.warn("[UserDocuments] ⚠️ Avertissement suppression Storage physique", { err: String(storageDelErr) });
      }
    }
    return res.json({ success: true, message: "Document supprimé avec succès" });
  } catch (err) {
    safeLogger.error("[UserDocuments] ❌ Erreur suppression document", { error: err });
    return res.status(500).json({ success: false, error: "Erreur serveur lors de la suppression" });
  }
});

// 4. GET /api/v1/user-documents/consent - Get user consent state
userDocumentsRouter.get("/consent", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.uid;
  if (!userId) return res.status(401).json({ success: false, error: "Non authentifié" });

  const cacheKey = `consent:${userId}`;
  try {
    if (isServerCacheEnabled() && consentServerCache.has(cacheKey)) {
      const cached = consentServerCache.get<UserDataConsentPreferences | null>(cacheKey);
      return res.json({ success: true, data: cached ?? null });
    }
    const consentSnap = await db.collection("users").doc(userId).collection("consents").doc("privacy").get();
    const consentData = consentSnap.exists ? (consentSnap.data() as UserDataConsentPreferences) : null;
    if (isServerCacheEnabled()) consentServerCache.set(cacheKey, consentData);
    return res.json({ success: true, data: consentData });
  } catch (err) {
    if (isFirestoreQuotaError(err)) {
      safeLogger.warn("[UserDocuments] ⚠️ Quota Firestore atteint sur GET /consent — retour null.");
      return res.json({ success: true, data: null, degraded: true });
    }
    safeLogger.error("[UserDocuments] ❌ Erreur récupération consentement", { error: err });
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// 5. POST /api/v1/user-documents/consent - Save user consent preferences
userDocumentsRouter.post(
  "/consent",
  authenticateToken,
  validateRequest(ConsentSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ success: false, error: "Non authentifié" });

    const body = req.body as UserDataConsentPreferences;
    try {
      await db.collection("users").doc(userId).collection("consents").doc("privacy").set(body, { merge: true });
      if (isServerCacheEnabled()) consentServerCache.set(`consent:${userId}`, body);
      safeLogger.info(`[UserDocuments] 🟢 Consentement enregistré pour uid=${userId}`);
      return res.json({ success: true, data: body });
    } catch (err) {
      if (isFirestoreQuotaError(err)) {
        safeLogger.warn("[UserDocuments] ⚠️ Quota Firestore atteint sur POST /consent.");
        return res.json({ success: true, data: body, degraded: true });
      }
      safeLogger.error("[UserDocuments] ❌ Erreur enregistrement consentement", { error: err });
      return res.status(500).json({ success: false, error: "Erreur serveur" });
    }
  }
);
