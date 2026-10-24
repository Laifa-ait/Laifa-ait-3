import { Router, Response } from "express";
import { z } from "zod";
import { authenticateToken, authorizeSeller, authorizeAdmin, AuthenticatedRequest } from "../../middlewares/auth";
import { ai, DEFAULT_GEMINI_MODEL } from "../../config/gemini";
import { AiService } from "../../services/AiService";
import { safeLogger } from "../../utils/logger";
import { LocaleStorageService } from "../../services/LocaleStorageService";
import rateLimit from "express-rate-limit";
import NodeCache from "node-cache";

const router = Router();

// Rate limiter pour l'IA par UID ou IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limite à 20 requêtes par fenêtre par utilisateur
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req: AuthenticatedRequest) => req.user?.uid || req.ip || "unknown",
  handler: (_req: AuthenticatedRequest, res: Response) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ error: "Trop de requêtes. Veuillez patienter avant de renvoyer un message." });
  }
});

// Cache en mémoire pour réduire les coûts de l'API Gemini avec TTL pour éviter memory leak
const descCache = new NodeCache({ stdTTL: 300, checkperiod: 600 });
const newsCache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

const translateTextSchema = z.object({
  text: z.string().min(1, "Le texte ne peut pas être vide").max(5000, "Le texte ne peut pas dépasser 5000 caractères"),
  targetLangs: z.array(z.string().min(2).max(10)).min(1, "Au moins une langue cible est requise").max(5, "Maximum 5 langues cibles"),
});

const translateSingleKeySchema = z.object({
  fr: z.string().min(1, "La clé ne peut pas être vide").max(1000, "La clé ne peut pas dépasser 1000 caractères"),
});

// --- Admin Translation Endpoints ---

router.post(
  "/admin/translate-text",
  authenticateToken,
  authorizeAdmin,
  aiLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    const parseResult = translateTextSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Corps de requête invalide", details: parseResult.error.issues });
    }

    try {
      const result = await AiService.translateText(parseResult.data.text, parseResult.data.targetLangs);
      res.json(result);
    } catch (error: unknown) {
      safeLogger.error("translateText error", { err: error instanceof Error ? error.message : String(error) });
      return res.status(503).json({ error: "Service de traduction IA temporairement indisponible." });
    }
  }
);

router.post(
  "/admin/translate-single-key",
  authenticateToken,
  authorizeAdmin,
  aiLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    const parseResult = translateSingleKeySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Corps de requête invalide", details: parseResult.error.issues });
    }

    try {
      const result = await AiService.translateSingleKey(parseResult.data.fr);
      res.json(result);
    } catch (error: unknown) {
      safeLogger.error("translateSingleKey error", { err: error instanceof Error ? error.message : String(error) });
      return res.status(503).json({ error: "Service de traduction IA temporairement indisponible." });
    }
  }
);

router.post(
  "/admin/translate-fictive",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const count = await AiService.fixFictiveTranslations(req.user?.uid);
      res.json({ message: "Success", count });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur serveur";
      res.status(500).json({ error: msg });
    }
  }
);

