import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const openApiRegistry = new OpenAPIRegistry();

// Bearer Auth
openApiRegistry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// 1. Health
openApiRegistry.registerPath({
  method: "get",
  path: "/health",
  summary: "Health & Readiness Probe",
  description: "Vérifie la réactivité du serveur Express et la connexion à Firebase Admin SDK.",
  responses: {
    200: {
      description: "Système sain et opérationnel",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string(),
            timestamp: z.string(),
            uptime: z.number(),
            firebase: z.string(),
          }).openapi("HealthResponse"),
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: "get",
  path: "/health/live",
  summary: "Liveness Probe",
  description: "Sonde de réactivité réseau légère.",
  responses: {
    200: {
      description: "Serveur actif",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string(),
          }).openapi("LiveResponse"),
        },
      },
    },
  },
});

// 2. Auth & 2FA
openApiRegistry.registerPath({
  method: "post",
  path: "/auth/2fa/send-code",
  summary: "Envoi de Code 2FA par E-mail",
  description: "Génère un OTP salé/poivré et l'achemine à l'utilisateur authentifié par e-mail transactionnel.",
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: "Code 2FA envoyé" },
    401: { description: "Non authentifié" },
    429: { description: "Limite de requêtes atteinte" },
  },
});

openApiRegistry.registerPath({
  method: "post",
  path: "/auth/2fa/verify",
  summary: "Vérification du Code 2FA",
  description: "Valide le code OTP 2FA à 6 chiffres ou un code de secours OLM-XXXXXX.",
  security: [{ BearerAuth: [] }],
  request: {
    content: {
      "application/json": {
        schema: z.object({
          code: z.string().min(6).openapi({ example: "123456" }),
        }),
      },
    },
  },
  responses: {
    200: { description: "Validation réussie" },
    400: { description: "Format de code invalide" },
    403: { description: "Code invalide ou expiré" },
    429: { description: "Nombre maximal d'essais dépassé (5/5)" },
  },
});

// 3. Products
openApiRegistry.registerPath({
  method: "get",
  path: "/products",
  summary: "Consultation du Catalogue Produits",
  description: "Liste facettée des articles filtrable par catégorie, wilaya, statut et plage de prix.",
  request: {
    query: z.object({
      category: z.string().optional(),
      wilaya: z.string().optional(),
      minPrice: z.coerce.number().optional(),
      maxPrice: z.coerce.number().optional(),
      limit: z.coerce.number().optional().default(20),
    }),
  },
  responses: {
    200: { description: "Liste des produits retournée" },
  },
});

openApiRegistry.registerPath({
  method: "get",
  path: "/products/{id}",
  summary: "Détails d'un Produit",
  description: "Récupère la fiche détaillée d'un produit par son identifiant.",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: { description: "Fiche produit trouvée" },
    404: { description: "Produit non trouvé" },
  },
});

openApiRegistry.registerPath({
  method: "post",
  path: "/products",
  summary: "Création d'un Produit Marchand",
  description: "Création d'une fiche article avec poids d'expédition obligatoire pour calcul du fret terrestre.",
  security: [{ BearerAuth: [] }],
  request: {
    content: {
      "application/json": {
        schema: z.object({
          name: z.string().min(2),
          price: z.number().positive(),
          category: z.string(),
          weight: z.number().positive(),
          stock: z.number().int().nonnegative(),
        }).openapi("CreateProductInput"),
      },
    },
  },
  responses: {
    201: { description: "Produit créé avec succès" },
    400: { description: "Champs invalides ou manquants" },
    403: { description: "Accès refusé - Compte non vendeur" },
  },
});

