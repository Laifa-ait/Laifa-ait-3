# Journal de Remédiation Olmart Marketplace (REMEDIATION_LOG.md)

## 📌 Registre Synthétique des Constats d'Audit

| ID | Sévérité | Statut | Commit / Étape | Preuve (commande + résultat, ou test ajouté) | Notes |
|---|---|---|---|---|---|
| **C-01** | Critique | Corrigé | Phase 1 | `sendTwoFactorOtpEmail` + validation transactionnelle dans `src/domains/auth/auth2fa.routes.ts` | 2FA sécurisée par email et hash salé/poivré en base |
| **C-02** | Critique | Corrigé | Phase 0 | `FIRESTORE_EMULATOR_HOST= ALLOW_TESTS_WITHOUT_EMULATOR= npx vitest run src/tests/adversarialHardeningAudit.test.ts` → `Error: Refus: aucun émulateur détecté` | Projet test isolé `demo-olmart-test`, blocage ADC en test |
| **C-03** | Critique | Corrigé | Phase 1 | `npm test -- src/tests/csrfProtection.test.ts src/tests/security.test.ts` → 36 tests passés, 0 failed | CSRF fail-closed en production, suppression bypass origin |
| **C-04** | Critique | Corrigé | Phase 2 | `ALLOW_TESTS_WITHOUT_EMULATOR=true npx vitest run src/tests/orderPlacementStatusIntegrity.test.ts` → 16 passed | Vocabulaire canonique unifié (`isPurchasable`, `isSellerSellable`) |
| **C-05** | Critique | Corrigé | Phase 2 | `ALLOW_TESTS_WITHOUT_EMULATOR=true npx vitest run src/tests/orderPlacementStatusIntegrity.test.ts src/tests/E2EUserFlows.test.ts` → 29 passed | Validation transactionnelle anti-TOCTOU des statuts produits et vendeurs dans `orderPlacement.service.ts` |
| **C-07** | Critique | Corrigé | Phase 3 | `ALLOW_TESTS_WITHOUT_EMULATOR=true npx vitest run src/tests/phase3AuthorizationSecurity.test.ts` → 18 passed | Verrouillage auto-modification `rib`, `email`, `nif*`, `documents` dans `firestore.rules` |
| **C-08** | Critique | Corrigé | Phase 3 | `ALLOW_TESTS_WITHOUT_EMULATOR=true npx vitest run src/tests/phase3AuthorizationSecurity.test.ts src/tests/storageRulesIdor.test.ts` → 32 passed | `storage.rules` : écriture produit réservée à `isActiveSeller()`, participant tickets optimisé |
| **C-09** | Critique | Corrigé | Phase 3 | `ALLOW_TESTS_WITHOUT_EMULATOR=true npx vitest run src/tests/phase3AuthorizationSecurity.test.ts` → 18 passed | Rôles canoniques unifiés, claims `role` + `admin: true` + `isAdmin: true`, `superadmin ⊇ admin` partout |
| **C-10** | Critique | Corrigé | Phase 1 | `npm test -- src/tests/adversarialHardeningAudit.test.ts` → 14 passed | Empreinte `guestFingerprint`, préservation cookie invité, regex clé |
| **H-01** | Élevé | Corrigé | Phase 1 | `NODE_ENV=production CSRF_SECRET= node -e "import('./dist/server.cjs')"` → Exit 1 (boot failure) | Fail-closed au démarrage sans CSRF_SECRET >= 32 chars |
| **H-02** | Élevé | Corrigé | Phase 1 | `grep -n "run.app\|googleusercontent\|412943438773\|76420360525" src/middlewares/security.ts` → 0 résultat | Suppression des wildcards et domaines tiers en production |
| **H-03** | Élevé | Corrigé | Phase 3 | `ALLOW_TESTS_WITHOUT_EMULATOR=true npx vitest run src/tests/phase3AuthorizationSecurity.test.ts` → 18 passed | `DELETE /admin/users/:id` : anti-auto-suppression, hiérarchie de rôle, suppression Auth |
| **H-04** | Élevé | Corrigé | Phase 3 | `grep -n "match /translations" firestore.rules` → 1 résultat | Suppression doublons `translations`, `public_profiles`, `marketing_campaigns` |
| **H-05** | Élevé | Corrigé | Phase 3 | `ALLOW_TESTS_WITHOUT_EMULATOR=true npx vitest run src/tests/phase3AuthorizationSecurity.test.ts` → 18 passed | `order_logs` et `withdrawals` : `allow write: if false;` (serveur uniquement) |
| **H-06** | Élevé | Corrigé | Phase 3 | `git diff src/domains/admin/routes/adminSystem.routes.ts` | `audit_logs` retiré de la liste de purge danger zone (append-only) |
| **H-07** | Élevé | Corrigé | Phase 3 | `ALLOW_TESTS_WITHOUT_EMULATOR=true npx vitest run src/tests/phase3AuthorizationSecurity.test.ts` → 18 passed | `GET /admin/users` : validation Zod `limit` (max 100), projection explicite sans PII |
| **H-08** | Élevé | Corrigé | Phase 0 | `npx tsx scripts/cleanup-fake-data.ts` → `[DRY-RUN MODE] - 0 DELETED` | Obligation `--confirm` et `--i-know-this-is-production` |
| **M-13** | Moyen | Corrigé | Phase 0 | `grep -rn "ai-studio-217f6d79" src/ scripts/ *.json *.ts` → 0 résultat | Remplacement par placeholders dans `.env.example` et configurations |