router.post(
  "/admin/translate-ui",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const frContent = await LocaleStorageService.getMergedLocale("fr");
      const arContent = await LocaleStorageService.getMergedLocale("ar");
      const enContent = await LocaleStorageService.getMergedLocale("en");

      const clientHarvested: string[] = req.body.harvestedKeys || [];
      const harvested = new Set<string>(clientHarvested);

      let frModified = false;
      harvested.forEach((key) => {
        if (!frContent[key]) {
          frContent[key] = key;
          frModified = true;
        }
      });

      if (frModified) {
        await AiService.dualWrite("fr", frContent, req.user?.uid);
      }

      const keysToTranslate: string[] = [];
      Object.keys(frContent).forEach((key) => {
        const arVal = arContent[key];
        const enVal = enContent[key];
        const frVal = frContent[key];

        const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text || "");
        const isNumeric = (text: string) => /^\d+$/.test(text || "");

        const containsAr = typeof arVal === "string" && isArabic(arVal);
        const sameAsFr = arVal === frVal;
        const isMissingAr =
          !arVal ||
          arVal === "" ||
          (sameAsFr && !isNumeric(key) && frVal.length > 2) ||
          !containsAr ||
          (typeof arVal === "string" &&
            (arVal.endsWith(" (AR)") || arVal.includes("{")));
        const isMissingEn =
          !enVal ||
          enVal === "" ||
          (enVal === frVal && !isNumeric(key) && frVal.length > 2) ||
          (typeof enVal === "string" &&
            (enVal.endsWith(" (EN)") || enVal.includes("{")));

        if (isMissingAr || isMissingEn) {
          keysToTranslate.push(key);
        }
      });

      if (keysToTranslate.length === 0) {
        return res.json({ message: "Tout est déjà à jour.", count: 0 });
      }

      const BATCH_SIZE = 30;
      let totalTranslated = 0;
      let mockedCount = 0;
      let lastError: string | null = null;
      const MAX_KEYS_PER_CALL = 300;

      for (
        let i = 0;
        i < Math.min(keysToTranslate.length, MAX_KEYS_PER_CALL);
        i += BATCH_SIZE
      ) {
        const batchKeys = keysToTranslate.slice(i, i + BATCH_SIZE);

        try {
          const objToTranslate: Record<string, string> = {};
          batchKeys.forEach((k) => {
            if (frContent[k]) objToTranslate[k] = frContent[k];
          });

          if (Object.keys(objToTranslate).length > 0) {
            const response = await ai.models.generateContent({
              model: DEFAULT_GEMINI_MODEL,
              contents: `Translate the following JSON object values from French to Arabic and English. Return ONLY a pure JSON object mapping the same keys to an object with "ar" and "en" properties. JSON format: { "key1": {"ar": "...", "en": "..."}, "key2": ... }.\n\n${JSON.stringify(objToTranslate)}`,
              config: { responseMimeType: "application/json" }
            });

            const resultText = response.text || "{}";
            const jsonStr = resultText.match(/\{[\s\S]*\}/)?.[0] || resultText;
            const parsed: Record<string, { ar?: string; en?: string }> = JSON.parse(jsonStr);

            batchKeys.forEach((key) => {
              if (parsed[key]) {
                arContent[key] = parsed[key].ar || frContent[key] + " (AR)";
                enContent[key] = parsed[key].en || frContent[key] + " (EN)";
              } else {
                arContent[key] = frContent[key] + " (AR)";
                enContent[key] = frContent[key] + " (EN)";
                mockedCount++;
              }
            });
          }

          totalTranslated += batchKeys.length;

          if (
            i + BATCH_SIZE <
            Math.min(keysToTranslate.length, MAX_KEYS_PER_CALL)
          ) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        } catch (err: unknown) {
          safeLogger.error("Gemini Translate batch error", { err: err instanceof Error ? err.message : String(err) });
          const errObj = err instanceof Error ? err : new Error(String(err));
          lastError = errObj.message || errObj.toString();
          batchKeys.forEach((k) => {
            arContent[k] = frContent[k] + " (AR)";
            enContent[k] = frContent[k] + " (EN)";
            mockedCount++;
          });
        }
      }

      await AiService.dualWrite("ar", arContent, req.user?.uid);
      await AiService.dualWrite("en", enContent, req.user?.uid);

      res.json({
        message:
          mockedCount > 0
            ? `L'extraction a été faite, mais ${mockedCount} clés ont été suffixées par (AR)/(EN) car l'API Gemini a échoué (Limite de quota ou clé invalide).`
            : "Extraction et traduction réussies",
        count: totalTranslated,
        mockedCount,
        lastError,
        remaining: Math.max(0, keysToTranslate.length - MAX_KEYS_PER_CALL),
      });
    } catch (error: unknown) {
      const errObj = error instanceof Error ? error : new Error(String(error));
      const errString = String(errObj.message || error).toLowerCase();
      if (
        !errString.includes("429") &&
        !errString.includes("resource_exhausted") &&
        !errString.includes("dunning") &&
        !errString.includes("permission_denied") &&
        !errString.includes("403")
      ) {
        safeLogger.error("Translate UI Error", { err: error instanceof Error ? error.message : String(error) });
      }

      let finalMessage = error instanceof Error ? error.message : String(error);
      if (errString.includes("expired")) {
        finalMessage =
          "La clé d'API Gemini a expiré. Veuillez obtenir une nouvelle clé gratuite sur Google AI Studio et la mettre à jour dans les paramètres.";
      } else if (
        errString.includes("429") ||
        errString.includes("resource_exhausted")
      ) {
        finalMessage = "Vos crédits de traduction (Gemini API) sont épuisés.";
      } else if (
        errString.includes("dunning") ||
        errString.includes("permission_denied") ||
        errString.includes("403")
      ) {
        finalMessage =
          "Problème de facturation Google Cloud (Dunning). Veuillez vérifier la carte bancaire ou le quota associé à votre projet Google Cloud.";
      }
      res.status(500).json({ error: finalMessage });
    }
  }
);

