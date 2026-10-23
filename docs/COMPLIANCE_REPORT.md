# Rapport de Conformité — Olmart Algérie

## 1. Conformité des Règles d'Architecture
- **Règle IDOR & RBAC :** Contrôles stricts `req.user.uid === resource.ownerId` et vérification des rôles administrateur / vendeur côté serveur via les middlewares d'authentification.
- **Règle Transactions ACID :** Implémentation via `db.runTransaction()` dans les services de commande (`orderPlacement.service.ts`), de panier et de gestion des stocks.
- **Règle Isolation SDK :** Aucune fuite de `firebase-admin` ou `nodemailer` dans le code client React. Validation par linter et build Vite.

## 2. Conformité de l'Environnement d'Exécution & Docker
- Image de base épinglée : `node:22.23-alpine@sha256:...`.
- Utilisation stricte de `npm ci --omit=dev` et démarrage via `node dist/server.cjs`.
- Variables d'environnement `VITE_*` injectées à la construction par la CI.
- Healthchecks configurés (`/health/live`, `/health/ready` avec sondage Firestore et code 503 en cas de défaillance).

## 3. Conformité Qualité & Tests
- Couverture de test ≥ 60% pour les domaines et middlewares critiques.
- Linting strict avec `eslint.config.js` (`max-lines: 250`, `@typescript-eslint/no-explicit-any: error`, `no-console: error`).
- Contrôle i18n automatisé par `scripts/i18n-check.ts`.
