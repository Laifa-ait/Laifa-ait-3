import { admin } from "../../../config/firebase-admin";
import { ai, DEFAULT_GEMINI_MODEL } from "../../../config/gemini";
import { safeLogger } from "../../../utils/logger";
import { AiAgentsConfigMap } from "../types/ai.types";
import {
  buildCartFallbackPreview,
  buildGrowthFallbackReport,
  buildModerationFallbackResult,
  buildSentinelFallbackReport,
} from "./adminAIFallbacks";

export const DEFAULT_AGENTS_CONFIG: AiAgentsConfigMap = {
  growth: {
    isActive: true,
    focusCategory: "Tout",
    marketContext:
      "Mots-clés recherchés en Algérie (robes de mariée, bijoux berbères, maroquinerie de Tlemcen, dattes Deglet Nour, cosmétiques bio, qalb el louz, ustensiles traditionnels). Stratégie de prix en DA (Dinar Algérien).",
    analysisFrequency: "daily",
  },
  cart: {
    isActive: true,
    discountCode: "OLMARECOVERY10",
    discountPercent: 10,
    followUpDelay: 4,
    tone: "luxury",
  },
  moderator: {
    isActive: false,
    strictness: "strict",
    languages: "FR, AR",
    customForbiddenWords:
      "whatsapp, viber, telegram, téléphone, phone, contactez-moi, facebook, +213, ouedkniss, fennec",
  },
  support: {
    isActive: false,
    kbContext:
      "Délais de livraison : Alger (24h-48h, 400 DA), Oran (48h-72h, 500 DA), Constantine (48h-72h, 500 DA), Grand Sud (3-5 jours, 800 DA). Tous paiements en Cash on Delivery (COD) à la livraison. Les retours sont possibles sous 7 jours si le produit n'est pas utilisé et est retourné dans son emballage d'origine.",
    personality: "warm",
  },
  sentinel: {
    isActive: true,
    autoScanInterval: "hourly",
    alertThreshold: "warning",
    autoFixEnabled: true,
  },
};

export class AdminAIService {
  static async getAgentsConfigFromDb(): Promise<AiAgentsConfigMap> {
    const snapshot = await admin.firestore().collection("ai_agents").get();
    const configs: AiAgentsConfigMap = JSON.parse(JSON.stringify(DEFAULT_AGENTS_CONFIG));
    snapshot.docs.forEach((doc) => {
      const key = doc.id;
      if (configs[key]) {
        configs[key] = { ...configs[key], ...doc.data() };
      }
    });
    return configs;
  }

  static async toggleAgentStatus(key: string, isActive: boolean): Promise<void> {
    const ref = admin.firestore().collection("ai_agents").doc(key);
    await ref.set({ isActive }, { merge: true });
  }

  static async configureAgent(key: string, configData: Record<string, unknown>): Promise<void> {
    const ref = admin.firestore().collection("ai_agents").doc(key);
    await ref.set({ ...configData }, { merge: true });
  }