router.post(
  "/admin/translate-preview",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { terms } = req.body;
      if (!Array.isArray(terms) || terms.length === 0) {
        return res.status(400).json({ error: "Liste de termes requise" });
      }

      const arContent = await LocaleStorageService.getMergedLocale("ar");
      const enContent = await LocaleStorageService.getMergedLocale("en");

      const result: Record<string, { ar: string; en: string; isNew: boolean }> = {};
      const termsToTranslate: string[] = [];

      terms.forEach((term) => {
        const arExisting = arContent[term];
        const enExisting = enContent[term];

        const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text || "");
        const containsAr = typeof arExisting === "string" && isArabic(arExisting);

        const isMissingAr = !arExisting || arExisting === "" || arExisting === term || !containsAr || arExisting.endsWith(" (AR)");
        const isMissingEn = !enExisting || enExisting === "" || enExisting === term || enExisting.endsWith(" (EN)");

        if (isMissingAr || isMissingEn) {
          termsToTranslate.push(term);
        } else {
          result[term] = {
            ar: arExisting,
            en: enExisting,
            isNew: false,
          };
        }
      });

      if (termsToTranslate.length > 0) {
        const BATCH_SIZE = 30;
        for (let i = 0; i < termsToTranslate.length; i += BATCH_SIZE) {
          const batch = termsToTranslate.slice(i, i + BATCH_SIZE);
          const objToTranslate: Record<string, string> = {};
          batch.forEach((t) => {
            objToTranslate[t] = t;
          });

          const response = await ai.models.generateContent({
            model: DEFAULT_GEMINI_MODEL,
            contents: `Translate the following JSON object values from French to Arabic and English. Return ONLY a pure JSON object mapping the same keys to an object with "ar" and "en" properties. JSON format: { "key1": {"ar": "...", "en": "..."}, "key2": ... }.\n\n${JSON.stringify(objToTranslate)}`,
            config: { responseMimeType: "application/json" },
          });

          const resultText = response.text || "{}";
          const jsonStr = resultText.match(/\{[\s\S]*\}/)?.[0] || resultText;
          const parsed: Record<string, { ar?: string; en?: string }> = JSON.parse(jsonStr);

          batch.forEach((term) => {
            const arVal = parsed[term]?.ar || term;
            const enVal = parsed[term]?.en || term;
            result[term] = {
              ar: arVal,
              en: enVal,
              isNew: true,
            };
          });
        }
      }

      res.json({ translations: result });
    } catch (error: unknown) {
      safeLogger.error("Translate Preview Error", { err: error instanceof Error ? error.message : String(error) });
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: msg });
    }
  }
);

router.post(
  "/admin/translate-commit",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { translations } = req.body;
      if (!translations || typeof translations !== "object") {
        return res.status(400).json({ error: "Traductions requises" });
      }

      const frContent = await LocaleStorageService.getMergedLocale("fr");
      const arContent = await LocaleStorageService.getMergedLocale("ar");
      const enContent = await LocaleStorageService.getMergedLocale("en");

      let modified = false;

      Object.entries(translations).forEach(([term, trans]) => {
        const tAny = trans as { ar: string; en: string };
        if (!frContent[term]) {
          frContent[term] = term;
          modified = true;
        }
        arContent[term] = tAny.ar;
        enContent[term] = tAny.en;
      });

      if (modified) {
        await AiService.dualWrite("fr", frContent, req.user?.uid);
      }
      await AiService.dualWrite("ar", arContent, req.user?.uid);
      await AiService.dualWrite("en", enContent, req.user?.uid);

      res.json({ message: "Traductions appliquées et enregistrées avec succès !" });
    } catch (error: unknown) {
      safeLogger.error("Translate Commit Error", { err: error instanceof Error ? error.message : String(error) });
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: msg });
    }
  }
);

