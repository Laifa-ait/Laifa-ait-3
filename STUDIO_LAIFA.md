# DOSSIER TECHNIQUE & RÉFÉRENCE — STUDIO BUILDER OLMART (STUDIO LAIFA)

> **Document de Référence Technique Aligné sur le Code Réel**  
> **Application :** Olmart E-Commerce Marketplace & Studio Boutique Vendeur  
> **Mise à jour :** Novembre 2026 | **Statut :** Production & Gouvernance Stricte

---

## 1. ARCHITECTURE DES FICHIERS & HOOKS DU STUDIO (`/src/pages/Seller/StoreBuilder/`)

- `StoreBuilderGate.tsx` / `StoreBuilderActive.tsx` : Garde d'abonnement/accès et montage du hook `useSellerStudio`.
- `StudioWorkspace.tsx` : Orchestrateur principal (Desktop + Mobile + raccourcis clavier).
- `hooks/` :
  - `useSellerStudio.ts` : État central (config boutique, sections, produits + `catalogStatus`, publication `isPublishing` verrouillée anti-double-clic, historique, médias).
  - `useStudioSaveManager.ts` : Auto-sauvegarde debouncée (1.5 s), **3 tentatives de retry automatique**, détection hors-ligne (`offline`), contrôle de concurrence optimiste `expectedRevision` (`conflict`), sauvegarde locale de secours (`localStorage`).
  - `useStudioUndoRedo.ts` : Pile Undo/Redo immutable (30 actions max, persistance sessionStorage, `Ctrl+Z` / `Ctrl+Y`, support thèmes + sections).
  - `useStudioGuidedNavigation.ts` & `useSectionStepProgress.ts` : Parcours guidé à 4 étapes **strictement conditionné au résultat réel de la sauvegarde** (l'étape reste ouverte avec alerte d'erreur si la sauvegarde échoue).
  - `studioCatalogLoader.ts` : Charge le studio et le catalogue en distinguant explicitement `loaded` vs `error` (aucun masquage en catalogue vide).
  - `studioSectionMutations.ts` : Fabrique pure de sections et duplication sans valeurs commerciales fictives.
- `utils/` :
  - `publishReadinessChecks.ts` : Validation pré-publication (sections visibles, nom/slug obligatoires, alerte pied de page sans contact, état du catalogue).
  - `storeQualityAuditor.ts` : Audit WCAG 2.1, Alt/Médias, poids Base64, mobile, SEO et complétude contact/livraison.
- `components/studio/` :
  - Desktop : `StudioTopBar.tsx`, `StudioTopBarRightActions.tsx`, `StudioSidebar.tsx`, `SectionTreePanel.tsx`, `StudioColumnsLayout.tsx`.
  - Mobile (parité complète) : `MobileStudioBar.tsx`, `MobileStudioHeader.tsx` (avec Undo/Redo & statut sauvegarde), `MobileStudioNavigation.tsx`, `MobileGuidedJourneyBar.tsx` (parcours 1..4 sur smartphone), `StudioMobileMenu.tsx` (bascule Guidé / Accès Libre).
  - Modale publication : `StudioDirectPublishModal.tsx` (reste ouverte pendant la requête, verrouille les clics, affiche erreurs & checks avant déploiement).
- `components/inspector/` : `SectionInspectorPanel.tsx`, `SectionContentTab.tsx`, `ContactFooterContentEditor.tsx` (import 1-clic depuis le profil marchand réel, zéro numéro/e-mail factice), `StepWizardControls.tsx`.

---

## 2. INVENTAIRE RÉEL DES FONCTIONNALITÉS

| Fonctionnalité | État réel | Mécanisme vérifié |
| :--- | :--- | :--- |
| **Parcours Guidé 4 étapes (Desktop & Mobile)** | Opérationnel | `useStudioGuidedNavigation.ts` bloque le passage si `saveDraft` échoue ou renvoie `null` |
| **Sauvegarde Auto + Retry + Backup Local** | Opérationnel | Debounce 1.5s, 3 retries exponentiels, révision optimiste `draftRevision`, secours `localStorage` |
| **Undo / Redo (`Ctrl+Z` / `Ctrl+Y` & Mobile)** | Opérationnel | `useStudioUndoRedo.ts` (30 états) accessible sur Desktop (`StudioTopBar`) et Mobile (`MobileStudioHeader`) |
| **Publication Sécurisée & Pré-vérification** | Opérationnel | Modale reste ouverte durant l'envoi (`isPublishing`), pré-checks blocants/alertes, retry en place si échec |
| **Chargement Catalogue sans Masquage d'Erreur** | Opérationnel | `studioCatalogLoader.ts` + `CatalogProductsSubPanel.tsx` (`loading`, `error` + bouton Réessayer, `loaded`) |
| **Pied de Page Contact Sans Données Fictives** | Opérationnel | Aucun téléphone/e-mail factice injecté ; import volontaire depuis `storeConfig` et alerte si vide |
| **Réordonnancement & Édition Sections** | Opérationnel | Flèches haut/bas + commandes rapides + éditeurs par étapes (`StepWizardControls`) |
| **Audit Qualité & Contraste WCAG** | Opérationnel | `storeQualityAuditor.ts` + `PreviewAuditModal.tsx` avec auto-correctifs |
| **Intégration Shopify (OAuth / Liquid)** | Non présent | Studio headless natif Olmart (`store_configs` / `store_layouts` Firestore) |

---

## 3. ROUTES API BACKEND (`/api/v1/seller/`)

- `GET /api/v1/seller/studio` : Config boutique, brouillon (`draftRevision`), version publiée, historique et médias.
- `PUT /api/v1/seller/store/config` : Mise à jour config, thème, SEO et slug (unicité vérifiée côté serveur).
- `PUT /api/v1/seller/studio/layout/draft` : Sauvegarde transactionnelle du brouillon avec contrôle IDOR sur les IDs produits et détection de conflit `expectedRevision`.
- `POST /api/v1/seller/studio/layout/publish` : Publication atomique vers `published` + entrée d'historique + invalidation cache storefront.
- `POST /api/v1/seller/studio/layout/rollback` : Restauration d'une version antérieure.

---

## 4. GOUVERNANCE & TESTS

- **Règle des 250 lignes (`eslint.config.js`) :** Enforcée en erreur bloquante sur `src/pages/Seller/StoreBuilder/**/*.{ts,tsx}`, à l'exception unique et documentée de 2 fichiers statiques de données (`themeArchetypes.ts`, `artisticStudioPresets.ts`).
- **Typage Strict :** `@typescript-eslint/no-explicit-any` configuré en `error` global sur tout le dépôt.
- **Tests Automatisés :**
  - Unitaires & Composants (`src/tests/studio*.test.tsx`) : progression bloquée sur échec sauvegarde, Undo/Redo, conflit de révision, retry sauvegarde, non-injection de faux contacts, états erreur catalogue, modale de publication.
  - E2E Playwright (`e2e/platform-journeys.spec.ts`) : ouverture réelle `/dashboard/seller/studio` (Desktop & Mobile), parcours guidé, édition Hero, modale de publication et contrôle visuel sur `/store/:slug`.