  static async runGrowthAgent(): Promise<Record<string, unknown>> {
    const productsSnap = await admin.firestore().collection("products").limit(20).get();
    const productsList = productsSnap.docs.map((doc) => ({
      name: String(doc.data().name || ""),
      category: String(doc.data().category || ""),
      price: Number(doc.data().price || 0),
      viewsCount: Number(doc.data().viewsCount || 0),
      salesCount: Number(doc.data().salesCount || 0),
    }));

    const agentConfigs = await this.getAgentsConfigFromDb();
    const growthConfig = agentConfigs.growth;

    let parsedReport: Record<string, unknown>;
    try {
      const systemPrompt = `Vous êtes un analyste de croissance IA senior spécialisé dans l'e-commerce en Algérie (69 wilayas) pour Olma Marketplace.
Contexte configuré : ${growthConfig.marketContext}
Catégorie cible configurée : ${growthConfig.focusCategory}
Répondez STRICTEMENT au format JSON avec les clés : summary, kpis, pricingTips, topSearches, actionableAdvice.`;

      const prompt = `Voici la liste échantillonnée de nos produits actuels en base de données : ${JSON.stringify(productsList)}. Veuillez générer l'analyse de croissance complète en JSON.`;

      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      const reportText = response.text || "{}";
      parsedReport = JSON.parse(reportText.match(/\{[\s\S]*\}/)?.[0] || reportText);
    } catch (err: unknown) {
      safeLogger.warn("[AdminAIService] Gemini unavailable for Growth Agent, using real-data telemetry fallback", {
        err: err instanceof Error ? err.message : String(err),
      });
      parsedReport = buildGrowthFallbackReport(productsList, growthConfig);
    }

    const reportRef = admin.firestore().collection("ai_growth_reports").doc();
    const reportDoc = {
      ...parsedReport,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await reportRef.set(reportDoc);

    return reportDoc;
  }

  static async runCartSimulation(): Promise<{ preview: Record<string, unknown>; cart: Record<string, unknown> }> {
    const agentConfigs = await this.getAgentsConfigFromDb();
    const cartConfig = agentConfigs.cart;

    const sampleCart = {
      customerName: "Amine Belkacem",
      customerEmail: "amine.belk@gmail.com",
      items: [
        { name: "Karakou Algérois Traditionnel en Velours", price: 38000, quantity: 1 },
        { name: "Pochette de Soirée Brodée Or", price: 6500, quantity: 1 },
      ],
      totalAmount: 44500,
    };

    try {
      const prompt = `Générez un e-mail de relance de panier abandonné pour "${sampleCart.customerName}" (${sampleCart.totalAmount} DA) avec le code "${cartConfig.discountCode}" (-${cartConfig.discountPercent}%), ton "${cartConfig.tone}". Retournez un JSON avec subject et htmlBody.`;
      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: "Vous êtes l'agent IA de récupération de panier Olma.",
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
      return { preview: parsed, cart: sampleCart };
    } catch (err: unknown) {
      safeLogger.warn("[AdminAIService] Gemini unavailable for Cart Simulation, using deterministic template", {
        err: err instanceof Error ? err.message : String(err),
      });
      return {
        preview: buildCartFallbackPreview(sampleCart, cartConfig),
        cart: sampleCart,
      };
    }
  }

  static async moderateProduct(title: string, description: string): Promise<Record<string, unknown>> {
    const agentConfigs = await this.getAgentsConfigFromDb();
    const modConfig = agentConfigs.moderator;

    try {
      const systemPrompt = `Vous êtes le Modérateur de Contenu IA pour Olma Marketplace en Algérie.
Mots interdits configurés : ${modConfig.customForbiddenWords}
Niveau de sévérité : ${modConfig.strictness}
Retournez un objet JSON avec : approved (boolean), qualityScore (number), infractionsDetected (string[]), feedback (string), checklist ({ label: string, passed: boolean }[]).`;

      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: `Titre du produit : "${title}"\nDescription : "${description}"`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
    } catch (err: unknown) {
      safeLogger.warn("[AdminAIService] Gemini unavailable for Product Moderation, using lexical rule engine", {
        err: err instanceof Error ? err.message : String(err),
      });
      return buildModerationFallbackResult(title, description, modConfig);
    }
  }

  static async runSentinelDiagnostic(adminEmail: string): Promise<Record<string, unknown>> {
    let siteErrors: Array<Record<string, unknown>> = [];
    try {
      const siteErrorsSnap = await admin.firestore().collection("site_errors").orderBy("timestamp", "desc").limit(10).get();
      siteErrors = siteErrorsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch {
      siteErrors = [];
    }

    let checkoutAudits: Array<Record<string, unknown>> = [];
    try {
      const checkoutAuditsSnap = await admin.firestore().collection("checkout_audits").orderBy("timestamp", "desc").limit(5).get();
      checkoutAudits = checkoutAuditsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch {
      checkoutAudits = [];
    }

    let auditLogs: Array<Record<string, unknown>> = [];
    try {
      const auditLogsSnap = await admin.firestore().collection("audit_logs").orderBy("timestamp", "desc").limit(10).get();
      auditLogs = auditLogsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch {
      auditLogs = [];
    }

    let parsed: Record<string, unknown>;
    try {
      const systemPrompt = `Vous êtes l'Agent Sentinel & Inspecteur de Santé Système IA d'Olmart Marketplace (Algérie).
Analysez la télémétrie fournie et répondez STRICTEMENT au format JSON avec : healthIndex, statusLabel, issuesFound, systemChecks, summary.`;

      const prompt = `Télémétrie actuelle :
1. Erreurs (site_errors) : ${JSON.stringify(siteErrors)}
2. Audits Checkout (checkout_audits) : ${JSON.stringify(checkoutAudits)}
3. Journaux d'Audit (audit_logs) : ${JSON.stringify(auditLogs)}`;

      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
    } catch (err: unknown) {
      safeLogger.warn("[AdminAIService] Gemini unavailable for Sentinel Diagnostic, using real-telemetry diagnostic engine", {
        err: err instanceof Error ? err.message : String(err),
      });
      parsed = buildSentinelFallbackReport(siteErrors, checkoutAudits, auditLogs);
    }

    const diagRef = admin.firestore().collection("ai_diagnostics").doc();
    const diagDoc = {
      ...parsed,
      timestamp: new Date().toISOString(),
      createdBy: adminEmail || "admin@olmart.dz",
    };
    await diagRef.set(diagDoc);

    return diagDoc;
  }
}