router.post(
  "/admin/generate-newsletter",
  authenticateToken,
  authorizeAdmin,
  aiLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt requis" });

    if (newsCache.has(prompt)) {
      return res.json(newsCache.get(prompt));
    }

    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: `Générez une newsletter de luxe pour Olma Marketplace basée sur ceci: "${prompt}". 
    Répondez au format JSON strict:
    {
      "subject": "Appel de l'objet",
      "blocks": [
        { "id": "1", "type": "title", "content": "..." },
        { "id": "2", "type": "text", "content": "..." },
        { "id": "3", "type": "image", "content": "/images/placeholders/product.svg" }
      ]
    }
    Répondez uniquement avec le JSON.`,
        config: { responseMimeType: "application/json" }
      });
      const text = response.text || "";
      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
      const parsed = JSON.parse(jsonStr);
      newsCache.set(prompt, parsed);
      res.json(parsed);
    } catch (err: unknown) {
      safeLogger.error("generate-newsletter error", { err: err instanceof Error ? err.message : String(err) });
      return res.status(503).json({ error: "Génération de newsletter IA temporairement indisponible." });
    }
  }
);

import { generateProductDescriptionService } from "./productDescriptionAi";

// --- Seller AI Endpoints ---

router.post(
  "/generate-description",
  authenticateToken,
  authorizeSeller,
  aiLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      productName,
      category,
      subcategory,
      subSubCategory,
      brand,
      attributes,
      materials,
      warranty,
      condition,
    } = req.body;
    if (!productName)
      return res.status(400).json({ error: "productName requis" });

    const cacheKey = `${productName}-${category || "Général"}-${subcategory || ""}-${brand || ""}`;
    if (descCache.has(cacheKey)) {
      return res.json({ description: descCache.get(cacheKey) });
    }

    try {
      const desc = await generateProductDescriptionService({
        productName,
        category,
        subcategory,
        subSubCategory,
        brand,
        attributes,
        materials,
        warranty,
        condition,
      });
      descCache.set(cacheKey, desc);
      res.json({ description: desc });
    } catch (err: unknown) {
      safeLogger.error("generate-description error", { err: err instanceof Error ? err.message : String(err) });
      return res.status(503).json({ error: "Génération de description produit temporairement indisponible." });
    }
  }
);

router.post(
  "/translate-product",
  authenticateToken,
  authorizeSeller,
  aiLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, description } = req.body;
    if (!name || !description)
      return res.status(400).json({ error: "name et description requis" });

    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: `You are Mabrouk, Olmart's Algerian e-commerce translation and copywriting specialist.
Translate and adapt the product title and description into 3 languages: French (fr), Modern Standard Arabic (ar), and English (en).

Input Name: "${name}"
Input Description: "${description}"

Rules:
1. "ar" MUST be real Arabic words (اللغة العربية الفصحى الواضحة للتجارة الإلكترونية).
2. "en" MUST be real English words for e-commerce.
3. "fr" MUST be clean, natural French.
4. Return ONLY a valid JSON object matching this structure:
{
  "name": { "fr": "...", "ar": "...", "en": "..." },
  "description": { "fr": "...", "ar": "...", "en": "..." }
}`,
        config: { responseMimeType: "application/json" }
      });

      const resultText = response.text || "{}";
      const jsonStr = resultText.match(/\{[\s\S]*\}/)?.[0] || resultText;
      const parsed: {
        name?: { fr?: string; ar?: string; en?: string };
        description?: { fr?: string; ar?: string; en?: string };
      } = JSON.parse(jsonStr);

      const frName = parsed.name?.fr?.trim() || name;
      const arName = parsed.name?.ar?.trim() || name;
      const enName = parsed.name?.en?.trim() || name;

      const frDesc = parsed.description?.fr?.trim() || description;
      const arDesc = parsed.description?.ar?.trim() || description;
      const enDesc = parsed.description?.en?.trim() || description;

      return res.json({
        success: true,
        isFree: true,
        costDZD: 0,
        name: {
          fr: frName,
          ar: arName,
          en: enName,
        },
        description: {
          fr: frDesc,
          ar: arDesc,
          en: enDesc,
        },
      });
    } catch (error: unknown) {
      safeLogger.error("Gemini Free Translation Error", { err: error instanceof Error ? error.message : String(error) });
      return res.status(503).json({
        success: false,
        error: "Erreur lors de la traduction automatique",
      });
    }
  }
);

router.post("/seller/analyze-image", authenticateToken, authorizeSeller, aiLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.body.imageUrl) return res.status(400).json({ error: "imageUrl requis" });
    const result = await AiService.analyzeSellerImage(req.body.imageUrl);
    res.json(result);
  } catch (err: unknown) {
    safeLogger.error("analyzeSellerImage error", { err: err instanceof Error ? err.message : String(err) });
    return res.status(503).json({ error: "Service d'analyse d'image temporairement indisponible." });
  }
});

export default router;
