# OLMART — Super-App & Marketplace E-Commerce Multi-Vendeurs (69 Wilayas)

[![Olmart CI](https://github.com/Laifa-ait/Laifa-ait-3/actions/workflows/ci.yml/badge.svg)](https://github.com/Laifa-ait/Laifa-ait-3/actions/workflows/ci.yml)
![Vite 8.3](https://img.shields.io/badge/Vite-8.3-646CFF.svg)
![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg)
![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict_5.8-3178C6.svg)
![Tailwind CSS 4.3](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC.svg)
![Tests: Vitest & Playwright](https://img.shields.io/badge/tests-Vitest_4.1_%7C_Playwright-44a833.svg)
![License: Proprietary](https://img.shields.io/badge/license-Proprietary-red.svg)

Plateforme e-commerce et Super-App de niveau industriel dédiée au marché algérien, couvrant l'ensemble des **69 wilayas**. Le système intègre :
* **Marketplace E-Commerce & Taxonomie Canonique** : Catalogue unifié avec navigation guidée par tiroir en 3 étapes (`Rayon` ➔ `Sous-catégorie` ➔ `Spécialité`), gouvernance des catégories en temps réel par l'administrateur (`/api/v1/admin/categories`), et paiement à la livraison (COD).
* **Studio Vendeur 3.0 (Architecture type Shopify Online Store 2.0)** : Constructeur de boutique en temps réel avec *Setup Launchpad* (6 jalons), barre d'annonce promotionnelle, en-tête et menus personnalisables, sections & sous-blocs dynamiques, archétypes sectoriels, configuration COD/livraison gratuite (DZD), Mode Vacances/Pré-lancement et pixels marketing (**Meta Pixel**, **TikTok Pixel**, **GA4**).
* **Univers Verticaux Dédiés** :
  * **Olma Immo (`/immo`)** : Annonces immobilières vérifiées et planification de visites.
  * **Olma Auto (`/auto`)** : Recherche de véhicules par marque (39 marques), annonces automobiles et pièces détachées.
  * **Olma Artisans & Bricolage (`/artisans`)** : Annuaire de professionnels et artisans qualifiés par wilaya.

---

## 🏛️ Architecture & Gouvernance

L'application est structurée selon une approche modulaire guidée par le domaine (**Domain-Driven Design**) avec une limite stricte de **250 lignes maximum par fichier** (`max-lines` imposé par ESLint) :

```text
/
├── app.ts                  # Middlewares globaux Express, Sécurité (Helmet, CORS, CSRF, Rate-limiting) & montage des routes /api/v1/*
├── server.core.ts          # Cœur serveur Express compilé par Esbuild vers dist/server.cjs pour la production
├── server.ts               # Point d'entrée runtime (Serveur HTTP port 3000 + Vite Middleware en dev)
├── vite.config.ts          # Configuration de build Vite 8.3 & Tailwind CSS 4.3
├── vitest.config.ts        # Configuration des tests unitaires, d'intégration & de concurrence ACID
├── playwright.config.ts    # Configuration des parcours End-to-End (E2E) multi-univers
├── e2e/                    # Suites E2E Playwright (Checkout, Studio Vendeur, Immo, Auto & Artisans)
├── src/
│   ├── components/         # Composants UI modulaires (< 250 lignes) : Shop Drawer, Store Sections OS 2.0, Layout
│   ├── domains/            # Logique métier et contrôleurs isolés par domaine (product, seller, order, admin, etc.)
│   ├── hooks/              # Hooks partagés pour la gestion d'état réactive
│   ├── lib/                # Connecteurs Firebase Client & utilitaires d'appels API (/api/v1/* avec Bearer Token)
│   ├── pages/              # Vues applicatives (Public, Seller/StoreBuilder Studio 3.0, Admin, Immo, Auto, Artisans)
│   ├── tests/              # Tests unitaires, sécurité RBAC et concurrence Firestore (Vitest)
│   ├── types/              # Interfaces et contrats TypeScript stricts (zéro `any`)
│   └── utils/              # Taxonomie canonique (categoryCanonical.ts), traductions et helpers
```

---

## 🔒 Sécurité & Intégrité (Olmart Core Mandate)

* **Exclusivité des Endpoints `/api/v1/`** : Toutes les routes serveur et appels clients utilisent exclusivement le préfixe `/api/v1/` et renvoient une enveloppe typée `{ success: true, data: T }` ou `{ error: string }`.
* **Transactions Firestore ACID (`db.runTransaction`)** : Toute décrémentation de stock, validation de panier, publication de layout Studio 3.0 ou réservation d'URL (`shopSlug`) s'exécute obligatoirement dans une transaction Firestore atomique.
* **Server-Controlled Authorization (RBAC)** : Les privilèges administrateur sont établis et vérifiés exclusivement côté serveur via Firebase Custom Claims. Aucune liste d'emails administrateur n'est exposée côté client (`VITE_*`).
* **Herméticité aux IDOR & Compatibilité Iframe** : L'authentification transite explicitement par le header `Authorization: Bearer <token>`, avec vérification systématique `req.user.uid === resource.ownerId`.
* **Sanitization Active** : Assainissement des entrées via `isomorphic-dompurify`, validation de schémas via **Zod 4**, et politique CSP stricte.

---

## 🛠️ Stack Technique & Compilateurs

* **Frontend** : React 19.0 + TypeScript 5.8 Strict + Tailwind CSS 4.3 + Zustand 5 + TanStack Query 5.
* **Compilateurs de production** :
  * **Vite 8.3 (Oxc & Rolldown en Rust)** pour le bundle client.
  * **Esbuild** pour le bundle serveur autonome (`dist/server.cjs`).
* **Backend** : Node.js 22 (Express 4 + Firebase Admin SDK 13 + Pino Logger).
* **AI Engine** : SDK officiel `@google/genai` exécuté exclusivement côté serveur.

---

## 📋 Prérequis & Environnement Strict

L'infrastructure CI et la production exigent des versions verrouillées pour prévenir toute dérive (`lockfile drift`) :
* **Node.js** : `v22.23.2` (défini dans `.nvmrc`, plage `>=22.22.0 <23`)
* **npm** : `10.9.4` (`packageManager` verrouillé dans `package.json`)
* **Java Runtime (JRE)** : `17+` (requis uniquement pour l'exécution locale de la suite d'émulateurs Firebase)

> **Règle de gouvernance `package.json` :** Toute mise à jour de dépendance doit s'accompagner d'une régénération de `package-lock.json` et d'une vérification `npm ci --dry-run` avant commit.

---

## ⚙️ Configuration & Variables d'Environnement

Le serveur Express écoute sur le port `3000` (`0.0.0.0`) et prend également en charge le port injecté par Cloud Run (`PORT`).

1. Copiez le modèle d'environnement :
   ```bash
   cp .env.example .env
   ```
2. **Secret CSRF (`CSRF_SECRET`)** :
   * En **production** (`NODE_ENV=production`), `CSRF_SECRET` est strictement obligatoire (minimum 32 caractères aléatoires, aucun secret faible toléré sous peine d'arrêt immédiat au démarrage).
   * En **développement et test** (`NODE_ENV=development` / `test`), une clé éphémère est générée si non définie afin de faciliter l'exécution locale et les tests E2E.
   ```bash
   # Générer une clé hexadécimale robuste de 64 caractères :
   openssl rand -hex 32
   ```
3. **Variables Firebase principales (Client & Admin)** :
   * `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`
   * `FIREBASE_PROJECT_ID`, `FIREBASE_DATABASE_ID=(default)`, `FIREBASE_STORAGE_BUCKET`
   * `FIREBASE_SERVICE_ACCOUNT_KEY` (ou identité managée ADC sur Cloud Run)

---

## 🚀 Installation & Démarrage

```bash
# 1. Installation déterministe des dépendances
npm ci

# 2. Démarrage du serveur full-stack en développement (Port 3000)
npm run dev
```

---

## 🧪 Scripts & Commandes de Qualité

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le serveur Express (`tsx server.ts`) avec le middleware Vite sur le port `3000` |
| `npm run build` | Compile le frontend (`vite build`) et le serveur (`esbuild server.core.ts` ➔ `dist/server.cjs`) |
| `npm start` | Démarre le serveur applicatif (`node server.ts`) |
| `npm run lint` | Vérifie l'ensemble du code avec ESLint (incluant la règle `max-lines <= 250` et zéro `any`) |
| `npm run typecheck` | Vérifie le typage TypeScript strict (`tsc --noEmit`) |
| `npm test` | Exécute la suite de tests unitaires et d'intégration via Vitest |
| `npm run test:concurrency` | Teste la résistance aux conditions de course sur les stocks Firestore (`db.runTransaction`) |
| `npm run test:e2e` | Lance la suite de tests End-to-End Playwright (Checkout, Studio 3.0, Immo, Auto, Artisans) |
| `npm run lint:firestore-rules` | Vérifie la cohérence et la sécurité des règles `firestore.rules` |
| `npm run validate:assets` | Vérifie l'intégrité des images et ressources statiques du projet |
| `npm run format` | Formate les fichiers sources avec Prettier |

---

## 🩺 Endpoints de Supervision (Healthchecks)

* **Liveness Probe** : `GET /api/v1/health/live` ➔ Renvoie `{ status: "alive" }` (`HTTP 200`).
* **Readiness / Health Probe** : `GET /api/v1/health` ➔ Certifie la connectivité Firebase Admin et les métriques mémoire du processus.

---

## 📜 Licence

Ce projet est la propriété exclusive d'**OLMART**. Tous droits réservés. Consultez le fichier [`LICENSE`](./LICENSE) pour plus de détails.
