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
| **UI-01** | Élevé | Corrigé | Phase 4 | `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 npx vitest run src/tests/heroBannerModelsAndResponsive.test.tsx` → 4 passed | Refonte architecturale du Hero Studio Vendeur en 5 composants isolés (`HeroFullBleed`, `HeroSplit`, `HeroArch`, `HeroGallery`, `HeroDiptych`) |
| **UI-02** | Élevé | Corrigé | Phase 5 | `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 npx vitest run src/tests/homePageTranslationsAndColors.test.tsx` → 2 passed | Éradication des textes en dur sur `Home.tsx` et ses sous-composants, synchronisation trilingue FR/AR/EN et unification chromatique Mindazzle Twilight |

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

### Phase 1 — Rétablir la vérité des tests et de la CI
1. **Exécution des tests de sécurité et protection CSRF :**
```bash
$ ALLOW_TESTS_WITHOUT_EMULATOR=true vitest run src/tests/csrfProtection.test.ts src/tests/security.test.ts
# Résultat : 2 passed (2 test files), 36 passed (36 tests), 0 failed
```

### Phase 2 — Intégrité des Statuts, de l'Agrégation et des Commandes (C-04, C-05)
1. **Exécution des tests de la Phase 2 :**
```bash
$ ALLOW_TESTS_WITHOUT_EMULATOR=true npx vitest run src/tests/orderPlacementStatusIntegrity.test.ts src/tests/reviewAggregationIntegrity.test.ts src/tests/reviewsAndTrustScore.test.ts src/tests/shopPublic.test.ts
# Résultat : 4 passed (4 test files), 84 passed (84 tests), 0 failed
```

### Phase 4 & 5 — Refonte Hero Studio Vendeur & Audit Page d'Accueil (UI-01, UI-02)
1. **Vérification des 5 styles Hero isolés et de la parité trilingue FR/AR/EN de la page d'accueil :**
```bash
$ FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 npx vitest run src/tests/heroBannerModelsAndResponsive.test.tsx src/tests/homePageTranslationsAndColors.test.tsx
# Résultat : 2 passed (2 test files), 6 passed (6 tests), 0 failed
```
