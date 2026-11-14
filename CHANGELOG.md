# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2026-11-12

### 🏠 Audit & Unification Complète de la Page d'Accueil (`Home.tsx`)
- **Éradication Totale du Code Dur & Parité Trilingue (`fr`, `ar`, `en`)** : Création du dictionnaire synchrone `src/locales/homeTranslations.ts` injecté dans `src/i18n.ts` et synchronisé avec `public/locales/{fr,ar,en}.json`. Traduction intégrale de `SponsoredSection`, `SponsoredProductCard`, `NeoCategoryGrid`, `CategoryCard` (tags d'édition `cat_tag.*` et actions), `BentoHero`, `BentoHeroSlide`, `DynamicSection`, `SectionHeader`, `SectionLayouts` (badge `Vedette`, pagination et `aria-label`), `HomeEndlessGrid` et `ProductCard`.
- **Unification Chromatique Mindazzle Twilight & Sunset Amber** : Suppression des classes disparates (`bg-slate-50`, `text-emerald-700`, `bg-emerald-700`, `bg-red-600`, `bg-rose-600`, `bg-zinc-200`) au profit des tokens officiels (`#1A1836`, `#42164B`, `#622347`, `#A54055`, `#E99856`, `#E0B4B2`, `#FAF7F6`, `#EFE6E6`).
- **Correction des Incohérences de Ciblage & d'État (`useHomeData` & `Home.tsx`)** : Normalisation bidirectionnelle `isActive` / `is_active` et `orderIndex` / `sort_order` sur les sections dynamiques, et harmonisation du filtrage régional par Wilaya (suppression des préfixes numériques `"16 - Alger"`).

### 🏛️ Studio Vendeur — Refonte Architecturale & Minimaliste du Hero Scénographique
- **5 Styles Architecturaux 100 % Isolés** : Remplacement des anciennes vues surchargées par 5 composants dédiés (`HeroFullBleed`, `HeroSplit`, `HeroArch`, `HeroGallery`, `HeroDiptych`) avec contenu minimaliste strict (1 Titre, 1 Petite phrase explicative, 1 Seul Bouton d'action).
- **Responsive Indépendant par Appareil & Adaptateur Zéro Crash** : Gestion d'états isolés (`heroDesktopConfig`, `heroTabletConfig`, `heroMobileConfig`), bouton de suggestion d'adaptation depuis le PC avec confirmation manuelle, et adaptateur de rétrocompatibilité (`normalizeHeroSettingsAdapter`).

## [1.4.0] - 2026-10-28

### 🚗 Application Olma Auto (Expérience Native & Recherche Directe)
- **Architecture App Shell & Barre de Commande Tactile** : Refonte complète d'Olma Auto (`/auto`) sur le modèle d'une application native moderne (inspirée de Turo et AutoScout24) avec palette dédiée Bleu Cobalt (`#2563EB`) / Ardoise (`#0F172A`) / Émeraude (`#10B981`).
- **Recherche par Marque en 1-Tap (`AutoBrandPickerModal`)** : Sélecteur *Bottom Sheet* des 39 constructeurs automobiles avec logos officiels, recherche instantanée par modèle et barre de *squircles* rapides (`OlmaAutoBrandBar`).
- **Navigation Mobile & Menu Latéral Simplifiés** : Dock inférieur à 5 entrées (`Explorer`, `Par Marque`, bouton central `Ajouter`, `Favoris`, `Dashboard`) et tiroir latéral unifié (`OlmaAutoDrawerMenu`).
- **Dashboard Utilisateur Auto (`/auto/dashboard`)** : Espace personnel regroupant les véhicules favoris, la gestion des annonces publiées et l'accès direct par marque, sans module Argus superflu (plateforme publicitaire directe).
- **Tableaux de Bord Admin, Vendeur & Utilisateur** : Harmonisation ergonomique sur mobile et desktop avec contrôle strict de la limite de 250 lignes par fichier.

## [1.3.0] - 2026-09-07

### 🔒 Sécurité & Durcissement CI/CD
- **Isolation Stricte des Variables d'Environnement** : Confinement des variables simulées `olmart-ci-demo` au sein des seuls jobs de tests CI (`build-and-test` et `e2e`), éliminant tout risque de fuite vers les artefacts de build de staging et production.
- **Normalisation de l'Identifiant de Base Firestore** : Alignement universel sur la base racine `(default)` dans `firebase.json`, `src/tests/setup.ts`, `Dockerfile` et les scripts de vérification de sécurité.
- **Protection Anti-CSRF Renforcée** : Validation obligatoire en production d'une clé secrète `CSRF_SECRET` robuste (>= 32 caractères) issue de GCP Secret Manager avec rejet strict au boot en cas de manquement.

### 🚀 DevOps, Build & Pipeline Cloud Run
- **Smoke Tests Automatisés Post-Déploiement** : Ajout d'une validation HTTP synchrone systématique sur `/api/v1/health/live` et `/api/v1/health` avec politique de retries et fail-fast immédiat en cas d'échec sur Cloud Run.
- **Optimisation des Archives de Déploiement (`.gcloudignore`)** : Exclusion rigoureuse des dossiers de couverture (`coverage`), rapports de tests Playwright (`playwright-report`, `test-results`), logs et artefacts TypeScript pour accélérer le transfert Cloud Build.
- **Conteneurisation Docker Fiabilisée** : Définition de valeurs par défaut sur les arguments de compilation multi-stage (`ARG VITE_FIREBASE_DATABASE_ID=(default)`) pour prévenir toute initialisation dégradée du client web.

### 🧪 Tests & Résilience
- **Détection Dynamique de l'Émulateur Firebase** : Inspection synchrone des sockets `/proc/net/tcp` dans `src/tests/setup.ts` évitant les timeouts bloquants de 30 secondes en environnement sans émulateur.
- **Harmonisation des Standards de Logging** : Alignement complet des gestionnaires de signaux et d'exceptions sur le standard unifié `[Olmart Gateway]`.

## [1.2.0] - 2026-08-27

### ♿ Accessibilité (A11y) & Expérience Utilisateur (UX)
- **Résolution de Collision d'UI Mobile** : Amélioration ergonomique majeure masquant la barre globale de navigation mobile (`MobileBottomNav`) lors de l'activation de la barre d'achat collante (`ProductBuyBox`), évitant ainsi tout blocage de l'entonnoir d'achat.
- **Support iOS Safe-Area** : Prise en charge universelle du CSS `calc(env(safe-area-inset-bottom) + 12px)` sur la barre d'achat collante pour un calage automatique sur les écrans d'iPhones récents.
- **Sémantique Mobile Accessible** : Enrichissement de l'arbre d'accessibilité de la navigation mobile avec l'ajout des attributs `aria-label`, `aria-current="page"`, et d'une vocalisation dynamique du nombre d'articles du panier/favoris pour les lecteurs d'écrans.
- **Surcouche Dialogue Accessible (Search Overlay)** : Refonte de la recherche globale en véritable fenêtre modale accessible (`role="dialog"`, `aria-modal="true"`, interception clavier et piège de focus (Focus Trap), restauration du focus au bouton déclencheur, et annonces en temps réel `aria-live="polite"` pour les résultats de recherche).
- **Réduction de Mouvement Universelle** : Ajout de la règle média `@media (prefers-reduced-motion: reduce)` dans les styles de base pour désactiver les transitions, défilements fluides et boucles d'animation pour les utilisateurs souffrant de troubles vestibulaires.