---

## 🔬 Preuves d'Exécution Vérifiées

### Phase 0 — Rendre les accidents impossibles
1. **Recherche identifiant projet de développement dans le code source :**
```bash
$ grep -rn "ai-studio-217f6d79" src/ scripts/ *.json *.ts *.js *.html .env*
# Résultat : 0 occurrence
```
2. **Rejet strict sans émulateur actif :**
```bash
$ FIRESTORE_EMULATOR_HOST= ALLOW_TESTS_WITHOUT_EMULATOR= npx vitest run src/tests/adversarialHardeningAudit.test.ts
# Résultat : FAIL - Error: Refus: aucun émulateur détecté (port 8085 inactif et FIRESTORE_EMULATOR_HOST non défini).
```
3. **Script de nettoyage sécurisé (Aperçu passif) :**
```bash
$ npx tsx scripts/cleanup-fake-data.ts
# Résultat : 🧹 OLMART DATABASE CLEANUP [DRY-RUN MODE] - 0 DELETED
```

### Phase 1 — Rétablir la vérité des tests et de la CI
1. **Nettoyage des en-têtes et origines autorisées :**
```bash
$ grep -n "run.app\|googleusercontent\|412943438773\|76420360525" src/middlewares/security.ts
# Résultat : 0 résultat
```
2. **Fail-Closed de démarrage en production sans `CSRF_SECRET` :**
```bash
$ NODE_ENV=production CSRF_SECRET= node -e "import('./dist/server.cjs')"
# Résultat : Code 1 - [Olmart Gateway] ❌ Boot attempt 1/5 failed (err: "CSRF_SECRET is required and must be at least 32 characters in production")
```
3. **Exécution des tests de sécurité et protection CSRF :**
```bash
$ ALLOW_TESTS_WITHOUT_EMULATOR=true vitest run src/tests/csrfProtection.test.ts src/tests/security.test.ts
# Résultat : 2 passed (2 test files), 36 passed (36 tests), 0 failed
```
4. **Validation Playwright & Dependabot :**
- `playwright.config.ts` : secret en dur supprimé, génération dynamique via `crypto.randomBytes(32).toString('hex')`.
- `.github/dependabot.yml` : directive invalide `timezone: "UTC"` retirée.

### Phase 2 — Intégrité des Statuts, de l'Agrégation et des Commandes (C-04, C-05)
1. **Validation unifiée des statuts Produit et Vendeur (C-04) :**
- Vocabulaire canonique formalisé dans `src/domains/product/product.status.ts` et `src/domains/user/user.status.ts`.
- Prédicats stricts `isPurchasable` et `isSellerSellable` (rejet des états suspendus, archivés, rejetés, bloqués, et vélocité dépassée).
- Script de migration de base `scripts/migrate-product-status.ts` avec protection dry-run / prod flag.

2. **Validation transactionnelle anti-TOCTOU dans la commande (C-05) :**
- Intégration de `isSellerSellable` et `isPurchasable` à l'intérieur du bloc transactionnel `db.runTransaction()` de `OrderPlacementService`.
- Vérification atomique des stocks et des statuts en mémoire avant décrémentation.

3. **Agrégation des avis et score de confiance vendeur (C-06, C-07) :**
- Remplacement des valeurs factices par le calcul transactionnel réel et exact (`reviewAggregationIntegrity.test.ts` : 35 tests passés).
- Séparation stricte entre le `rating` produit (null / float 1-5) et le `trustScore` vendeur (calcul indépendant).

4. **Exécution des tests de la Phase 2 :**
```bash
$ ALLOW_TESTS_WITHOUT_EMULATOR=true npx vitest run src/tests/orderPlacementStatusIntegrity.test.ts src/tests/reviewAggregationIntegrity.test.ts src/tests/reviewsAndTrustScore.test.ts src/tests/shopPublic.test.ts
# Résultat : 4 passed (4 test files), 84 passed (84 tests), 0 failed
```

