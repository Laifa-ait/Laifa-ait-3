# 📘 DOSSIER TECHNIQUE & AUDIT COMPLET — STUDIO BUILDER OLMART (studio LAIFA)

> **Document de Référence Technique pour Évolution & Maintenance**  
> **Application :** Olmart E-Commerce Marketplace & Studio Boutique Vendeur  
> **Date d'audit :** Octobre 2026 | **Auteur :** Ingénieur Principal & Architecte Full-Stack  

---

## 📑 TABLE DES MATIÈRES
1. [Étape 1 — Analyse de l'intégralité du projet](#1-analyse-de-lintegralite-du-projet)
2. [Étape 2 — Description détaillée du Studio existant](#2-description-detaillee-du-studio-existant)
3. [Étape 3 — Inventaire exhaustif des fonctionnalités (Tableau d'Audit)](#3-inventaire-exhaustif-des-fonctionnalites)
4. [Étape 4 — Fonctionnement technique interne & Flux de données](#4-fonctionnement-technique-interne--flux-de-donnees)
5. [Étape 5 — Examen de la qualité du code & Failles identifiées](#5-examen-de-la-qualite-du-code--failles-identifiees)
6. [Étape 6 — Bilan réel de l'intégration Shopify](#6-bilan-reel-de-lintegration-shopify)
7. [Étape 7 — Plan d'amélioration progressive (Roadmap P1, P2, P3)](#7-plan-damelioration-progressive)
8. [Étape 8 — Dossier de référence complet & Contexte pour IA future](#8-dossier-de-reference-complet)

---

## 1. ANALYSE DE L'INTÉGRALITÉ DU PROJET

### A. Structure des dossiers et fichiers du Studio
Le Studio Olmart est situé dans la partie vendeurs de la marketplace :
- `/src/pages/Seller/StoreBuilder/` : Racine de l'application React du Studio.
  - `StudioWorkspace.tsx` : Composant racine de l'espace de travail Studio.
  - `studio-tokens.css` : Variables CSS de thématisation du Studio.
  - `/components/` : Sous-composants d'interface (Barre supérieure, Canvas, Inspecteur).
    - `LiveCanvasPreview.tsx` : Rendu dynamique temps réel du magasin vendeur.
    - `StudioTopBar.tsx` : Barre d'outils supérieure (Statut de sauvegarde, Undo/Redo, Publication, Viewport).
    - `AddSectionModal.tsx` : Modal d'ajout de nouvelles sections.
    - `MediaGalleryModal.tsx` : Galerie d'images et téléversement Firebase Storage.
    - `/studio/` : Panneaux d'outils latéraux (Arborescence `SectionTreePanel.tsx`, Thème `ThemeWorkspace.tsx`, Paramètres `StoreSettingsWorkspace.tsx`, Identité `StoreIdentityWorkspace.tsx`).
    - `/inspector/` : Inspecteur de sous-éléments et sections (`SectionInspectorPanel.tsx`, `SectionContentTab.tsx`, `SectionStyleTab.tsx`, `SectionLayoutTab.tsx`, `SectionResponsiveTab.tsx`, `SectionAdvancedTab.tsx`).
    - `/inspector/category/` : Réglages poussés pour les rayons et catégories (`CategoryCanvaStyleControls.tsx`, `CategoryItemCard.tsx`).
    - `/inspector/content/` : Éditeurs de contenu (`HeroContentEditor.tsx`, `ProductSelectionEditor.tsx`, `CountdownCardEditor.tsx`, `StudioImagePicker.tsx`).
  - `/constants/` : Définitions des presets et schémas (`categoryPresetTypes.ts`, `categoryCanvaOptions.ts`, `categoryPresetsPart1.ts`, `categoryPresetsPart2.ts`).
  - `/hooks/` : Hook de gestion d'état centralisé `useSellerStudio.ts`.

### B. Stack Technique & Versions
- **Framework Frontend :** React 18.3+ avec TypeScript (Vite 6+ en bundler).
- **Styling :** Tailwind CSS v4 (`@import "tailwindcss";`), Lucide-React pour les icônes, Framer Motion (`motion/react`) pour les animations.
- **Backend HTTP / API :** Server Express v4 en TypeScript (`server.ts`, `app.ts`) sur Node.js 20+.
- **Gestionnaire d'état local & API :** Custom Hook React (`useSellerStudio.ts`) avec requêtes HTTP REST via client personnalisé `/src/lib/api.ts` (`apiGet`, `apiPut`, `apiPost`).
- **Base de données & Persistance :** Firebase Firestore (SDK `firebase-admin` sur le serveur Express).
  - Documents Firestore impliqués :
    - `store_configs/{sellerId}` : Configuration générale de la boutique (Nom, Slug, Thème, Réseaux, Médias).
    - `store_layouts/{sellerId}` : Contient `draft` (brouillon actif) et `published` (agencement publié).
    - `store_layouts/{sellerId}/history/{versionNumber}` : Snapshots des versions publiées.
    - `store_slugs/{shopSlug}` : Index d'unicité transactionnel pour les URLs boutiques (`/store/:shopSlug`).
- **Stockage Médias :** Firebase Storage (`shops/{sellerId}/studio_*`).
- **Authentification :** Firebase Authentication avec jetons Bearer JWT vérifiés côté serveur par middleware `authenticateToken` et vérification de rôle `authorizeSeller`.

### C. Routes API Backend (Prefix `/api/v1/seller/`)
- `GET /api/v1/seller/studio` : Récupère la config, le brouillon, la version publiée, l'historique et la galerie média du vendeur.
- `PUT /api/v1/seller/store/config` : Met à jour la configuration de la boutique (Thème, Slug, Médias, SEO).
- `PATCH /api/v1/seller/store/profile` : Synchronise les informations de profil vendeur.
- `PUT /api/v1/seller/studio/layout/draft` : Sauvegarde automatique/manuelle du brouillon des sections avec contrôle IDOR et vérification de propriété des produits.
- `POST /api/v1/seller/studio/layout/publish` : Publie le brouillon actif vers la boutique publique et crée une version dans l'historique.
- `POST /api/v1/seller/studio/layout/rollback` : Restaure une version historique spécifique.

---

## 2. DESCRIPTION DÉTAILLÉE DU STUDIO EXISTANT

### A. Parcours d'ouverture et d'édition
1. **Lancement (`/dashboard/seller/studio`) :**
   - Le vendeur navigue vers le Studio. `StudioWorkspace.tsx` s'initialise et déclenche `fetchStudioData()` dans `useSellerStudio.ts`.
   - Le serveur lit `store_configs/{sellerId}` et `store_layouts/{sellerId}`. Si la boutique est nouvelle, `LegacyStoreAdapter.ts` génère automatiquement une configuration et un agencement initial.
2. **Interface Générale :**
   - **Barre supérieure (`StudioTopBar.tsx`) :** Affiche le nom de la boutique, le statut de sauvegarde automatique (`Édition...`, `Enregistré`, `Erreur`), les boutons bascule Desktop / Tablette / Mobile, le bouton d'aperçu plein écran, l'accès à la galerie média, et le bouton principal "Publier la boutique".
   - **Menu latéral gauche (`StudioSidebar.tsx`) :** Propose 5 espaces de travail :
     - *Agencement & Sections* (`SectionTreePanel.tsx`) : Liste réordonnable des sections (Glisser-déposer / Boutons monter-descendre).
     - *Thème & Couleurs* (`ThemeWorkspace.tsx`) : Palette de couleurs (Primaire, Accent, Fond), typographies (Sans-Serif, Serif, Display) et coins arrondis.
     - *Pages de la Boutique* (`PagesWorkspace.tsx`) : Navigation entre la page d'accueil, les fiches produits et la page rayon.
     - *Identité & Logo* (`StoreIdentityWorkspace.tsx`) : Nom de la boutique, Slug URL unique, Logo et Bannière d'en-tête.
     - *Paramètres & SEO* (`StoreSettingsWorkspace.tsx`) : Méta-titre, méta-description, devises et réseaux sociaux.
   - **Canvas central (`LiveCanvasPreview.tsx`) :** Rendu WYSIWYG en direct encapsulé dans une iframe simulée ou un conteneur responsive.
     - Prise en charge du clic direct sur les sous-éléments du canvas via l'événement personnalisé `studio:focus-subelement`. Cliquer sur une bannière, un chrono flash, ou une catégorie ouvre directement l'onglet d'inspection correspondant.
   - **Inspecteur de propriétés (`SectionInspectorPanel.tsx`) :** Panneau latéral droit dynamique affichant les onglets *Contenu*, *Style*, *Disposition*, *Responsive*, et *Avancé* pour la section ou le composant sélectionné.

3. **Sauvegarde et Publication :**
   - **Sauvegarde Automatique (Debounced) :** Toute modification des sections déclenche un timer de 1500 ms qui soumet le brouillon nettoyé à `/api/v1/seller/studio/layout/draft`.
   - **Publication Effective :** Le bouton "Publier" copie de manière transactionnelle le brouillon `draft` dans `published`, incrémente le numéro de version, crée un snapshot d'historique et invalide le cache de la boutique publique `/store/:shopSlug`.

---

## 3. INVENTAIRE EXHAUSTIF DES FONCTIONNALITÉS

| Fonctionnalité | État actuel | Fichiers concernés | Dépendances | Problèmes connus | Améliorations possibles | Priorité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Chargement Config & Brouillon** | 🟢 Fonctionnelle | `useSellerStudio.ts`, `StoreLayoutService.ts` | Express, Firestore | Aucun | Mise en cache locale IndexedDB | P2 |
| **Sauvegarde automatique brouillon** | 🟢 Fonctionnelle | `useSellerStudio.ts`, `SellerStudioController.ts` | Debounce 1.5s, REST API | Si la connexion coupe, l'erreur s'affiche sans retry automatique. | Reconnexion automatique avec file d'attente | P1 |
| **Publication Boutique Publique** | 🟢 Fonctionnelle | `StoreLayoutService.ts`, `SellerStudioController.ts` | Transactions Firestore | Invalidation de cache sur serveur Node uniquement | Invalidation distribuée si multi-instance | P2 |
| **Historique & Rollback Versions** | 🟢 Fonctionnelle | `useSellerStudio.ts`, `StoreLayoutService.ts` | Firestore Subcollection | Limité aux 10 dernières versions | Prévisualisation visuelle de la version avant rollback | P2 |
| **Gestion du Slug Boutique (`/store/slug`)** | 🟢 Fonctionnelle | `StoreLayoutService.ts` | Collection `store_slugs` | Détection d'unicité uniquement à la soumission | Validation d'unicité en temps réel pendant la saisie | P2 |
| **Édition du Thème & Couleurs** | 🟢 Fonctionnelle | `ThemeWorkspace.tsx`, `SectionContentAndTrust.tsx` | Tailwind CSS variables | Les variables personnalisées s'appliquent globales | Prévisualisation instantanée par injection CSS variables | P2 |
| **Ajout / Suppression / Duplication Sections** | 🟢 Fonctionnelle | `AddSectionModal.tsx`, `useSellerStudio.ts` | React State | Modale d'ajout basique | Galerie de modèles de sections visuelles enrichies | P2 |
| **Réordonnancement des Sections** | 🟡 Partielle | `SectionTreePanel.tsx` | State React (`reorderSections`) | Utilise des flèches Haut/Bas au lieu du Drag & Drop fluide sur mobile | Intégrer `@hello-pangea/dnd` ou HTML5 Drag & Drop natif | P2 |
| **Sélecteur Viewport (Desktop/Tablet/Mobile)** | 🟢 Fonctionnelle | `StudioTopBar.tsx`, `LiveCanvasPreview.tsx` | CSS Container Width | La tablette simule 768px mais ne redimensionne pas l'iframe | Intégration d'un wrapper IFrame strict pour isolation CSS | P2 |
| **Clic sur Canvas (Direct Focus)** | 🟢 Fonctionnelle | `LiveCanvasPreview.tsx`, `SectionProductFeeds.tsx` | CustomEvent `studio:focus-subelement` | Fonctionne sur la section Hero, Chrono et Catégories uniquement | Étendre le clic direct à 100% des sous-composants | P2 |
| **Éditeur de Carte Chrono / Vente Flash** | 🟢 Fonctionnelle | `CountdownCardEditor.tsx`, `LiveCountdownBanner.tsx` | Lucide Icons, React State | Aucun | Programmation de dates de début/fin réelles | P2 |
| **Cartes Catégories 3D Studio Mesh** | 🟢 Fonctionnelle | `CategoryCard.tsx`, `Category3DIllustration.tsx` | Framer Motion, SVGs | Aucun | Permettre l'import d'illustrations 3D personnalisées par le vendeur | P3 |
| **Importation / Téléversement Médias** | 🟢 Fonctionnelle | `MediaGalleryModal.tsx`, `useSellerStudio.ts` | Firebase Storage | Limité à 5 Mo par fichier (JPG, PNG, WebP) | Compression client WebP automatique avant envoi | P2 |
| **Undo / Redo (Annuler / Rétablir)** | 🔴 Absente | Aucun | - | Pas de pile `undoStack`/`redoStack` dans l'état React local | Implémenter une pile d'historique locale immutable (30 actions) | P1 |
| **Intégration Shopify (OAuth / Liquid / Themes)** | 🔴 Absente | Aucun | - | L'application est un Page Builder natif Olmart. Aucune connexion Shopify n'existe. | Créer un générateur de thème Liquid / JSON et export ZIP si besoin | P3 |

---

## 4. FONCTIONNEMENT TECHNIQUE INTERNE & FLUX DE DONNÉES

### A. Représentation des données
Chaque section du Studio est représentée sous la forme d'un objet TypeScript strict (`CustomPageSection`) :
```typescript
export interface CustomPageSection<T extends CustomPageSectionType = CustomPageSectionType> {
  id: string;
  type: T;
  title?: string;
  settings: SectionSettingsMap[T];
  styles: SectionStyles;
  isVisible: boolean;
  order: number;
}
```

### B. Diagramme textuel du flux de données
```
 [ Vendeur / Interface Studio ]
              │
              ├── Clic / Saisie dans l'Inspecteur / Sidebar
              ▼
   [ Etat React : useSellerStudio.ts ] ◄── (Undo/Redo local à ajouter)
              │
              ├── Mise à jour instantanée du Canvas (WYSIWYG)
              ├── Timer Debounce (1500 ms)
              ▼
   [ Client API REST : /src/lib/api.ts ] ── (Header Authorization: Bearer <JWT>)
              │
              ▼
   [ Middleware Express : authenticateToken + authorizeSeller + Zod Validation ]
              │
              ▼
   [ Service Backend : StoreLayoutService.ts ]
              │
              ├── Vérification d'appartenance des produits (Anti-IDOR)
              ├── Contrôle d'unicité des Slugs
              ▼
   [ Base de données : Firebase Firestore ]
              ├── Document : store_layouts/{sellerId} (draft)
              └── Transaction lors de la publication : store_layouts/{sellerId} (published)
              │
              ▼
   [ Invalidation Cache Storefront ] ──► [ Boutique Publique : /store/:shopSlug ]
```

---

## 5. EXAMEN DE LA QUALITÉ DU CODE & FAILLES IDENTIFIÉES

### A. Sécurité & Contrôles IDOR (Vérifiés et Conformes)
- **Sécurité IDOR :** La méthode `StoreLayoutService.verifyProductOwnership` vérifie explicitement que chaque ID de produit intégré dans une section de type `featured_products` ou `curated_collections` appartient bel et bien au `sellerId` connecté.
- **Sécurité des Rôles :** Les routes du Studio utilisent `authorizeSeller` qui valide que l'utilisateur possède le statut vendeur dans Firestore. L'e-mail n'est jamais utilisé comme preuve de privilège (conforme aux règles de sécurité Olmart).

### B. Problèmes de Qualité du Code & Propreté
1. **Composants trop volumineux :**
   - `StudioWorkspace.tsx` fait 358 lignes (décollement nécessaire pour respecter la règle des 250 lignes).
   - `HeroContentEditor.tsx` fait 597 lignes (nécessite un découpage en sous-composants).
   - `SectionProductFeeds.tsx` fait 504 lignes.
2. **Absence d'historique Undo/Redo local :**
   - Si un vendeur commet une erreur de frappe ou supprime un paragraphe dans le Studio, il n'existe pas de raccourci `Ctrl+Z` / `Ctrl+Y` local pour annuler son action avant la sauvegarde.

---

## 6. BILAN RÉEL DE L'INTÉGRATION SHOPIFY

Après inspection approfondie du code source complet (`src/`, `server.ts`, `package.json`), **aucune ligne de code relative à Shopify n'est présente dans le projet**.

| Point d'intégration Shopify | Statut réel dans le code | Commentaire technique |
| :--- | :--- | :--- |
| **Connexion Compte Shopify (OAuth)** | 🔴 Absente | Aucun endpoint OAuth Shopify (`/auth/shopify`), aucune clé API ni App Shopify. |
| **Lecture des Produits/Collections Shopify** | 🔴 Absente | Les produits proviennent exclusivement de la collection Firestore `products` d'Olmart. |
| **Génération de Fichiers Liquid** | 🔴 Absente | Aucun moteur ni template `.liquid` n'est présent. |
| **Génération de Templates JSON Shopify** | 🔴 Absente | Les données sont stockées en JSON natif Firestore pour le rendu React Olmart. |
| **Exportation du Thème en ZIP** | 🔴 Absente | Aucune bibliothèque de compression ZIP (type `JSZip`) n'est configurée pour Shopify. |
| **Publication de Thème sur Shopify API** | 🔴 Absente | La publication se fait en interne sur la marketplace Olmart (`/store/:shopSlug`). |

> **Conclusion Shopify :** Le Studio actuel est un **Headless Page Builder natif Olmart**. Si le projet doit exporter vers Shopify, il faudra développer un module dédié de conversion des sections `CustomPageSection` en templates JSON Shopify Theme 2.0 et snippets Liquid.

---

## 7. PLAN D'AMÉLIORATION PROGRESSIVE

### Priorité 1 : Robustesse, Undo/Redo & Sécurité
1. **Implémentation de l'Undo/Redo local (`Ctrl+Z` / `Ctrl+Y`) :**
   - *Fichiers :* `useSellerStudio.ts`, `StudioTopBar.tsx`.
   - *Objectif :* Conserver une pile de 30 états locaux pour permettre l'annulation instantanée des erreurs de saisie.
2. **Gestion de la reconnexion hors-ligne :**
   - *Fichiers :* `useSellerStudio.ts`.
   - *Objectif :* Conserver les modifications dans `localStorage` si le réseau coupe et synchroniser dès le retour de la connexion.

### Priorité 2 : Ergonomie Visuelle & Responsive Editing
1. **Découpage des fichiers volumineux (> 250 lignes) :**
   - *Fichiers :* `HeroContentEditor.tsx`, `SectionProductFeeds.tsx`, `CategoryCanvaStyleControls.tsx`.
   - *Objectif :* Diviser en sous-composants modulaires pour respecter scrupuleusement la règle d'architecture Olmart (< 250 lignes par fichier).
2. **Glisser-déposer fluide des sections (Drag & Drop) :**
   - *Fichiers :* `SectionTreePanel.tsx`.
   - *Objectif :* Remplacer les boutons monter/descendre par un système de glisser-déposer intuitif.

### Priorité 3 : Exportation & Fonctionnalités Avancées
1. **Générateur d'Exportation Thème Shopify (Optionnel) :**
   - *Fichiers à créer :* `/src/domains/seller/services/shopifyExport.service.ts`.
   - *Objectif :* Maper les sections React Olmart vers des templates JSON Shopify 2.0 et générer une archive `.zip`.

---

## 8. DOSSIER DE RÉFÉRENCE COMPLET & INSTRUCTIONS

### Commandes utiles du projet
- **Installation des dépendances :** `npm install`
- **Lancement du serveur de développement Express + Vite :** `npm run dev`
- **Vérification du typage et Linting :** `npm run lint`
- **Validation de la compilation de production :** `npm run build`

---

## 📌 CONTEXTE TECHNIQUE À TRANSMETTRE À UNE AUTRE IA POUR AMÉLIORER LE STUDIO

```yaml
PROJECT_NAME: "Olmart E-Commerce Marketplace - Store Studio Builder"
ARCHITECTURE: "React 18 + TypeScript + Express v4 + Firebase Firestore / Storage"
STUDIO_LOCATION: "/src/pages/Seller/StoreBuilder/"
BACKEND_CONTROLLER: "/src/domains/seller/controllers/SellerStudioController.ts"
BACKEND_SERVICE: "/src/domains/seller/services/storeLayout.service.ts"
STATE_HOOK: "/src/pages/Seller/StoreBuilder/hooks/useSellerStudio.ts"

REAL_STATE:
  - "Studio fonctionnel de création de boutiques e-commerce pour la marketplace Olmart."
  - "Sauvegarde automatique debouncée (1.5s) dans Firestore doc 'store_layouts/{sellerId}'."
  - "Système de publication transactionnel avec gestion d'historique et rollback de version."
  - "Sécurité IDOR stricte vérifiée sur l'appartenance des produits."
  - "Intégration Shopify : ABSENTE (aucun OAuth Shopify, aucun moteur Liquid existant)."

MANDATORY_RULES_FOR_NEXT_AI:
  - "Ne dépasser sous aucun prétexte 250 lignes par fichier source."
  - "Typage strict TypeScript sans aucun usage de 'any'."
  - "Toutes les routes API doivent résider sous /api/v1/."
  - "Conserver l'architecture Express + Firestore existante sans casser les verrous transactionnels."
```