// 4. Orders
openApiRegistry.registerPath({
  method: "post",
  path: "/orders/checkout",
  summary: "Passation de Commande (Checkout ACID)",
  description: "Réservation sérialisée des stocks et création de la commande sous transaction ACID Firestore.",
  security: [{ BearerAuth: [] }],
  request: {
    content: {
      "application/json": {
        schema: z.object({
          items: z.array(z.object({
            productId: z.string(),
            quantity: z.number().int().positive(),
          })),
          shippingAddress: z.object({
            fullName: z.string(),
            address: z.string(),
            wilaya: z.string(),
            phone: z.string(),
          }),
        }).openapi("CheckoutInput"),
      },
    },
  },
  responses: {
    200: { description: "Commande validée avec succès" },
    400: { description: "Stock insuffisant ou données invalides" },
    401: { description: "Authentification requise" },
  },
});

openApiRegistry.registerPath({
  method: "get",
  path: "/orders",
  summary: "Liste des Commandes",
  description: "Récupère les commandes de l'utilisateur connecté avec contrôle IDOR strict.",
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: "Liste des commandes" },
    401: { description: "Non authentifié" },
  },
});

openApiRegistry.registerPath({
  method: "get",
  path: "/orders/{orderId}",
  summary: "Détail d'une Commande",
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ orderId: z.string() }) },
  responses: {
    200: { description: "Détails de la commande" },
    403: { description: "Accès refusé (IDOR)" },
    404: { description: "Commande introuvable" },
  },
});

openApiRegistry.registerPath({
  method: "post",
  path: "/orders/{orderId}/returns",
  summary: "Demande de Retour de Merchandise",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ orderId: z.string() }),
    content: {
      "application/json": {
        schema: z.object({
          reason: z.string().min(5),
        }),
      },
    },
  },
  responses: {
    200: { description: "Demande de retour enregistrée" },
    400: { description: "Délai de retour dépassé ou raison non valide" },
  },
});

// 5. AI Services
openApiRegistry.registerPath({
  method: "post",
  path: "/ai/admin/translate-text",
  summary: "Traduction Textuelle Multilingue (Admin)",
  security: [{ BearerAuth: [] }],
  request: {
    content: {
      "application/json": {
        schema: z.object({
          text: z.string().min(1).max(5000),
          targetLangs: z.array(z.string()).min(1).max(5),
        }),
      },
    },
  },
  responses: {
    200: { description: "Traductions générées par Gemini API" },
    400: { description: "Format de requête invalide" },
    503: { description: "Service IA indisponible" },
  },
});

openApiRegistry.registerPath({
  method: "post",
  path: "/ai/generate-description",
  summary: "Génération de Description Produit IA (Seller)",
  security: [{ BearerAuth: [] }],
  request: {
    content: {
      "application/json": {
        schema: z.object({
          productName: z.string().min(1),
          category: z.string().optional(),
        }),
      },
    },
  },
  responses: {
    200: { description: "Description produit générée par l'IA" },
    503: { description: "Service IA temporairement indisponible" },
  },
});

// 6. Admin Users
openApiRegistry.registerPath({
  method: "get",
  path: "/admin/users",
  summary: "Gestion des Utilisateurs Assainie (Admin)",
  description: "Retourne les utilisateurs inscrits en élaguant strictement les données PII sensibles (RIB, NIF, documents).",
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      limit: z.coerce.number().int().min(1).max(100).default(100),
      status: z.string().optional(),
    }),
  },
  responses: {
    200: { description: "Liste des utilisateurs assainie" },
    400: { description: "Paramètres de requête invalides (ex: limit > 100)" },
    403: { description: "Accès refusé" },
  },
});

openApiRegistry.registerPath({
  method: "delete",
  path: "/admin/users/{id}",
  summary: "Suppression d'un Compte Utilisateur (Admin)",
  description: "Supprime le compte dans Firebase Auth et Firestore, révoque les jetons et journalise l'action.",
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: "Compte supprimé" },
    400: { description: "Tentative d'auto-suppression refusée" },
    403: { description: "Hiérarchie de rôle insuffisante" },
  },
});

export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Olmart API v1 Specification",
      description: "Spécification OpenAPI 3.0 officielle et vérifiée des endpoints REST d'Olmart Marketplace.",
    },
    servers: [{ url: "/api/v1" }],
  });
}
