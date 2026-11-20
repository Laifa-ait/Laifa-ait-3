# 🏛️ DOCUMENTATION COMPLÈTE & GUIDE D'ARCHITECTURE DU STUDIO VENDEUR OLMART (`StoreBuilder` & Moteur `Storefront`)

> **Référentiel Technique, Fonctionnel & Pédagogique Exhaustif**  
> Ce document a été conçu pour que **n'importe qui** (développeur, architecte, chef de produit, designer ou nouveau membre de l'équipe) puisse comprendre **exactement** ce qui existe dans le Studio Vendeur Olmart, **comment chaque fonctionnalité opère**, **quel fichier fait quoi**, et **comment le code fonctionne sous le capot** du clic utilisateur jusqu'à la base de données Firestore.

---

## 📑 Table des Matières

1. [Introduction : Qu'est-ce que le Studio Vendeur Olmart ? (Explication Simple)](#1-introduction--quest-ce-que-le-studio-vendeur-olmart--explication-simple)
2. [Cycle de Vie & Contrôle d'Accès par Abonnement (`StoreBuilder.tsx`)](#2-cycle-de-vie--contrôle-daccès-par-abonnement-storebuildertsx)
3. [Comment le Code Gère l'État, la Sauvegarde Automatique et les Conflits](#3-comment-le-code-gère-létat-la-sauvegarde-automatique-et-les-conflits)
   - 3.1. `useStudioStore.ts` : La mémoire instantanée de l'interface (Zustand)
   - 3.2. `useSellerStudio.ts` : Le chef d'orchestre des données de la boutique
   - 3.3. `useStudioSaveManager.ts` : Le moteur d'Auto-Save, Backup local et Anti-Conflit
   - 3.4. `useStudioUndoRedo.ts` : La machine à remonter le temps (`Ctrl+Z` / `Ctrl+Y`)
   - 3.5. `SellerStudioController.ts` & `storeLayout.service.ts` : Les routes API Backend `/api/v1/`
4. [Organisation Visuelle de l'Écran : Les 3 Colonnes & la Barre Mobile (`StudioWorkspace.tsx`)](#4-organisation-visuelle-de-lécran--les-3-colonnes--la-barre-mobile-studioworkspacetsx)
   - 4.1. La Barre Supérieure (`StudioTopBar.tsx` & `StudioTopBarRightActions.tsx`)
   - 4.2. La Colonne Gauche : Mode Guidé (4 Étapes) vs Mode Accès Libre (11 Piliers) (`StudioSidebar.tsx`)
   - 4.3. L'Arbre des Sections & Sous-Blocs (`SectionTreePanel.tsx`, `SectionCard.tsx`, `SectionSubBlocksTree.tsx`)
   - 4.4. La Colonne Centrale : Le Canevas Temps Réel & ses Outils (`LiveCanvasPreview.tsx` & `StudioPreview.tsx`)
   - 4.5. La Colonne Droite : L'Inspecteur Intelligent (`PropertiesInspector.tsx`)
5. [Détail Complet des 11 Piliers Globaux de la Boutique (`components/context/`)](#5-détail-complet-des-11-piliers-globaux-de-la-boutique-componentscontext)
   - 5.1. `identity` : Identité de la Boutique (`StoreIdentityEditor.tsx`)
   - 5.2. `header` : Menu & Barre d'Annonce (`HeaderNavigationInspectorPanel.tsx`)
   - 5.3. `theme` & `atelier` : Design System Global, 14 Thèmes Signatures & Finitions (`ThemeInspectorPanel.tsx`)
   - 5.4. `sections` : Construction des Blocs de la Page d'Accueil
   - 5.5. `pages` : Les 8 Pages Système & Créateur de Pages Personnalisées (`PagesInspectorPanel.tsx`)
   - 5.6. `catalog` : Gestion du Catalogue, Rayons & Synchronisation Intelligente (`CatalogInspectorPanel.tsx`)
   - 5.7. `media` : Médiathèque Centralisée, Compression & Remplacement Global (`MediaInspectorPanel.tsx`)
   - 5.8. `settings` : Livraison 69 Wilayas, COD (Paiement à la livraison), SEO & Pixels (`StoreSettingsInspectorPanel.tsx`)
   - 5.9. `orders` : Suivi Rapide des Commandes (`OrdersInspectorPanel.tsx`)
   - 5.10. `launchpad` : Check-list de Lancement & Guide de Configuration (`SetupGuideInspectorPanel.tsx`)
6. [Fonctionnement Interne de l'Inspecteur de Section et de ses 5 Onglets (`SectionInspectorPanel.tsx`)](#6-fonctionnement-interne-de-linspecteur-de-section-et-de-ses-5-onglets-sectioninspectorpaneltsx)
   - 6.1. Le Problème de l'Écrasement Synchrone en React et la Solution `latestSectionRef`
   - 6.2. La Synchronisation Bidirectionnelle `settings <-> styles` pour les Bannières
   - 6.3. Onglet 1 : `Contenu` (`SectionContentTab.tsx`)
   - 6.4. Onglet 2 : `Style` en 4 Étapes (`SectionStyleTab.tsx` & `SectionVisualEffectsSubPanel.tsx`)
   - 6.5. Onglet 3 : `Disposition` (`SectionLayoutTab.tsx`)
   - 6.6. Onglet 4 : `Appareils` (`SectionResponsiveTab.tsx` & Héritage en Cascade)
   - 6.7. Onglet 5 : `Avancé` (`SectionAdvancedTab.tsx` : Ancres, Animations, Visibilité Programmée, ARIA, CSS Filtré)
7. [Architecture Complète du Système de Bannières Principales (`hero_banner`)](#7-architecture-complète-du-système-de-bannières-principales-hero_banner)
   - 7.1. L'Éditeur Unifié en 4 Étapes (`HeroContentEditor.tsx`)
   - 7.2. Les 5 Modèles Architecturaux de Bannières (`heroBannerModels.ts`)
   - 7.3. Le Moteur de Calcul des Effets Visuels, Coins Arrondis et Ombre Lumineuse (`heroVisualEffectsHelper.ts`)
   - 7.4. Comment les 5 Composants de Rendu Dessinent la Bannière
8. [Catalogue Détaillé des 16 Types de Sections & de leurs Éditeurs Spécialisés](#8-catalogue-détaillé-des-16-types-de-sections--de-leurs-éditeurs-spécialisés)
   - 8.1. Le Pipeline de Rendu Universel (`StoreSectionRenderer.tsx` & `sectionStyleHelper.tsx`)
   - 8.2. Explication Détaillée de Chacune des 16 Sections (Éditeur + Renderer + Rôle)
9. [Les Contrôles Visuels Intelligents de l'Inspecteur (`components/inspector/controls/`)](#9-les-contrôles-visuels-intelligents-de-linspecteur-componentsinspectorcontrols)
10. [Sécurité, Anti-XSS, Audit Qualité WCAG AA & Vérifications Pré-Publication](#10-sécurité-anti-xss-audit-qualité-wcag-aa--vérifications-pré-publication)
11. [Arborescence Complète & Dictionnaire de Tous les Fichiers du Studio](#11-arborescence-complète--dictionnaire-de-tous-les-fichiers-du-studio)

---

## 1. Introduction : Qu'est-ce que le Studio Vendeur Olmart ? (Explication Simple)

Imaginez un vendeur qui souhaite créer sa propre boutique en ligne professionnelle sur Olmart sans connaître une seule ligne de code HTML, CSS ou JavaScript.  
Le **Studio Vendeur** est son atelier de création visuel.

### Comment ça marche concrètement pour le vendeur ?
1. **Au centre de l'écran**, il voit sa boutique en direct (comme si un client la visitait sur Ordinateur, Tablette ou Téléphone).
2. **À gauche de l'écran**, il choisit ce qu'il veut construire : l'identité de sa marque, le thème de couleurs, les sections de sa page d'accueil (bannières, carrousels, grilles de produits, FAQ, livraison...), ses pages personnalisées ou ses tarifs de livraison.
3. **À droite de l'écran**, dès qu'il clique sur un élément (par exemple sa bannière principale), un panneau de réglages simples s'ouvre : il change le titre, choisit une photo, arrondit les coins, ajoute une ombre lumineuse ou change la couleur d'un bouton, et **la boutique au centre se met à jour instantanément en 0 milliseconde**.
4. **En coulisses (dans le code)** :
   - Tant qu'il travaille, toutes ses modifications sont enregistrées dans un **Brouillon (`draftLayout`)** toutes les 1,5 seconde. Les vrais clients qui visitent sa boutique ne voient pas ses tests en cours.
   - Dès qu'il est satisfait, il clique en haut à droite sur le bouton **« Mettre à jour » (Publier)**. Le code copie alors le brouillon validé vers la **Boutique Publique (`publishedLayout`)** et crée une archive dans l'historique des versions (pour pouvoir revenir en arrière en 1 clic si besoin).

---

## 2. Cycle de Vie & Contrôle d'Accès par Abonnement (`StoreBuilder.tsx`)

Lorsqu'un vendeur clique sur « Studio Boutique » dans son espace vendeur, le fichier `src/pages/Seller/StoreBuilder.tsx` est exécuté en premier.  
Son rôle est de vérifier l'état de l'abonnement du vendeur (`subscriptionStatus`) et d'afficher l'écran exact correspondant à sa situation :

1. **`StoreBuilderLocked.tsx` (Boutique Verrouillée)** :
   - **Quand ?** Le vendeur n'a pas encore d'abonnement Boutique actif.
   - **Ce que fait le code :** Affiche une page de présentation des fonctionnalités du Studio et ouvre la modale d'abonnement en 2 étapes (`StudioSubscriptionModal.tsx` -> `SubscriptionStepChoose.tsx` pour choisir le cycle mensuel/annuel, puis `SubscriptionStepPayment.tsx`).
2. **`StoreBuilderPending.tsx` (Demande Initialisée)** :
   - **Quand ?** La demande d'abonnement vient d'être créée.
   - **Ce que fait le code :** Explique au vendeur les instructions de règlement et lui permet de passer à l'étape d'envoi de son reçu.
3. **`StoreBuilderPaymentRequested.tsx` (Envoi du Justificatif de Paiement)** :
   - **Quand ?** Le système attend la preuve de paiement (reçu BaridiMob, CCP ou virement bancaire).
   - **Ce que fait le code :** Permet au vendeur de téléverser la photo ou le PDF de son reçu et de renseigner la référence de transaction.
4. **`StoreBuilderVerificationPending.tsx` (Vérification par l'Administration)** :
   - **Quand ?** Le reçu a été envoyé et attend la validation d'un administrateur Olmart.
   - **Ce que fait le code :** Affiche un écran d'attente rassurant avec le récapitulatif de la demande.
5. **`StoreBuilderActive.tsx` (Abonnement Actif -> Ouverture du Studio)** :
   - **Quand ?** L'abonnement est validé (`active`).
   - **Ce que fait le code :** Enveloppe l'application dans le fournisseur de médias `StudioMediaContext.tsx` et lance **`StudioWorkspace.tsx`**, l'éditeur visuel complet.

---

## 3. Comment le Code Gère l'État, la Sauvegarde Automatique et les Conflits

Pour qu'un éditeur visuel soit ultra-rapide sans jamais perdre de données, le code divise la mémoire en **4 hooks spécialisés** situés dans `src/pages/Seller/StoreBuilder/hooks/` et `store/`.

### 3.1. `useStudioStore.ts` : La mémoire instantanée de l'interface (Zustand)
Ce fichier (`src/pages/Seller/StoreBuilder/store/useStudioStore.ts`) utilise la librairie **Zustand**. Il stocke tout ce qui concerne l'état visuel de l'outil :
- **`selectedSectionId`** : L'ID de la section sur laquelle le vendeur a cliqué (ex: `"hero-1"`).
- **`hoveredSectionId`** : L'ID de la section survolée par la souris (permet d'afficher un cadre pointillé sur l'aperçu central).
- **`selectedSubBlock`** : Si le vendeur clique directement sur un sous-élément d'une section (ex: juste le titre ou juste le bouton de la bannière), ce champ mémorise quel sous-bloc est ciblé.
- **`viewport`** (`'desktop' | 'tablet' | 'mobile'`) : L'appareil actuellement simulé au centre de l'écran.
- **`zoom`** (`number`) : Le niveau de zoom du canevas central (`50%` à `125%`).
- **`showGrid`** (`boolean`) : Active ou désactive la grille d'alignement visuelle (`CanvasGridOverlay.tsx`) par-dessus la boutique.
- **`activeInspectorTab`** (`'content' | 'style' | 'layout' | 'responsive' | 'advanced'`) : L'onglet ouvert dans la colonne de droite.
- **`studioExperienceMode`** (`'guided' | 'expert'`) : Définit si le vendeur utilise le **Mode Guidé** (parcours accompagné étape par étape) ou l'**Accès Libre** (tous les panneaux débloqués).
- **`sectionStepProgress`** : Un dictionnaire qui retient pour chaque section à quelle étape (`1/4`, `2/4`, etc.) le vendeur s'était arrêté.

### 3.2. `useSellerStudio.ts` : Le chef d'orchestre des données de la boutique
Situé dans `src/pages/Seller/StoreBuilder/hooks/useSellerStudio.ts`, ce hook contient toute la vérité sur les données de la boutique du vendeur :
- **`storeConfig`** : Toutes les configurations générales de la boutique (nom, slug URL, logo, wilaya, commune, tarifs de livraison, pixels marketing, pages personnalisées, menus d'en-tête).
- **`sections`** (`CustomPageSection[]`) : La liste ordonnée de toutes les sections de la page d'accueil en mode brouillon.
- **`currentTheme`** (`CustomPageTheme`) : Le thème visuel actif (couleurs, polices, formes des cartes, atmosphère).
- **`products`** (`Product[]`) : Les produits réels du vendeur chargés via `studioCatalogLoader.ts` pour alimenter les grilles de produits en direct.
- **`versions`** : L'historique des versions publiées précédemment.
- **`draftRevision`** : Un compteur numérique incrémental (`1, 2, 3...`) qui sert de sceau de sécurité à chaque sauvegarde en base de données.

### 3.3. `useStudioSaveManager.ts` : Le moteur d'Auto-Save, Backup local et Anti-Conflit
Que se passe-t-il exactement dans le code lorsque le vendeur modifie une lettre dans un titre ou change une couleur ?
1. **Mise à jour immédiate de l'écran (`0 ms`)** : L'état React `sections` ou `currentTheme` change, et l'aperçu central se redessine instantanément. Le drapeau `isDirty` passe à `true`.
2. **Bouclier LocalStorage (`après 600 ms`)** : Le fichier `studioBackupStorage.ts` enregistre une copie complète du brouillon dans la mémoire du navigateur (`localStorage`) sous la clé `olmart_studio_draft_backup_<sellerId>`.
   - *Pourquoi ?* Si la batterie de l'ordinateur ou du téléphone se coupe brusquement avant que la connexion Internet n'ait pu envoyer les données au serveur, au prochain démarrage du Studio, `useSellerStudio` compare la date du backup local avec celle du serveur. Si le backup local est plus récent, il affiche la barre **`StudioRecoveryAndConflictBar.tsx`** et propose au vendeur de restaurer son travail non sauvegardé en 1 clic !
3. **Sauvegarde Automatique Serveur (`après 1500 ms`)** : Si le vendeur ne tape plus rien pendant 1,5 seconde, `useStudioSaveManager` lance automatiquement `saveDraft(true)` en arrière-plan :
   - Il envoie une requête HTTP `PUT /api/v1/seller/studio/layout/draft` avec le header `Authorization: Bearer <firebase_token>`.
   - Il joint à la requête le numéro `expectedRevision` (ex: révision `14`).
4. **Détection de Conflit Multi-Onglets (`HTTP 409 - CONFLICT_NEWER_VERSION`)** :
   - Imaginez que le vendeur ait ouvert le Studio sur son téléphone (révision `15`) ET sur son ordinateur (resté à la révision `14`).
   - S'il modifie la boutique sur son ordinateur, le serveur voit que `expectedRevision (14) !== currentRevision (15)`.
   - Le serveur refuse d'écraser le travail fait sur le téléphone et renvoie une erreur `409 CONFLICT_NEWER_VERSION`.
   - `useStudioSaveManager` intercepte ce code, passe en statut `conflict`, et affiche dans `StudioRecoveryAndConflictBar.tsx` deux boutons clairs : **« Recharger la version serveur »** ou **« Forcer l'écrasement avec ma version locale »**.

### 3.4. `useStudioUndoRedo.ts` : La machine à remonter le temps (`Ctrl+Z` / `Ctrl+Y`)
Situé dans `src/pages/Seller/StoreBuilder/hooks/useStudioUndoRedo.ts` :
- À chaque modification importante (changement de section, de couleur, ajout ou suppression de bloc), le code empile une photo instantanée (`snapshot = { sections, theme }`) dans `sessionStorage`.
- Le vendeur peut annuler jusqu'à 40 actions en arrière avec le bouton **Annuler (`<-`)** de la barre supérieure ou `Ctrl+Z` / `Cmd+Z`, et les rétablir avec **Rétablir (`->`)** ou `Ctrl+Y`.

### 3.5. `SellerStudioController.ts` & `storeLayout.service.ts` : Les routes API Backend `/api/v1/`
Côté serveur Express (`src/domains/seller/controllers/SellerStudioController.ts`), 5 endpoints sécurisés (protégés par `authenticateToken`, `authorizeSeller`, validation de schéma Zod `storeLayout.schema.ts` et nettoyage profond anti-XSS `sanitizeStudioPayloadDeep`) gèrent toute la persistance Firestore :
- **`GET /api/v1/seller/studio`** : Charge ou initialise la boutique du vendeur connecté (`req.user.uid`).
- **`PUT /api/v1/seller/store/config`** : Met à jour la configuration globale (nom, slug, thème, livraison, SEO, pages personnalisées). Vérifie en transaction que le `shopSlug` n'est pas déjà pris par un autre vendeur.
- **`PATCH /api/v1/seller/store/profile`** : Met à jour de manière atomique le profil public de la boutique (logo, bannière, wilaya, commune, délai de préparation) après avoir vérifié la sécurité des URL (`isSafeStudioUrl`).
- **`PUT /api/v1/seller/studio/layout/draft`** : Enregistre le brouillon des sections (`draftSections`) dans une transaction Firestore qui vérifie `expectedRevision` et incrémente `draftRevision`.
- **`POST /api/v1/seller/studio/layout/publish`** : Copie le brouillon actuel vers le layout public (`publishedSections`), crée une entrée immuable dans l'historique des versions (`versions[]`) et met à jour la vitrine publique.
- **`POST /api/v1/seller/studio/layout/rollback`** : Restaure une version antérieure (`versionNumber`) dans le brouillon et la publie.

---

## 4. Organisation Visuelle de l'Écran : Les 3 Colonnes & la Barre Mobile (`StudioWorkspace.tsx`)

Le fichier `src/pages/Seller/StoreBuilder/StudioWorkspace.tsx` assemble l'interface complète.  
- **Sur Ordinateur (`StudioColumnsLayout.tsx`)**, l'écran est divisé en **3 colonnes** redimensionnées proprement avec une barre supérieure fixe.
- **Sur Téléphone (`MobileStudioBar.tsx`, `MobileStudioHeader.tsx`, `MobileGuidedJourneyBar.tsx`)**, les 3 colonnes se transforment en **3 onglets en haut de l'écran** : `Aperçu` (pour voir la boutique), `Structure (N)` (pour gérer la liste des sections) et `Réglages` (pour modifier les paramètres de la section ou du thème).

### 4.1. La Barre Supérieure (`StudioTopBar.tsx` & `StudioTopBarRightActions.tsx`)
De gauche à droite, la barre supérieure contient :
1. **Bouton Retour (`<-`)** : Ramène au tableau de bord vendeur (`/seller/dashboard`).
2. **Bouton Menu (`Menu`)** : Sur tablette/mobile, ouvre le tiroir de navigation entre les piliers (`StudioMobileMenu.tsx`).
3. **Boutons Annuler / Rétablir (`Undo / Redo`)** : Affichent le nombre d'étapes disponibles dans l'historique.
4. **Simulateur d'Appareils (`Ordinateur | Tablette | Mobile`)** : Redimensionne en temps réel le cadre central (`100%`, `768px` ou `375px`) et adapte automatiquement tous les composants au profil responsive de l'appareil choisi.
5. **Outils de Canevas (`StudioTopBarRightActions.tsx`)** :
   - **Recherche Rapide / Palette de Commandes (`Ctrl+K`)** : Ouvre `StudioCommandPalette.tsx` pour chercher n'importe quelle section ou réglage au clavier.
   - **Bouton Historique des Versions** : Ouvre `StudioHistoryModal.tsx` montrant toutes les versions publiées avec leur date et un bouton « Restaurer cette version ».
   - **Indicateur de Sauvegarde & Bouton Disquette** : Montre en temps réel si le brouillon est synchronisé, en cours d'enregistrement, ou permet de forcer un enregistrement immédiat.
   - **Bouton « Mettre à jour » (Publier)** : Lance les vérifications de qualité et ouvre `StudioDirectPublishModal.tsx` pour mettre la boutique en ligne.

### 4.2. La Colonne Gauche : Mode Guidé (4 Étapes) vs Mode Accès Libre (11 Piliers) (`StudioSidebar.tsx`)
C'est ici que le vendeur choisit comment il veut travailler grâce au bouton de bascule **`Mode Guidé <-> Accès Libre`** (`useStudioGuidedNavigation.ts` & `studioSidebarSteps.ts`) :

#### A. En Mode Guidé (`Parcours · 1/4`)
Idéal pour un nouveau vendeur qui crée sa boutique pour la première fois. Le Studio le prend par la main en **4 grandes étapes progressives** avec un bouton **`Enregistrer & Étape suivante ->`** :
- **Étape 1 : Identité & En-tête** (*Nom, slug et menu principal*) -> Sous-onglets : `Identité`, `Menu & En-tête`.
- **Étape 2 : Thème & Couleurs** (*Palette, typographie et textures*) -> Sous-onglets : `Thème`, `Finitions`.
- **Étape 3 : Sections Vitrine** (*Blocs et contenu de l'accueil*) -> Sous-onglets : `Blocs Accueil`, `Médias`.
- **Étape 4 : Commerce & Pages** (*Livraison, catalogue et suivi*) -> Sous-onglets : `Livraison`, `Catalogue`, `Pages`, `Commandes`.

#### B. En Mode Accès Libre (`Expert`)
Déverrouille simultanément les **11 panneaux du Studio**, classés en 2 groupes :
- **Groupe 1 — Apparence** : `Sections`, `Thème`, `Finitions`, `En-tête`, `Identité`, `Pages`.
- **Groupe 2 — Commerce & Médias** : `Catalogue`, `Médias`, `Livraison & SEO`, `Commandes`, `Check-list`.

### 4.3. L'Arbre des Sections & Sous-Blocs (`SectionTreePanel.tsx`, `SectionCard.tsx`, `SectionSubBlocksTree.tsx`)
Lorsque le vendeur est dans le mode `Sections`, la colonne gauche affiche la structure verticale de sa page d'accueil :
- **Ajout d'une section (`AddSectionModal.tsx`)** : Ouvre une fenêtre présentant les 16 types de sections classés par catégorie avec aperçu visuel.
- **Cartes de Section (`SectionCard.tsx`)** : Chaque section de la page est représentée par une carte que l'on peut :
  - **Réordonner** vers le haut ou vers le bas (glisser-déposer ou flèches).
  - **Déplier (`SectionSubBlocksTree.tsx` & `SectionStaticSubBlocks.tsx`)** : Permet de voir les sous-éléments internes de la section (ex: pour une bannière : *Photo & Modèle*, *Titre & Textes*, *Boutons d'action* ; pour un carrousel : *Slide 1*, *Slide 2*...). Cliquer sur un sous-élément ouvre directement la bonne étape dans l'inspecteur de droite !
  - **Masquer / Afficher** (icône Œil : change `section.isVisible`).
  - **Dupliquer** (clone la section).
  - **Supprimer** (ouvre la confirmation `DeleteSectionModal.tsx`).

### 4.4. La Colonne Centrale : Le Canevas Temps Réel & ses Outils (`LiveCanvasPreview.tsx` & `StudioPreview.tsx`)
La colonne centrale n'est pas une image statique : c'est le véritable moteur de rendu React de la boutique qui tourne en direct. Elle intègre 6 outils interactifs exclusifs (`components/preview/`) :
1. **`CanvasPageSwitcherBar.tsx`** : Barre située juste au-dessus de l'aperçu permettant de basculer la page affichée sur le canevas entre la **Page d'Accueil**, la **Page Catalogue / Collections**, ou l'une des **Pages Personnalisées** créées par le vendeur.
2. **`PreviewControlToolbar.tsx`** : Contrôle le niveau de zoom, l'affichage de la grille d'alignement (`CanvasGridOverlay.tsx`), l'ouverture de l'audit qualité (`PreviewAuditModal.tsx`) et le QR Code de test sur vrai téléphone (`PreviewQrModal.tsx`).
3. **`CanvasSectionFloatingDock.tsx`** : Lorsqu'on clique sur une section dans l'aperçu central, une barre d'outils flottante s'affiche juste au-dessus d'elle pour monter/descendre la section, la masquer, la dupliquer ou la supprimer sans avoir à chercher dans la colonne gauche.
4. **`HeroCanvasSubToolbar.tsx` & `CategoryCanvasQuickBar.tsx`** : Barres rapides contextuelles sur le canevas permettant de changer le modèle d'une bannière ou le style d'une grille de catégories en 1 clic directement sur l'aperçu.
5. **`CanvasInlineText.tsx`** : Permet au vendeur de double-cliquer directement sur un titre ou un sous-titre dans l'aperçu central pour modifier le texte sur place (*Inline Editing*) !
6. **`InteractiveCartSimulator.tsx`** : Permet au vendeur de tester en direct l'ouverture d'une fiche produit et le fonctionnement du panier d'achat et du formulaire de commande COD (Paiement à la livraison) tel que ses clients le vivront.

---

## 5. Détail Complet des 11 Piliers Globaux de la Boutique (`components/context/`)

Lorsque le vendeur clique sur l'un des 11 modes de navigation dans la colonne de gauche, le fichier `PropertiesInspector.tsx` charge le panneau correspondant dans la colonne de droite :

### 5.1. `identity` : Identité de la Boutique (`StoreIdentityEditor.tsx`)
Situé dans `src/pages/Seller/StoreBuilder/components/identity/StoreIdentityEditor.tsx` (accompagné de `PaletteControls.tsx` et `TypographySliders.tsx`), ce panneau permet de configurer :
- Le **Nom officiel de la boutique**, sa **Description courte**, sa **Wilaya** et sa **Commune**.
- Le **Logo de la boutique** et la **Bannière de couverture** (avec upload direct ou choix dans la médiathèque).
- Le **Statut juridique / Type de vendeur** (Artisan, Boutique officielle, Distributeur agréé, etc.), le **Temps moyen de préparation des commandes** (ex: *"Expédié sous 24h"*) et le résumé de la politique de retour.

### 5.2. `header` : Menu & Barre d'Annonce (`HeaderNavigationInspectorPanel.tsx` & `HeaderAnnouncementAndLayoutForm.tsx`)
Contrôle le sommet de la boutique (`StoreBoutiqueNavbar.tsx` & `StoreCustomHeaderBar.tsx`) :
- **Barre d'annonce supérieure (`Announcement Bar`)** : Texte défilant ou fixe tout en haut du site (ex: *"Livraison offerte dès 6 000 DA d'achat"*), avec couleur de fond et couleur de texte personnalisables.
- **Disposition de l'En-tête (`Header Layout`)** : Position du logo (à gauche ou centré), style de la barre de navigation (flottante, encadrée, transparente ou classique), affichage ou masquage de la barre de recherche et des raccourcis catégories.
- **Liens du Menu Principal** : Ajout, modification et réorganisation des liens du menu de navigation (pointant vers des pages, des collections ou des ancres `#section` de la page d'accueil).

### 5.3. `theme` & `atelier` : Design System Global, 14 Thèmes Signatures & Finitions (`ThemeInspectorPanel.tsx`)
C'est le centre de direction artistique globale de la boutique. Il comporte **5 sous-onglets** :
1. **Onglet `Thèmes` (`ThemeAtelierMaterialsTab.tsx` & `ArtisticPresetsList.tsx`)** :
   - Présente les **14 Thèmes Signatures Modernes** définis dans `constants/artisticStudioPresets.ts` (`artisticModernPresetsPart1.ts` & `artisticModernPresetsPart2.ts`).
   - Le vendeur peut soit appliquer **uniquement les couleurs et polices du thème** à ses sections actuelles (`onApplyThemeOnly`), soit générer une **architecture complète en 5 actes** (`fiveActsLayoutPreset.ts`) assortie au thème.
   - Permet de régler les **Finitions & Matières globales** (`artisticAtmosphereOptions.ts` & `FrameShapeSelectorGrid.tsx`) : texture de surface (grain photo subtil, halo lumineux, verre dépoli), forme des cadres d'image et intensité visuelle.
2. **Onglet `Templates` (`ThemeArchetypesTab.tsx`, `themeArchetypes.ts`, `archetypeFactory.ts`)** :
   - Propose des modèles complets de boutiques par secteur d'activité (*Mode & Prêt-à-Porter*, *Cosmétique & Soin*, *High-Tech & Électronique*, *Maison & Décoration*, *Joaillerie*, *Sport*, *Gastronomie*) qui pré-configurent toute la boutique en un clic.
3. **Onglet `Couleurs` (`ThemeColorPaletteTab.tsx`)** :
   - Éditeur précis des couleurs globales : Couleur Primaire (`primaryColor`), Secondaire (`secondaryColor`), Accentuation (`accentColor`), Fond de page (`backgroundColor`), Fond des cartes (`surfaceColor`), Texte principal (`textColor`) et Bordures (`borderColor`).
   - **Détecteur Intelligent de Surcharges Locales (`countSectionsWithColorOverrides`)** : Si certaines sections ont reçu des couleurs personnalisées manuelles qui masquent le thème global, une bannière ambre s'affiche en haut du panneau avec un bouton **« Harmoniser au thème global »** (`stripHardcodedSectionColors`) qui remet toutes les sections en harmonie avec le thème en 1 clic !
4. **Onglet `Typo` (`ThemeTypographyTab.tsx`)** :
   - Choix de la police des titres (`headingFont`), de la police du corps de texte (`bodyFont`), de l'échelle de taille globale (`fontScale`), de l'espacement des lettres (`letterSpacing`) et de la hauteur de ligne (`lineHeight`).
   - Le hook `useStoreFontLoader.ts` charge automatiquement les polices Google Fonts sélectionnées dans le navigateur.
5. **Onglet `Vente` (`ThemeEcommerceWidgetsTab.tsx`)** :
   - Active ou configure les widgets de conversion e-commerce globaux (badges de réduction, indicateurs de stock faible, bouton d'achat rapide sur les cartes produits).

### 5.4. `pages` : Les 8 Pages Système & Créateur de Pages Personnalisées (`PagesInspectorPanel.tsx` & `PageEditorDrawer.tsx`)
- **8 Pages Système pré-intégrées** : *Accueil*, *Catalogue*, *Collections*, *À propos* (`StoreAboutView.tsx`), *Contact*, *FAQ*, *Livraison*, *Retours*. Cliquer sur l'une d'elles bascule immédiatement l'aperçu central sur cette page.
- **Créateur de Pages Personnalisées (`PageEditorDrawer.tsx`)** : Permet au vendeur de créer des pages supplémentaires sur mesure (ex: `/p/guide-des-tailles`, `/p/nos-boutiques`, `/p/offre-speciale`) avec leur propre titre, slug URL normalisé (`slugifyPagePath`), contenu éditorial, visibilité (`Publiée / Masquée`) et duplication en 1 clic.
- **Design de l'En-tête des Pages Collections** : Permet de choisir entre `hero-image`, `split-banner` ou `minimal` pour la page qui liste les produits d'une collection (`StoreCollectionPageView.tsx`).

### 5.5. `catalog` : Gestion du Catalogue, Rayons & Synchronisation Intelligente (`CatalogInspectorPanel.tsx`)
Ce panneau relie les produits réels du vendeur à l'affichage de sa boutique à travers **3 sous-onglets** :
1. **`Produits` (`CatalogProductsSubPanel.tsx`)** :
   - Liste tous les produits actifs du vendeur (vérifiés par `isCatalogProductPubliclyActive` dans `studioCatalogResolver.ts`).
   - Permet d'**épingler en 1 clic** (icône étoile) les produits à afficher dans les sections *Produits Vedettes*, *Nouveautés* ou *Meilleures Ventes*.
   - **Détection des produits archivés ou épuisés (`invalidFeaturedIds`)** : Si une section référence un produit qui a été supprimé ou désactivé depuis, le panneau l'indique et propose un bouton de nettoyage automatique (`handlePurgeInvalidFeatured`).
2. **`Rayons` (`CatalogCategoriesSubPanel.tsx` & `studioCategorySync.ts`)** :
   - Analyse automatiquement les catégories des produits du vendeur et permet de synchroniser en 1 clic les rayons de la section *Catégories Vedettes* avec les vrais produits en stock.
3. **`Design page` (`CollectionPageCustomizer.tsx`)** :
   - Configure la page catalogue complète : barre de recherche, tri par prix, pilules de filtrage par catégorie, nombre de colonnes (2, 3 ou 4), format d'image des cartes produits (`1:1`, `4:5`, `3:4`) et badge de disponibilité en stock.

### 5.6. `media` : Médiathèque Centralisée, Compression & Remplacement Global (`MediaInspectorPanel.tsx`)
Géré par `useStudioMediaManager.ts`, `studioMediaHandler.ts`, `studioMediaValidation.ts` et `studioMediaUsage.ts` :
- **Téléversement sécurisé (`onUploadMedia`)** : Valide le format et le poids des fichiers images/vidéos et les classe par dossier (`banners`, `products`, `categories`, `brand`).
- **Traçabilité d'utilisation (`studioMediaUsage.ts`)** : Pour chaque image de la galerie (`MediaCard.tsx`), le Studio indique dans combien de sections cette image est actuellement utilisée !
- **Remplacement Global en 1 Clic (`onReplaceMediaUrl` dans `MediaSelectedInspector.tsx`)** : Si le vendeur remplace une image dans la médiathèque, le Studio met à jour automatiquement toutes les bannières et sections qui utilisaient l'ancienne photo.

### 5.7. `settings` : Livraison 69 Wilayas, COD, SEO & Pixels (`StoreSettingsInspectorPanel.tsx` & `StoreSettingsCommerceAndStatusTabs.tsx`)
Divisé en **3 sous-onglets** :
1. **`Général`** : Nom de la boutique, lien URL personnalisé (`olmart.dz/ma-boutique` validé par `studioConfigSanitizers.ts`), Wilaya, Commune, Titre SEO Google et Meta-Description.
2. **`COD & 69W` (Commerce & Livraison Algérie)** :
   - Activation du paiement à la livraison (*Cash on Delivery*), seuil de livraison gratuite (ex: livraison offerte dès X DA), tarifs par défaut à domicile et en point relais (*Stop-Desk*) sur les wilayas, numéro WhatsApp de commande rapide.
3. **`Pixels & Statut`** :
   - Intégration des identifiants **Meta Pixel (Facebook/Instagram)**, **TikTok Pixel** et **Google Analytics** pour le suivi publicitaire des conversions.
   - Gestion du **Statut de la Boutique** : *Ouverte*, *Mode Vacances / Pause temporaire* (avec message personnalisé aux visiteurs), ou *Accès VIP par mot de passe* (`StoreVipLockGate.tsx`).

### 5.8. `orders` (`OrdersInspectorPanel.tsx`) & `launchpad` (`SetupGuideInspectorPanel.tsx`)
- **`OrdersInspectorPanel.tsx`** : Permet au vendeur de consulter un résumé de ses dernières commandes directement depuis le Studio sans perdre le fil de sa création.
- **`SetupGuideInspectorPanel.tsx` (Check-list de lancement)** : Analyse la boutique et affiche une liste de contrôle interactive (*Logo ajouté*, *Description renseignée*, *Produits publiés*, *Sections configurées*, *Livraison paramétrée*) avec des boutons qui amènent directement au bon panneau pour compléter ce qui manque.

---

## 6. Fonctionnement Interne de l'Inspecteur de Section et de ses 5 Onglets (`SectionInspectorPanel.tsx`)

Dès que le vendeur clique sur une section (dans la liste de gauche ou sur l'aperçu central), la colonne droite affiche `src/pages/Seller/StoreBuilder/components/inspector/SectionInspectorPanel.tsx`.

En haut de ce panneau, le vendeur voit :
- Un menu déroulant rapide permettant de **changer de section** sans retourner dans la colonne gauche.
- Un champ pour **renommer la section** et un bouton **Œil** pour la masquer/afficher.
- La barre des **5 onglets d'inspection** : **`Contenu`**, **`Style`**, **`Disposition`**, **`Appareils`**, **`Avancé`**.

### 6.1. Le Problème de l'Écrasement Synchrone en React et la Solution `latestSectionRef`
Dans React, les props d'un composant (`section`) sont figées pendant toute la durée d'un cycle de rendu (*render tick*).  
Or, dans l'inspecteur du Studio, certains boutons intelligents modifient **à la fois** `section.styles` et `section.settings` au cours du même clic :
```typescript
onStylesChange("borderRadius", "lg");
onSettingsChange("cardBorderRadius", "lg");
```
Si `onSettingsChange` utilisait la prop `section` d'origine pour construire la nouvelle section, il repartirait de l'état d'avant `onStylesChange` et **effacerait** le `borderRadius: "lg"` qui venait tout juste d'être appliqué !

**Comment le code résout ce problème dans `SectionInspectorPanel.tsx` :**
1. Nous maintenons une référence mutable synchrone :
   ```typescript
   const latestSectionRef = useRef<CustomPageSection | null>(section);
   latestSectionRef.current = section;
   ```
2. Lorsqu'une fonction de mise à jour (`handleSettingsChange` ou `handleStylesChange`) est appelée, elle lit **`latestSectionRef.current`** (qui contient déjà les modifications faites quelques microsecondes plus tôt dans le même tick), fusionne le nouveau changement, **met immédiatement à jour `latestSectionRef.current = updatedSection`**, puis appelle `onUpdateSection(baseSection.id, patch)`.
3. Résultat : **aucune modification n'est jamais perdue**, même lorsqu'un bouton déclenche 3 ou 4 mises à jour en cascade.

### 6.2. La Synchronisation Bidirectionnelle `settings <-> styles` pour les Bannières (`hero_banner`)
Pour une bannière principale (`hero_banner`), le vendeur peut régler les coins arrondis, l'ombre portée ou les couleurs à deux endroits différents :
- Dans l'onglet **`Contenu -> Étape 1. Modèle`** ou **`Étape 4. Boutons`** (qui modifient `section.settings`).
- Dans l'onglet **`Style -> 1. Couleurs`** ou **`2. Bords`** (qui modifient `section.styles`).

Pour que ces deux onglets soient toujours **100% cohérents**, `SectionInspectorPanel.tsx` embarque deux traducteurs automatiques :
1. **`syncHeroStylesFromSettingsPatch(patch, currentStyles)`** : Si le vendeur change l'arrondi ou l'ombre dans l'onglet *Contenu*, le code copie la valeur correspondante dans `section.styles`.
2. **`syncHeroSettingsFromStylesPatch(patch, currentSettings)`** : Si le vendeur va dans **`Style -> 2. Bords`** et choisit par exemple :
   - **Arrondi des coins = `Arrondis` (`lg` -> `2xl`)**
   - **Ombre autour du bloc = `Lumineuse` (`glow`)**
   Alors cette fonction met automatiquement à jour `settings.cardBorderRadius = "2xl"`, `settings.bannerShadow = "glow"` et `settings.frameShadow = "glow"`. De plus, si la bannière était en hauteur `100vh` (plein écran collé aux bords où l'on ne pourrait pas voir les coins arrondis), elle ajuste automatiquement la hauteur en `lg` (`560px`) pour que les coins arrondis et l'ombre lumineuse s'affichent immédiatement !

### 6.3. Onglet 1 : `Contenu` (`SectionContentTab.tsx`)
Route automatiquement vers l'éditeur spécialisé correspondant au type de la section sélectionnée :
- `HeroContentEditor.tsx` pour les bannières principales (`hero_banner`) et vidéos (`showcase_video`).
- `CategoryContentEditor.tsx` pour les catégories vedettes (`featured_categories`).
- `KineticMarqueeContentEditor.tsx` pour le bandeau défilant (`kinetic_marquee`).
- `ProductSelectionEditor.tsx` pour les 4 sections produits (`featured_products`, `new_arrivals`, `best_sellers`, `product_grid`).
- `ListContentEditor.tsx` pour les carrousels (`promo_carousel`), collections (`curated_collections`) et FAQ (`faq_accordion`).
- `InfoContentEditor.tsx` pour l'histoire de marque (`brand_story`), les avis vérifiés (`verified_reviews`), la livraison (`delivery_info`), les retours (`return_policy`) et le pied de contact (`contact_footer`).

### 6.4. Onglet 2 : `Style` en 4 Étapes (`SectionStyleTab.tsx` & `SectionVisualEffectsSubPanel.tsx`)
Organisé en **4 sous-étapes numérotées** simples avec un bouton **« Hériter du Thème Global »** en bas pour tout réinitialiser si besoin :
- **Étape `1. Couleurs`** :
  - `ColorSchemePicker.tsx` : Permet d'appliquer un jeu de couleurs rapide ou d'hériter du thème.
  - `SectionElementColorMatrix.tsx` (`sectionColorSlotsConfig.ts`) : Affiche des sélecteurs de couleur précis pour chaque zone de la section (Fond du bloc, Titre, Sous-titre, Surligne/Badge, Fond des cartes, Prix, Bordures).
  - Curseur de **Transparence du bloc** (`50%` à `100%`).
- **Étape `2. Bords`** (`SectionVisualEffectsSubPanel.tsx`) :
  - **Arrondi des coins** : 4 choix simples (`Carrés`, `Légers`, `Arrondis`, `Très ronds`) + un bouton **`Coin par coin`** (`usePerCornerRadius`) qui déverrouille 4 curseurs indépendants (`Haut Gauche`, `Haut Droite`, `Bas Gauche`, `Bas Droite` de `0px` à `64px`) ainsi que `SectionCornerColorsSubBox.tsx` pour colorer les angles.
  - **Ombre autour du bloc** : 5 choix (`Aucune`, `Légère`, `Moyenne`, `Forte`, `Lumineuse / Glow`).
- **Étape `3. Aspect`** (`SectionVisualEffectsSubPanel.tsx` & `SectionMaterialSubPanel.tsx`) :
  - **Effet sur les photos** : 5 filtres rapides (`Normal`, `Vif & Clair`, `Doux`, `Chaud`, `Noir & Blanc`) + 3 curseurs de retouche photo en direct (**Luminosité**, **Contraste**, **Couleurs / Saturation** de `50%` à `150%`).
  - **Matière & Texture de fond** (`SectionMaterialSubPanel.tsx`) : Style des cartes internes (verre dépoli, bordure fine, plat) et texture de surface.
- **Étape `4. Bouton`** (`SectionVisualEffectsSubPanel.tsx` & `EditorialTypographyControlBox.tsx`) :
  - **Forme des boutons** (`Arrondi`, `Pilule`, `Carré`, `Contour`) et **Ombre du bouton** (`Aucune`, `Douce`, `Forte`, `Lueur`).
  - **Couleurs du bouton** (Fond du bouton, Texte du bouton, Bordure du bouton).
  - **Typographie éditoriale** (`EditorialTypographyControlBox.tsx`) : Espacement des lettres, hauteur de ligne et style de soulignement des mots mis en valeur entre `{accolades}` ou `*astérisques*`.

### 6.5. Onglet 3 : `Disposition` (`SectionLayoutTab.tsx`)
Contrôle la géométrie spatiale de la section :
- **Largeur sur la page** : `Centré` (largeur standard du site), `Plein bord` (occupe 100% de la largeur de l'écran) ou `Étroit` (colonne de lecture resserrée).
- **Espace haut et bas (`paddingY`)** : Boutons rapides (`4px` à `64px`) + curseur continu (`0px` à `120px`).
- **Espace gauche et droite (`paddingX`)** : Curseur de `0px` à `64px`.
- **Nombre de colonnes (Ordinateur)** : `2`, `3` ou `4 colonnes` (affiché pour les sections contenant des grilles de produits, catégories, collections ou avis).
- **Alignement du texte** : Horizontal (`Gauche`, `Centre`, `Droite`) et Vertical (`Haut`, `Milieu`, `Bas`).
- **Bordure du bas de section (`SectionShapeDivider.tsx`)** : Découpe le bas de la section en `Droite`, `Vague`, `En biais` ou `Courbe`.

### 6.6. Onglet 4 : `Appareils` (`SectionResponsiveTab.tsx` & `responsiveInheritanceHelper.ts`)
Permet d'adapter finement la section pour **Ordinateur**, **Tablette** ou **Mobile** :
- **Synchronisation automatique avec le canevas** : Quand le vendeur clique sur « Mobile » dans cet onglet, l'aperçu central bascule automatiquement en format Téléphone (`375px`) !
- **Badges d'héritage intelligents (`renderSourceBadge`)** : À côté de chaque réglage (*Taille du titre*, *Taille du texte*, *Espace haut et bas*, *Colonnes*, *Alignement*), un badge indique d'où vient la valeur :
  - `Par défaut` (sur Ordinateur)
  - `Copié (Ordinateur)` (si la Tablette ou le Mobile hérite automatiquement du réglage Ordinateur)
  - `Propre à Mobile` (dès que le vendeur déplace un curseur pour créer une valeur spécifique au téléphone, avec un bouton de réinitialisation individuel).
- **Case « Masquer sur Ordinateur / Tablette / Mobile »** : Permet de créer une section visible uniquement sur téléphone ou uniquement sur ordinateur.

### 6.7. Onglet 5 : `Avancé` (`SectionAdvancedTab.tsx`)
Pour les besoins techniques et d'accessibilité :
- **ID d'ancre de navigation (`#ancre`)** : Nettoie automatiquement la saisie via `sanitizeAnchorId` (ex: `#nouvelle-collection`) pour permettre aux liens du menu d'en-tête de faire défiler la page jusqu'à cette section.
- **Animation d'apparition** : `Aucune`, `Fondu` (`fade`), `Glissé` (`slide-up`), `Zoom` (`zoom`).
- **Visibilité conditionnelle** :
  - *Toujours afficher*
  - *Afficher uniquement si des produits sont en stock* (`in_stock_only`)
  - *Affichage programmé sur une plage de dates* (`scheduled` avec date de début `visibleFrom` et date de fin `visibleUntil`, idéal pour une vente flash ou une fête).
- **Classes CSS contrôlées (`sanitizeControlledCssClasses`)** : 4 préréglages sécurisés (`Élévation douce`, `Bordure fine`, `Effet verre dépoli`, `Cadre éditorial`) + champ filtré anti-injection.
- **Accessibilité WCAG / ARIA** : Description vocale `aria-label` et rôle sémantique (`region`, `banner`, `complementary`, `contentinfo`).

---

## 7. Architecture Complète du Système de Bannières Principales (`hero_banner`)

La bannière principale (`hero_banner`) est le premier élément que voient les visiteurs d'une boutique. Son code est réparti entre :
- **Les éditeurs de l'inspecteur** : `src/pages/Seller/StoreBuilder/components/inspector/content/HeroContentEditor.tsx` et le dossier `components/inspector/hero/`.
- **Les moteurs de rendu** : `src/components/Store/sections/SectionHeroBanner.tsx`, le dossier `sections/hero/` et le dossier `sections/CinematicBanner/`.

### 7.1. L'Éditeur Unifié en 4 Étapes (`HeroContentEditor.tsx`)
Pour que le vendeur ne soit jamais perdu, tous les modèles de bannières utilisent exactement le même parcours en **4 étapes** :

1. **Étape `1. Modèle` (`HeroStep1ShapePanel.tsx`, `HeroModelGridAndDeviceBar.tsx`, `HeroModelWireframes.tsx`, `HeroModelSpecificConfigPanel.tsx`)** :
   - **Choix visuel des 5 modèles** illustrés par des schémas miniatures (`HeroModelWireframes.tsx`).
   - **Sélecteur d'appareil rapide** (*Ordinateur*, *Tablette*, *Mobile*) pour ajuster la hauteur ou l'alignement par écran.
   - **Hauteur de la bannière** : `Compacte (380px)`, `Moyenne (460px)`, `Grande (560px)` ou `Plein écran`.
   - **Position du texte** : `À gauche`, `Au centre`, `À droite`.
   - **Coins & Ombre de la bannière** : Sélecteurs synchronisés d'arrondi des coins (`Carrés`, `Légers`, `Arrondis`, `Très ronds`) et d'ombre (`Aucune`, `Douce`, `Marquée`, `Lumineuse`).
   - **Réglages spécifiques au modèle choisi (`HeroModelSpecificConfigPanel.tsx`)** : Par exemple, pour le modèle *Moitié Texte / Moitié Image*, permet d'inverser le côté de l'image (Image à gauche ou Image à droite). Pour l'*Arche*, permet de choisir la forme de la découpe.

2. **Étape `2. Image` (`HeroPhotoAndCtaStepPanels.tsx`)** :
   - Sélection de l'**Image principale** (via `StudioImagePicker.tsx` qui donne accès à l'upload, à la médiathèque et à une banque de photos professionnelles par secteur `studioStockPhotos.ts`).
   - **Image mobile dédiée** (optionnelle) et **Images secondaires** (si le modèle *Duo 2 Images* ou *Mosaïque 3 Images* est actif).
   - **Cadrage / Point focal de la photo** et curseur d'**Assombrissement de la photo (`0%` à `90%`)** pour que le texte blanc ressorte toujours nettement.

3. **Étape `3. Textes` (`HeroPhotoAndCtaStepPanels.tsx`)** :
   - **Petit texte au-dessus du titre** (Badge / Surligne), **Titre principal**, **Taille du titre** (`Petit`, `Normal`, `Grand`, `Très grand`) et **Description**.
   - **Fond derrière le texte (`textCardStyle`)** : Permet d'ajouter un fond flou transparent (*Glassmorphism*), une carte sombre ou une carte claire juste derrière le texte.

4. **Étape `4. Boutons` (`HeroCtaStep4Panel.tsx`, `HeroCtaButtonControls.tsx`, `HeroColorElementPickers.tsx`)** :
   - Configuration du **Bouton principal** et du **Second bouton** grâce au sélecteur de lien intelligent (`SmartLinkPicker.tsx`).
   - Configuration des **Couleurs de la bannière** : choix entre suivre le thème de la boutique, appliquer une ambiance prédéfinie ou personnaliser chaque couleur élément par élément (`HeroColorElementPickers.tsx`).

### 7.2. Les 5 Modèles Architecturaux de Bannières (`constants/heroBannerModels.ts`)
La fonction `normalizeHeroLayoutModelId` garantit que toute bannière correspond à l'un de ces 5 modèles :
1. **`cinema-full` (*Image Pleine Largeur*)** : Rendu par `CinematicBannerRenderer.tsx` (et son wrapper `HeroFullBleed.tsx`). Grande photo immersive occupant toute la largeur avec voile dégradé et texte superposé.
2. **`editorial-split` (*Moitié Texte / Moitié Image*)** : Rendu par `HeroSplit.tsx`. Divise la bannière en deux : une colonne éditoriale colorée pour le texte et les boutons, et une colonne photo haute définition.
3. **`arch-frame` (*Texte + Image en Arche*)** : Rendu par `HeroArch.tsx`. Présente le texte d'un côté et encadre la photo principale dans une arche architecturale arrondie au sommet.
4. **`floating-gallery` (*Mosaïque 3 Images*)** : Rendu par `HeroGallery.tsx`. Combine le bloc de texte avec une composition asymétrique de 3 photos (utilisant `HeroSwapImageFrame.tsx` pour permettre d'échanger les photos).
5. **`stacked-Lookbook` (*Duo 2 Images Côte à Côte*)** : Rendu par `HeroDiptych.tsx`. Affiche deux grandes photos côte à côte (diptyque) avec un encart de titre centré ou décalé.

### 7.3. Le Moteur de Calcul des Effets Visuels, Coins Arrondis et Ombre Lumineuse (`heroVisualEffectsHelper.ts`)
Avant qu'un des 5 modèles ne s'affiche à l'écran, `SectionHeroBanner.tsx` appelle `resolveHeroVisualEffects(section)` et `resolveHeroDeviceProfile(section, viewport, globalTheme)` :
- **Calcul des Coins Arrondis (`frameRadiusClass` & `customCornerRadiusStyle`)** :
  - Lit `styles.borderRadius` ou `settings.cardBorderRadius` (`none`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`).
  - Si le mode `Coin par coin` (`usePerCornerRadius`) est activé, génère le style CSS exact `borderRadius: "24px 0px 24px 0px"`.
- **Calcul de l'Ombre et du Halo Lumineux (`frameShadowClass` & `frameInlineStyle`)** :
  - Lit `styles.shadow`, `styles.boxShadow`, `settings.bannerShadow` ou `settings.frameShadow`.
  - Si **`Lumineuse` (`glow`)** est sélectionné, le code calcule la couleur dominante de la bannière (`glowBaseColor`) et génère un double halo lumineux CSS (`boxShadow: "0 0 55px -8px ..., 0 20px 45px -15px ..."`).
- **Encadrement Automatique (`needsOuterFramePadding`)** :
  - Dès que la bannière a des coins arrondis (`hasVisibleRadius`) ou une ombre active (`hasVisibleShadow`), le conteneur parent dans `SectionHeroBanner.tsx` et `CinematicBannerRenderer.tsx` active automatiquement un léger retrait (`p-2.5 sm:p-4`) et applique `overflow-hidden` + `frameRadiusClass` + `frameShadowClass` sur le bloc de la bannière. Ainsi, même sur un écran de téléphone mobile, les coins arrondis et l'ombre lumineuse sont parfaitement découpés et visibles !

---

## 8. Catalogue Détaillé des 16 Types de Sections & de leurs Éditeurs Spécialisés

### 8.1. Le Pipeline de Rendu Universel (`StoreSectionRenderer.tsx` & `sectionStyleHelper.tsx`)
Toutes les sections de la boutique passent par `src/components/Store/sections/StoreSectionRenderer.tsx`. Voici ce que fait ce fichier pour chaque section :
1. **Vérification de la visibilité (`isVisible`, `visibilityRule`, `isSectionHiddenForViewport`)** :
   - Si la section est programmée par dates (`visibilityRule === "scheduled"`), il vérifie si la date du jour est comprise entre `visibleFrom` et `visibleUntil`.
   - Si la section est masquée sur l'appareil courant (`hideOnMobile`, `hideOnTablet`, `hideOnDesktop`), il la cache aux clients publics mais l'affiche avec un badge d'information ambre au vendeur dans le Studio.
2. **Calcul des styles CSS & Héritage Responsive (`getSectionContainerStyles` dans `sectionStyleHelper.tsx`)** :
   - Appelle `resolveResponsiveSectionValues(section, theme, viewport)` pour obtenir les marges, tailles de police, nombre de colonnes et alignements propres à l'appareil actif.
   - Calcule l'arrondi des coins (`borderRadiusClass`), l'ombre portée (`shadowClass`, y compris le halo `glow`), la couleur de fond et la bordure.
   - Si une section possède un arrondi ou une ombre tout en étant en largeur pleine (`full`), il ajoute automatiquement une marge externe sécurisée (`my-3 mx-2.5 sm:mx-4`) et `overflow-hidden` pour que l'effet visuel ne soit jamais coupé par le bord de l'écran.
3. **Couches artistiques (`ArtisticAtmosphereLayer.tsx` & `SectionShapeDivider.tsx`)** :
   - Dessine l'atmosphère d'arrière-plan (grain photo, halos de couleur) et la découpe SVG du bas de section (vague, courbe, biais).
4. **Rendu du composant spécifique** parmi les 16 types listés dans `constants/sectionCatalog.ts`.

### 8.2. Explication Détaillée de Chacune des 16 Sections (Éditeur + Renderer + Rôle)

| # | Identifiant (`type`) | Nom Utilisateur | Fichier Éditeur (Colonne Droite) | Fichier de Rendu (Canevas Central) | Comment ça fonctionne en détail |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | `hero_banner` | **Bannière Principale** | `HeroContentEditor.tsx` (+ dossier `inspector/hero/`) | `SectionHeroBanner.tsx` (+ 5 modèles `hero/` & `CinematicBanner/`) | Vitrine principale en 4 étapes et 5 modèles visuels, avec point focal photo, carte de texte, double bouton et ambiances colorées. |
| **2** | `promo_carousel` | **Carrousel Promotionnel** | `ListContentEditor.tsx`, `PromoSlidesListEditor.tsx`, `PromoActiveSlideForm.tsx`, `CarouselDesignAndPresetTab.tsx`, `CarouselCampaignPresetsView.tsx` | `SectionPromoCarousel.tsx` & `PromoCarouselSlideRenderer.tsx` | Diaporama multi-bannières. Le vendeur peut ajouter/réordonner des slides, appliquer des campagnes pré-conçues (`carouselPresets.ts`), régler la vitesse de défilement automatique et personnaliser chaque slide (image, badge, titre, bouton). |
| **3** | `kinetic_marquee` | **Bandeau Défilant** | `KineticMarqueeContentEditor.tsx` & `marqueePresetsData.ts` | `KineticMarqueeSection.tsx` | Bandeau de texte animé défilant horizontalement en boucle. Le vendeur choisit parmi des messages prêts à l'emploi (`marqueePresetsData.ts`), règle la vitesse de défilement, le sens, la taille du texte et le séparateur (étoile, point, éclair). |
| **4** | `featured_categories` | **Catégories Vedettes (Rayons)** | `CategoryContentEditor.tsx` + dossier `inspector/category/` (`CategoryPresetSelector`, `CategoryItemListManager`, `CategoryProductAssigner`, `CategoryCanvaStyleControls`, `CategoryOverlayAndFinishControls`) | `SectionFeaturedCategories.tsx`, `FeaturedCategoriesRenderer.tsx` + dossier `sections/category/` (`CategoryBentoGrid`, `CategoryBubblesRow`, `CategoryMesh3DRow`, `CategoryShopifyBento`, `CategoryShopifyCards`, `CategoryShopifyPills`, `CategoryShopifyStories`, `CategoryEditorialModels`) | Système ultra-complet de présentation des rayons. Propose plusieurs architectures visuelles (*Grille Bento*, *Bulles Stories Instagram*, *Cartes Éditoriales*, *Pilules rapides*, *Galerie 3D*), synchronisation automatique avec les catégories des produits du vendeur (`CategorySmartSyncBar.tsx`) et assignation manuelle de produits par rayon (`CategoryProductAssigner.tsx`). |
| **5** | `curated_collections` | **Collections Sélectionnées** | `ListContentEditor.tsx` & `CuratedCollectionsStepPanel.tsx` | `SectionFeaturedCategories.tsx` | Permet de créer des sélections thématiques (ex: *"Idées Cadeaux"*, *"Pack Été"*, *"Essentiels"*), d'y associer une photo de couverture et de choisir précisément quels produits composent chaque collection (`SmartLinkProductMultiPicker.tsx`). |
| **6** | `featured_products` | **Produits Vedettes** | `ProductSelectionEditor.tsx`, `ProductPickerSubTab.tsx`, `ProductCardStyleController.tsx` | `SectionProductFeeds.tsx`, `SectionProductItemCard.tsx`, `ProductFeedEcommerceWidgets.tsx` | Met en avant les produits phares. Le vendeur choisit entre une sélection **Automatique** ou **Manuelle** (en cochant les produits dans `ProductPickerSubTab.tsx`), règle le style des cartes produits (`ProductCardStyleController.tsx` : format photo, affichage du badge stock, bouton panier rapide) et l'affichage en grille ou carrousel. |
| **7** | `new_arrivals` | **Nouveautés** | `ProductSelectionEditor.tsx` | `SectionProductFeeds.tsx` | Affiche automatiquement les derniers produits ajoutés au catalogue (triés par date de création) avec badge *"Nouveau"*. |
| **8** | `best_sellers` | **Meilleures Ventes** | `ProductSelectionEditor.tsx` | `SectionProductFeeds.tsx` | Affiche les produits les plus vendus ou populaires de la boutique avec badges de mise en avant. |
| **9** | `product_grid` | **Grille Catalogue Complète** | `ProductSelectionEditor.tsx` | `SectionProductFeeds.tsx` & `StoreProductsFilter.tsx` | Affiche l'ensemble du catalogue directement sur la page avec barre de recherche intégrée, filtres par catégorie et tri par prix croissant/décroissant. |
| **10** | `showcase_video` | **Vidéo de Présentation** | `HeroContentEditor.tsx` & `ShowcaseVideoEditor.tsx` | `SectionContentAndTrust.tsx` | Intègre une vidéo (YouTube, Vimeo ou fichier vidéo MP4 téléversé dans la médiathèque) avec image de couverture, option lecture automatique muette en boucle (`autoplay`), format 16:9 ou cinéma et texte d'accompagnement. |
| **11** | `brand_story` | **Histoire & Savoir-Faire** | `InfoContentEditor.tsx` + `CountdownCardEditor.tsx` | `SectionContentAndTrust.tsx`, `LiveCountdownBanner.tsx`, `RotatingSealBadge.tsx` | Section de storytelling de la marque : combine titre éditorial, récit de l'entreprise, photo d'atelier, sceau rotatif de garantie (`RotatingSealBadge.tsx`), chiffres clés et option de compte à rebours d'événement (`LiveCountdownBanner.tsx` / `CountdownPreviewStylesGrid.tsx`). |
| **12** | `verified_reviews` | **Avis Clients Vérifiés** | `InfoContentEditor.tsx` | `SectionContentAndTrust.tsx` | Affiche les témoignages clients avec note sur 5 étoiles, nom de l'acheteur, wilaya et badge *"Achat Vérifié"*. |
| **13** | `delivery_info` | **Livraison & Tarifs (69 Wilayas)** | `InfoContentEditor.tsx` & `AlgeriaEcommercePresets.tsx` | `SectionContentAndTrust.tsx` & `StoreTrustBadges.tsx` | Affiche clairement les conditions de livraison du vendeur (livraison à domicile, point relais Stop-Desk, paiement à la livraison COD, vérification du colis à la réception). |
| **14** | `return_policy` | **Garantie & Politique de Retour** | `InfoContentEditor.tsx` | `SectionContentAndTrust.tsx` & `StoreEngagementsCard.tsx` | Rassure l'acheteur sur les délais d'échange, les conditions de remboursement et le service après-vente. |
| **15** | `faq_accordion` | **Questions Fréquentes (FAQ)** | `ListContentEditor.tsx` & `FaqListStepPanel.tsx` | `SectionContentAndTrust.tsx` | Liste de Questions / Réponses dépliables en accordéon. `FaqListStepPanel.tsx` permet d'ajouter, modifier, réordonner ou supprimer chaque question-réponse très simplement. |
| **16** | `contact_footer` | **Contact & Pied de Page** | `InfoContentEditor.tsx` & `ContactFooterContentEditor.tsx` | `SectionTrustAndContact.tsx` & `SectionContentAndTrust.tsx` | Bloc de contact final affichant les boutons d'appel direct, d'ouverture de conversation WhatsApp en 1 clic, l'adresse e-mail, la localisation (Wilaya / Commune), les horaires d'ouverture et les liens réseaux sociaux. |

---

## 9. Les Contrôles Visuels Intelligents de l'Inspecteur (`components/inspector/controls/`)

Pour remplacer les formulaires complexes par des contrôles visuels intuitifs, le dossier `src/pages/Seller/StoreBuilder/components/inspector/controls/` contient des briques réutilisables dans tout le Studio :

- **`SmartLinkPicker.tsx`** : Sélecteur de destination intelligent pour tous les boutons de la boutique. Au lieu de demander au vendeur de copier-coller une URL compliquée, il lui propose un menu simple :
  1. *Vers un Produit précis* (ouvre la liste des produits avec photo et prix).
  2. *Vers un Rayon / Catégorie* (liste les catégories de la boutique).
  3. *Vers une Section de la page* (liste les sections présentes sur l'accueil et génère le lien `#ancre` automatiquement).
  4. *Vers WhatsApp* (génère automatiquement le lien `https://wa.me/...` avec message pré-rempli).
  5. *Lien externe libre*.
- **`SmartLinkProductMultiPicker.tsx`** : Permet de cocher visuellement plusieurs produits du catalogue pour les associer à une collection, une bannière ou un rayon.
- **`AlignmentMatrix3x3.tsx`** : Grille visuelle de 9 points (`Haut-Gauche`, `Haut-Centre`, `Haut-Droite`, `Milieu-Gauche`, `Centre`, etc.) permettant de positionner un texte ou le point focal d'une photo en un seul clic.
- **`VisualLayoutPicker.tsx` & `visualLayoutSvgIcons.tsx`** : Affiche des boutons illustrés par des icônes SVG schématiques plutôt que du texte technique pour choisir une disposition de grille ou de cartes.
- **`ProductCardStyleController.tsx`** : Panneau unifié permettant de personnaliser l'apparence des cartes produits (ratio de la photo `1:1`, `4:5`, `16:9`, affichage du bouton d'ajout rapide, style des coins et de l'ombre des vignettes).
- **`StepWizardControls.tsx`** : Fournit la barre d'étapes numérotées (`StepWizardBar`) et la barre de navigation inférieure (`StepWizardFooter` avec boutons `<- Précédent` et `Enregistrer & Étape suivante ->`) utilisées dans tous les onglets de l'inspecteur.

---

## 10. Sécurité, Anti-XSS, Audit Qualité WCAG AA & Vérifications Pré-Publication

Le Studio Vendeur intègre 4 niveaux de protection automatiques :

### 10.1. Auditeur de Qualité & Contraste WCAG AA (`storeQualityAuditor.ts` & `PreviewAuditModal.tsx`)
Le fichier `src/pages/Seller/StoreBuilder/utils/storeQualityAuditor.ts` analyse la boutique en temps réel et calcule un **Score de Qualité sur 100** :
- **Calcul mathématique du contraste des couleurs (`getContrastRatio`)** : Pour chaque section et pour le thème global, l'auditeur calcule le ratio de luminance WCAG 2.1 entre la couleur du texte et la couleur du fond. Si le vendeur choisit par erreur un texte gris clair sur un fond blanc (ratio `< 4.5:1`), l'auditeur le détecte immédiatement et affiche une alerte précise dans `PreviewAuditModal.tsx` !
- **Cohérence E-Commerce** : Vérifie la présence d'un appel à l'action (CTA) dans la bannière principale, la présence d'au moins une section produit visible et la présence d'éléments de confiance (livraison, avis ou FAQ).

### 10.2. Garde-Fou de Publication (`publishReadinessChecks.ts`)
Lorsque le vendeur clique sur **« Mettre à jour » (Publier)**, `evaluatePublishReadiness` dans `src/pages/Seller/StoreBuilder/utils/publishReadinessChecks.ts` inspecte le brouillon :
- S'il détecte une **erreur bloquante** (ex: toutes les sections ont été masquées ou supprimées, ce qui rendrait la boutique publique totalement vide), il bloque la publication et explique au vendeur ce qu'il doit activer.
- S'il détecte des **avertissements non-bloquants** (ex: une section visible n'a pas de titre ou une bannière utilise encore une image par défaut), il les liste dans la fenêtre de confirmation (`StudioDirectPublishModal.tsx`) tout en laissant le vendeur libre de publier.

### 10.3. Sanitisation Anti-XSS Frontend & Backend
- **Validation des URL de navigation (`safeNavigationHref.ts`)** : Tout lien configuré sur un bouton de bannière, de carrousel ou de menu passe par `sanitizeNavigationHref()`. Tout protocole exécutable (`javascript:`, `data:`, `vbscript:`) est immédiatement neutralisé et remplacé par `#products`.
- **Sanitisation des Classes CSS & Ancres (`responsiveInheritanceHelper.ts`)** : `sanitizeControlledCssClasses` et `sanitizeAnchorId` suppriment tout caractère non alphanumérique dangereux (`<`, `>`, `"`, `'`, `(`, `)`, `;`, `{`, `}`).
- **Nettoyage Profond Serveur (`studioCyberSecurity.ts`)** : Côté Express, `SellerStudioController.ts` passe chaque payload JSON dans `sanitizeStudioPayloadDeep` et vérifie les URL médias avec `isSafeStudioUrl` avant d'écrire dans Firestore.

---

## 11. Arborescence Complète & Dictionnaire de Tous les Fichiers du Studio

Voici la carte exacte des **165 fichiers** qui composent le Studio Vendeur et le Moteur Storefront dans le code source :

```text
src/
├── pages/Seller/
│   ├── StoreBuilder.tsx                                      # Routeur d'accès selon le statut d'abonnement du vendeur
│   └── StoreBuilder/
│       ├── StoreBuilderActive.tsx                            # Conteneur actif : monte StudioMediaContext + StudioWorkspace
│       ├── StoreBuilderLocked.tsx                            # Écran d'invitation à l'abonnement Boutique Pro
│       ├── StoreBuilderPending.tsx                           # Écran de demande d'abonnement initialisée
│       ├── StoreBuilderPaymentRequested.tsx                  # Formulaire d'envoi du reçu de paiement (CCP/BaridiMob)
│       ├── StoreBuilderVerificationPending.tsx               # Écran d'attente de validation du paiement par l'admin
│       ├── StudioWorkspace.tsx                               # Chef d'orchestre UI du Studio (assemble TopBar, 3 colonnes, modales)
│       ├── studio-tokens.css                                 # Variables CSS de design de l'interface du Studio
│       │
│       ├── store/                                            # ÉTAT UI INSTANTANÉ (ZUSTAND)
│       │   ├── studioStore.types.ts                          # Types TypeScript du store Zustand
│       │   └── useStudioStore.ts                             # Store Zustand (sélection, viewport, zoom, onglets, mode guidé)
│       │
│       ├── hooks/                                            # LOGIQUE MÉTIER, PERSISTANCE & SYNCHRONISATION
│       │   ├── useSellerStudio.ts                            # Orchestrateur principal (chargement API, sections, thème, publication)
│       │   ├── useStudioSaveManager.ts                       # Auto-save débouncé (1.5s), backup local (0.6s) & gestion des conflits 409
│       │   ├── useStudioUndoRedo.ts                          # Historique Annuler/Rétablir (Ctrl+Z / Ctrl+Y) dans sessionStorage
│       │   ├── studioBackupStorage.ts                        # Sauvegarde et récupération anti-crash dans localStorage
│       │   ├── studioCatalogLoader.ts                        # Chargement et filtrage des produits réels du vendeur
│       │   ├── studioSectionMutations.ts                     # Fonctions pures d'ajout, clonage, tri et suppression de sections
│       │   ├── useStudioGuidedNavigation.ts                  # Logique du parcours guidé en 4 étapes de la barre latérale
│       │   ├── useSectionStepProgress.ts                     # Logique de progression étape par étape à l'intérieur des onglets
│       │   ├── useStudioMediaManager.ts                      # Gestion de l'upload, suppression et remplacement global des médias
│       │   ├── useStudioWorkspaceEvents.ts                   # Écouteurs d'événements globaux et raccourcis clavier du Studio
│       │   └── useCanvasPreviewEvents.ts                     # Communication temps réel entre l'inspecteur et le canevas central
│       │
│       ├── constants/                                        # CATALOGUES, THÈMES & PRÉRÉGLAGES (ZÉRO CODE DUR DANS LES VUES)
│       │   ├── sectionCatalog.ts                             # Définition des 16 types de sections et de leurs réglages par défaut
│       │   ├── heroBannerModels.ts                           # Définition et normalisation des 5 modèles de bannières principales
│       │   ├── artisticStudioPresets.ts                      # Point d'entrée des 14 Thèmes Signatures Modernes
│       │   ├── artisticModernPresetsPart1.ts                 # Thèmes signatures modernes (Partie 1)
│       │   ├── artisticModernPresetsPart2.ts                 # Thèmes signatures modernes (Partie 2)
│       │   ├── artisticAtmosphereOptions.ts                  # Options de textures, halos lumineux et cadres artistiques
│       │   ├── fiveActsLayoutPreset.ts                       # Générateur automatique d'une page d'accueil complète en 5 actes
│       │   ├── carouselPresets.ts                            # Modèles de campagnes pour le carrousel promotionnel
│       │   ├── categoryPresets.ts                            # Point d'entrée des modèles de présentation des rayons/catégories
│       │   ├── categoryPresetsPart1.ts                       # Modèles de rayons (Partie 1)
│       │   ├── categoryPresetsPart2.ts                       # Modèles de rayons (Partie 2)
│       │   ├── categoryPresetTypes.ts                        # Types TypeScript des modèles de catégories
│       │   ├── categoryCanvaOptions.ts                       # Options visuelles de style des cartes catégories
│       │   ├── sectorCoherenceData.ts                        # Recommandations visuelles par secteur d'activité
│       │   ├── sectorCoherenceDefaults.ts                    # Valeurs par défaut par secteur d'activité
│       │   └── studioThemeDefaults.ts                        # Palette et typographie par défaut du Design System
│       │
│       ├── utils/                                            # AUDIT QUALITÉ, SÉCURITÉ & VALIDATION
│       │   ├── storeQualityAuditor.ts                        # Calculateur de contraste WCAG AA et score qualité /100
│       │   ├── publishReadinessChecks.ts                     # Vérificateur pré-publication (erreurs bloquantes vs alertes)
│       │   ├── studioConfigSanitizers.ts                     # Nettoyage des slugs URL, noms de boutique et codes couleurs HEX
│       │   ├── studioMediaHandler.ts                         # Traitement et préparation des fichiers médias avant upload
│       │   ├── studioMediaValidation.ts                      # Contrôle de sécurité MIME et taille des fichiers image/vidéo
│       │   └── studioMediaUsage.ts                           # Détecteur des sections utilisant une image donnée
│       │
│       ├── context/
│       │   └── StudioMediaContext.tsx                        # Contexte React partageant la médiathèque avec tous les sélecteurs d'image
│       │
│       └── components/
│           ├── LiveCanvasPreview.tsx                         # Conteneur interactif du canevas central multi-appareils
│           ├── AddSectionModal.tsx                           # Modale de sélection et d'ajout des 16 types de sections
│           ├── StudioSubscriptionModal.tsx                   # Modale de souscription à l'abonnement Boutique
│           ├── StudioMobileTabNav.tsx                        # Navigation tactile par onglets sur petit écran
│           │
│           ├── studio/                                       # STRUCTURE GÉNÉRALE & COLONNE GAUCHE
│           │   ├── studio.types.ts                           # Types des 11 modes de navigation (StudioNavMode)
│           │   ├── StudioColumnsLayout.tsx                   # Disposition 3 colonnes (Gauche / Centre / Droite)
│           │   ├── StudioTopBar.tsx                          # Barre supérieure (Retour, Undo/Redo, Appareils)
│           │   ├── StudioTopBarRightActions.tsx              # Actions droites de la TopBar (Recherche, Historique, Save, Publier)
│           │   ├── StudioSidebar.tsx                         # Colonne gauche : bascule Mode Guidé (4 étapes) / Accès Libre (11 piliers)
│           │   ├── studioSidebarSteps.ts                     # Configuration des 4 étapes du parcours guidé et des 11 piliers
│           │   ├── SectionTreePanel.tsx                      # Liste verticale des sections de la page avec Drag & Drop
│           │   ├── SectionCard.tsx                           # Carte d'une section dans l'arbre (visibilité, duplication, suppression)
│           │   ├── SectionSubBlocksTree.tsx                  # Arborescence dépliable des sous-éléments d'une section
│           │   ├── SectionStaticSubBlocks.tsx                # Raccourcis vers les sous-blocs fixes d'une section
│           │   ├── DeleteSectionModal.tsx                    # Fenêtre de confirmation avant suppression d'une section
│           │   ├── PropertiesInspector.tsx                   # Routeur de la colonne droite (affiche l'inspecteur du pilier ou de la section)
│           │   ├── StudioPreview.tsx                         # Moteur d'affichage de la boutique complète dans le canevas
│           │   ├── StudioRecoveryAndConflictBar.tsx          # Bannière d'alerte en cas de récupération crash local ou conflit HTTP 409
│           │   ├── StudioCommandPalette.tsx                  # Recherche rapide au clavier (Ctrl+K)
│           │   ├── MobileStudioHeader.tsx                    # En-tête compact du Studio sur smartphone
│           │   ├── MobileStudioBar.tsx                       # Barre d'onglets (Aperçu / Structure / Réglages) sur smartphone
│           │   ├── MobileGuidedJourneyBar.tsx                # Barre de progression du parcours guidé sur smartphone
│           │   ├── MobileStudioNavigation.tsx                # Navigation mobile entre les piliers
│           │   └── StudioMobileMenu.tsx                      # Tiroir de menu mobile complet
│           │
│           ├── topbar/                                       # MODALES DE PUBLICATION & D'HISTORIQUE
│           │   ├── StudioDirectPublishModal.tsx              # Modale de confirmation de mise en ligne avec rapport de qualité
│           │   └── StudioHistoryModal.tsx                    # Modale d'historique des versions publiées et restauration (Rollback)
│           │
│           ├── preview/                                      # OUTILS INTERACTIFS DU CANEVAS CENTRAL
│           │   ├── CanvasPageSwitcherBar.tsx                 # Sélecteur de page active sur le canevas (Accueil, Catalogue, Pages custom)
│           │   ├── PreviewControlToolbar.tsx                 # Barre de zoom, grille, audit qualité et QR code mobile
│           │   ├── CanvasGridOverlay.tsx                     # Grille visuelle de repères d'alignement sur le canevas
│           │   ├── CanvasSectionFloatingDock.tsx             # Barre d'actions flottante au-dessus de la section sélectionnée
│           │   ├── InteractiveCartSimulator.tsx              # Simulateur de panier et de commande COD en direct dans le Studio
│           │   ├── PreviewAuditModal.tsx                     # Rapport détaillé de l'audit qualité & contraste WCAG AA
│           │   └── PreviewQrModal.tsx                        # Générateur de QR Code pour prévisualiser la boutique sur téléphone
│           │
│           ├── identity/                                     # PILIER IDENTITÉ
│           │   ├── StoreIdentityEditor.tsx                   # Éditeur du nom, logo, bannière, wilaya et délais de préparation
│           │   ├── PaletteControls.tsx                       # Contrôles rapides de couleurs de marque
│           │   └── TypographySliders.tsx                     # Curseurs d'ajustement typographique
│           │
│           ├── context/                                      # LES PANNEAUX DES PILIERS GLOBAUX (COLONNE DROITE)
│           │   ├── ThemeInspectorPanel.tsx                   # Éditeur du Design System Global à 5 onglets (Thèmes, Templates, Couleurs, Typo, Vente)
│           │   ├── ThemeAtelierMaterialsTab.tsx              # Sous-onglet des 14 thèmes signatures et finitions de matière
│           │   ├── ThemeArchetypesTab.tsx                    # Sous-onglet des templates complets par secteur d'activité
│           │   ├── ThemeColorPaletteTab.tsx                  # Sous-onglet d'édition des couleurs HEX du thème global
│           │   ├── ThemeTypographyTab.tsx                    # Sous-onglet de choix des polices de titres et de textes
│           │   ├── ThemeEcommerceWidgetsTab.tsx              # Sous-onglet des widgets de conversion e-commerce
│           │   ├── themeInspectorDefaults.ts                 # Utilitaires d'harmonisation et de nettoyage des surcharges de couleurs locales
│           │   ├── themeArchetypes.ts                        # Catalogue des architectures de boutiques par secteur
│           │   ├── themeArchetypesPart1.ts                   # Architectures de boutiques (Partie 1)
│           │   ├── themeArchetypesPart2.ts                   # Architectures de boutiques (Partie 2)
│           │   ├── extraThemeArchetypes.ts                   # Architectures additionnelles
│           │   ├── archetypeFactory.ts                       # Générateur de sections pré-remplies pour chaque archétype
│           │   ├── ArtisticPresetsList.tsx                   # Grille de sélection visuelle des 14 thèmes signatures
│           │   ├── FrameShapeSelectorGrid.tsx                # Sélecteur de forme des cadres photo (arche, organique, droit...)
│           │   ├── SectorPresetCategoriesBar.tsx             # Barre de filtrage des thèmes par secteur métier
│           │   ├── HeaderNavigationInspectorPanel.tsx        # Pilier En-tête : configuration du menu et de la barre d'annonce
│           │   ├── HeaderAnnouncementAndLayoutForm.tsx       # Formulaire du bandeau d'annonce et de la disposition de la navbar
│           │   ├── PagesInspectorPanel.tsx                   # Pilier Pages : gestion des 8 pages système et des pages personnalisées
│           │   ├── PageEditorDrawer.tsx                      # Éditeur de création/modification d'une page personnalisée (/p/slug)
│           │   ├── CatalogInspectorPanel.tsx                 # Pilier Catalogue : gestion des produits vedettes, rayons et design catalogue
│           │   ├── CatalogProductsSubPanel.tsx               # Sous-onglet d'épinglage des produits dans les sections
│           │   ├── CatalogCategoriesSubPanel.tsx             # Sous-onglet de synchronisation des catégories de produits
│           │   ├── CollectionPageCustomizer.tsx              # Sous-onglet de personnalisation de la page collection/catalogue
│           │   ├── MediaInspectorPanel.tsx                   # Pilier Médias : médiathèque centralisée avec dossiers et upload
│           │   ├── MediaCard.tsx                             # Vignette d'un fichier média avec compteur d'utilisation
│           │   ├── MediaSelectedInspector.tsx                # Inspecteur d'un média permettant son remplacement global dans toute la boutique
│           │   ├── StoreSettingsInspectorPanel.tsx           # Pilier Paramètres : Général, SEO, Livraison 69 Wilayas, COD et Pixels
│           │   ├── StoreSettingsCommerceAndStatusTabs.tsx    # Sous-onglets des tarifs de livraison COD, pixels pub et statut boutique
│           │   ├── OrdersInspectorPanel.tsx                  # Pilier Commandes : vue rapide des commandes reçues
│           │   └── SetupGuideInspectorPanel.tsx              # Pilier Check-list : guide interactif de préparation au lancement
│           │
│           └── inspector/                                    # INSPECTEUR DE SECTION À 5 ONGLETS (COLONNE DROITE)
│               ├── SectionInspectorPanel.tsx                 # Conteneur des 5 onglets + latestSectionRef + synchronisation bidirectionnelle
│               ├── inspectorSectionLabels.ts                 # Dictionnaire des noms simples en français des sections et onglets
│               ├── SectionContentTab.tsx                     # Onglet 1 : Contenu (route vers l'éditeur spécialisé de la section)
│               ├── SectionStyleTab.tsx                       # Onglet 2 : Style en 4 étapes (Couleurs, Bords, Aspect, Bouton)
│               ├── SectionLayoutTab.tsx                      # Onglet 3 : Disposition (Largeur, Espacements, Colonnes, Alignement)
│               ├── SectionResponsiveTab.tsx                  # Onglet 4 : Appareils (Ordinateur, Tablette, Mobile & Masquage)
│               ├── SectionAdvancedTab.tsx                    # Onglet 5 : Avancé (Ancre #id, Animation, Programmation dates, CSS, ARIA)
│               │
│               ├── hero/                                     # ÉDITEURS SPÉCIALISÉS DE LA BANNIÈRE PRINCIPALE (4 ÉTAPES)
│               │   ├── HeroStep1ShapePanel.tsx               # Étape 1 : Choix du modèle, Hauteur, Alignement, Coins arrondis & Ombre
│               │   ├── HeroModelGridAndDeviceBar.tsx         # Grille des 5 modèles de bannières et barre de sélection d'appareil
│               │   ├── HeroModelWireframes.tsx               # Illustrations SVG schématiques des 5 modèles de bannières
│               │   ├── HeroModelSpecificConfigPanel.tsx      # Réglages propres au modèle choisi (inversion gauche/droite, forme arche...)
│               │   ├── HeroPhotoAndCtaStepPanels.tsx         # Étape 2 (Photos, Point focal, Assombrissement) & Étape 3 (Textes, Carte de fond)
│               │   ├── HeroCtaStep4Panel.tsx                 # Étape 4 : Boutons d'action & Couleurs de la bannière
│               │   ├── HeroCtaButtonControls.tsx             # Contrôles du texte et du lien intelligent des 2 boutons de bannière
│               │   └── HeroColorElementPickers.tsx           # Sélecteurs de couleurs personnalisées élément par élément pour la bannière
│               │
│               ├── carousel/                                 # ÉDITEURS SPÉCIALISÉS DU CARROUSEL PROMOTIONNEL
│               │   ├── CarouselDesignAndPresetTab.tsx        # Réglages de design et de défilement du carrousel
│               │   ├── CarouselCampaignPresetsView.tsx       # Galerie de campagnes promotionnelles prêtes à l'emploi
│               │   └── PromoActiveSlideForm.tsx              # Formulaire d'édition d'une slide individuelle (image, titre, bouton)
│               │
│               ├── category/                                 # ÉDITEURS SPÉCIALISÉS DES CATÉGORIES / RAYONS
│               │   ├── CategoryPresetSelector.tsx            # Sélecteur d'architecture visuelle des rayons (Bento, Stories, Bulles...)
│               │   ├── CategoryDeviceSelectorBar.tsx         # Sélecteur d'aperçu par appareil pour les rayons
│               │   ├── CategoryItemListManager.tsx           # Gestionnaire de la liste des rayons affichés
│               │   ├── CategoryItemCard.tsx                  # Carte d'édition d'un rayon (nom, photo, sous-titre)
│               │   ├── CategoryProductAssigner.tsx           # Assignation directe des produits du catalogue à un rayon
│               │   ├── CategoryCanvaStyleControls.tsx        # Réglages de forme, taille et typographie des cartes rayons
│               │   └── CategoryOverlayAndFinishControls.tsx  # Réglages du voile d'assombrissement et des finitions des rayons
│               │
│               ├── content/                                  # ÉDITEURS DE CONTENU DES 16 SECTIONS
│               │   ├── HeroContentEditor.tsx                 # Chef d'orchestre en 4 étapes de l'onglet Contenu des bannières
│               │   ├── CategoryContentEditor.tsx             # Chef d'orchestre de l'onglet Contenu des catégories vedettes
│               │   ├── KineticMarqueeContentEditor.tsx       # Éditeur du bandeau défilant (messages, vitesse, icône séparatrice)
│               │   ├── marqueePresetsData.ts                 # Messages d'annonces prêts à l'emploi pour le bandeau défilant
│               │   ├── ProductSelectionEditor.tsx            # Éditeur des sections produits (mode auto vs manuel, style des cartes)
│               │   ├── ProductPickerSubTab.tsx               # Sélecteur visuel avec recherche pour cocher les produits à afficher
│               │   ├── ListContentEditor.tsx                 # Éditeur pour carrousels, collections sélectionnées et FAQ
│               │   ├── PromoSlidesListEditor.tsx             # Gestionnaire de la liste des slides du carrousel
│               │   ├── CuratedCollectionsStepPanel.tsx       # Éditeur étape par étape des collections thématiques
│               │   ├── FaqListStepPanel.tsx                  # Éditeur de questions/réponses de l'accordéon FAQ
│               │   ├── InfoContentEditor.tsx                 # Éditeur pour Histoire, Avis, Livraison, Retours et Contact
│               │   ├── ContactFooterContentEditor.tsx        # Formulaire dédié aux coordonnées, téléphone, WhatsApp et réseaux sociaux
│               │   ├── ShowcaseVideoEditor.tsx               # Éditeur de la section Vidéo de présentation
│               │   ├── CountdownCardEditor.tsx               # Éditeur du compte à rebours promotionnel
│               │   ├── CountdownPreviewStylesGrid.tsx        # Sélecteur de style visuel pour le compte à rebours
│               │   ├── countdownStyles.ts                    # Configurations esthétiques des comptes à rebours
│               │   ├── StudioImagePicker.tsx                 # Composant universel de choix d'image (Upload, Médiathèque, Stock)
│               │   └── studioStockPhotos.ts                  # Banque d'images haute définition classées par métier
│               │
│               └── controls/                                 # BRIQUES DE CONTRÔLE VISUEL RÉUTILISABLES
│                   ├── StepWizardControls.tsx                # Barre d'étapes numérotées et bouton "Enregistrer & Étape suivante"
│                   ├── SectionVisualEffectsSubPanel.tsx      # Contrôles des coins arrondis, ombres (dont Lumineuse/Glow), filtres photo et boutons
│                   ├── ColorSchemePicker.tsx                 # Sélecteur d'ambiance colorée de section
│                   ├── SectionElementColorMatrix.tsx         # Matrice de sélection de couleurs zone par zone
│                   ├── sectionColorSlotsConfig.ts            # Définition des zones colorables selon le type de section
│                   ├── SectionCornerColorsSubBox.tsx         # Contrôle des couleurs d'angles décoratifs
│                   ├── SectionMaterialSubPanel.tsx           # Sélecteur de matière et texture de surface
│                   ├── SectionMediaAndButtonSubPanel.tsx     # Contrôles rapides de média et bouton
│                   ├── EditorialTypographyControlBox.tsx     # Réglages d'interlettrage, interlignage et soulignement artistique
│                   ├── ProductCardStyleController.tsx        # Contrôleur d'apparence des cartes produits
│                   ├── SmartLinkPicker.tsx                   # Sélecteur intelligent de lien (Produit, Rayon, Section, WhatsApp, URL)
│                   ├── SmartLinkProductMultiPicker.tsx       # Sélecteur multiple de produits
│                   ├── AlignmentMatrix3x3.tsx                # Matrice 3x3 de positionnement spatial
│                   ├── VisualLayoutPicker.tsx                # Sélecteur visuel de disposition en grille
│                   ├── visualLayoutSvgIcons.tsx              # Icônes SVG des dispositions de grille
│                   ├── CategorySmartSyncBar.tsx              # Barre de synchronisation automatique des catégories avec le catalogue
│                   └── AlgeriaEcommercePresets.tsx           # Préréglages de réassurance e-commerce (Livraison 69 wilayas, Paiement COD)
│
└── components/Store/                                         # MOTEUR DE RENDU PUBLIC & CANEVAS TEMPS RÉEL
    ├── StoreBoutiqueNavbar.tsx                               # Barre de navigation principale de la boutique
    ├── StoreCustomHeaderBar.tsx                              # Bandeau d'annonce supérieur et en-tête personnalisé
    ├── StoreProfileHeader.tsx                                # En-tête de profil vendeur
    ├── StoreCollectionPageView.tsx                           # Vue complète d'une page Collection / Catalogue
    ├── StoreAboutView.tsx                                    # Vue de la page "À propos de la boutique"
    ├── StoreProductsFilter.tsx                               # Barre de recherche, filtres par catégorie et tri des produits
    ├── StoreTrustBadges.tsx                                  # Badges de confiance et garanties
    ├── StoreEngagementsCard.tsx                              # Carte des engagements de service du vendeur
    ├── StoreVipLockGate.tsx                                  # Écran d'accès protégé par mot de passe (Mode VIP)
    ├── StoreProfileModals.tsx                                # Modales d'information de la boutique
    ├── StoreProfileStates.tsx                                # États de chargement et d'erreur de la vitrine
    ├── ArtisticAtmosphereLayer.tsx                           # Couche de rendu du grain photo et des halos lumineux d'atmosphère
    ├── ArtisticFrameWrapper.tsx                              # Encadrement géométrique des photos (arche, organique...)
    ├── EditorialHeading.tsx                                  # Moteur de rendu des titres (interprète *italique* et {souligné})
    ├── RotatingSealBadge.tsx                                 # Sceau circulaire rotatif de garantie/signature
    ├── useStoreFontLoader.ts                                 # Chargeur dynamique des polices Google Fonts du thème actif
    │
    └── sections/                                             # MOTEURS DE RENDU DES 16 SECTIONS
        ├── StoreSectionRenderer.tsx                          # Pipeline maître : visibilité, styles conteneur, atmosphère et routage
        ├── sectionStyleHelper.tsx                            # Calculateur des classes CSS, couleurs, arrondis, ombres glow et marges
        ├── responsiveInheritanceHelper.ts                    # Résolution en cascade Desktop -> Tablet -> Mobile + sanitisation CSS/Ancres
        ├── safeNavigationHref.ts                             # Pare-feu Anti-XSS sur toutes les URL de boutons et liens
        ├── themeColorUtils.ts                                # Utilitaires de calcul de contraste et de conversion HEX/RGBA
        ├── SectionShapeDivider.tsx                           # Générateur des séparateurs SVG en bas de section (vague, courbe, biais)
        ├── CanvasSectionFloatingDock.tsx                     # Dock flottant d'édition rapide sur le canevas
        ├── CanvasInlineText.tsx                              # Composant d'édition de texte directe par double-clic sur le canevas
        ├── HeroCanvasSubToolbar.tsx                          # Barre d'outils flottante sur le canevas dédiée aux bannières
        │
        ├── SectionHeroBanner.tsx                             # Routeur principal des bannières vers les 5 modèles architecturaux
        ├── hero/
        │   ├── heroVisualEffectsHelper.ts                    # Calculateur unifié des profils responsive, couleurs, coins arrondis et ombres glow
        │   ├── heroResponsiveHelper.ts                       # Utilitaires de mise à l'échelle typographique par appareil
        │   ├── HeroMinimalTextAndGuides.tsx                  # Composant de rendu du badge, titre, sous-titre et des 2 boutons CTA
        │   ├── HeroSwapImageFrame.tsx                        # Cadre photo interactif avec point focal et échange d'image
        │   ├── HeroFullBleed.tsx                             # Modèle 1 : Image Pleine Largeur (délègue à CinematicBannerRenderer)
        │   ├── HeroSplit.tsx                                 # Modèle 2 : Moitié Texte / Moitié Image
        │   ├── HeroArch.tsx                                  # Modèle 3 : Texte + Image découpée en Arche
        │   ├── HeroGallery.tsx                               # Modèle 4 : Mosaïque de 3 Images
        │   └── HeroDiptych.tsx                               # Modèle 5 : Duo de 2 Images Côte à Côte
        │
        ├── CinematicBanner/
        │   ├── CinematicBannerRenderer.tsx                   # Moteur de rendu haute précision du modèle Image Pleine Largeur (cinema-full)
        │   ├── cinematicBanner.helpers.ts                    # Calculs de positionnement et de contraste du modèle plein écran
        │   ├── cinematicBanner.defaults.ts                   # Valeurs de repli sécurisées du modèle plein écran
        │   ├── cinematicBanner.types.ts                      # Interfaces TypeScript de la bannière plein écran
        │   └── cinematicBanner.utils.ts                      # Utilitaires de dégradés et d'opacité de voile
        │
        ├── SectionPromoCarousel.tsx                          # Moteur de rendu du Carrousel Promotionnel interactif
        ├── PromoCarouselSlideRenderer.tsx                    # Rendu individuel d'une slide de carrousel
        ├── KineticMarqueeSection.tsx                         # Moteur de rendu du Bandeau Défilant continu
        ├── LiveCountdownBanner.tsx                           # Moteur de rendu du compte à rebours temps réel
        │
        ├── SectionFeaturedCategories.tsx                     # Point d'entrée du rendu des Catégories Vedettes et Collections
        ├── FeaturedCategoriesRenderer.tsx                    # Routeur des différents styles visuels de grilles de catégories
        ├── category/
        │   ├── CategoryBentoGrid.tsx                         # Rendu des catégories en grille Bento asymétrique
        │   ├── CategoryBubblesRow.tsx                        # Rendu des catégories en médaillons circulaires
        │   ├── CategoryEditorialModels.tsx                   # Rendu des catégories en cartes magazine éditoriales
        │   ├── CategoryMesh3DRow.tsx                         # Rendu des catégories avec effet de profondeur
        │   ├── CategoryShopifyBento.tsx                      # Rendu Bento e-commerce moderne
        │   ├── CategoryShopifyCards.tsx                      # Rendu en cartes verticales encadrées
        │   ├── CategoryShopifyPills.tsx                      # Rendu en pilules horizontales rapides
        │   ├── CategoryShopifyStories.tsx                    # Rendu en format Stories mobiles
        │   ├── CategoryCanvasQuickBar.tsx                    # Barre flottante sur le canevas pour changer le style des rayons en direct
        │   ├── categoryImageHelper.ts                        # Résolution automatique de la photo d'un rayon à partir de ses produits
        │   └── categoryResponsiveHelper.ts                   # Adaptation du nombre de colonnes de rayons sur mobile/tablette
        │
        ├── SectionProductFeeds.tsx                           # Moteur de rendu des 4 sections produits (Vedettes, Nouveautés, Best-Sellers, Grille)
        ├── SectionProductItemCard.tsx                        # Carte produit individuelle avec badge stock, prix et bouton d'achat
        ├── ProductFeedEcommerceWidgets.tsx                   # Widgets de filtre, tri et compteur de produits dans les grilles
        ├── SectionContentAndTrust.tsx                        # Moteur de rendu de l'Histoire, Vidéo, Avis Vérifiés, Livraison, Retours et FAQ
        └── SectionTrustAndContact.tsx                        # Moteur de rendu du bloc Contact final (Téléphone, WhatsApp, Réseaux, Horaires)
```

---

## 10. Améliorations Expérience Vendeur & Manipulation Directe (Chantiers 1, 2, 3 & 4)

Cette section détaille les 4 évolutions majeures apportées pour offrir une expérience fluide, visuelle et sans friction aux vendeurs sur Mobile comme sur Ordinateur :

### 10.1 Chantier 1 — Écran Partagé en Direct sur Mobile (`Split-Screen Live Preview`)
* **Problème résolu :** Sur smartphone, le vendeur qui ouvrait l'onglet **Réglages** (`mobileColumn === "inspector"`) ne voyait plus sa boutique et devait appuyer sur *« Retour à l'aperçu »* après chaque changement de couleur ou d'arrondi.
* **Fonctionnement du code (`StudioColumnsLayout.tsx`, `LiveCanvasPreview.tsx`, `PropertiesInspector.tsx`) :**
  1. Lorsque le vendeur est dans l'onglet **Réglages** sur mobile, `isMobileSplitActive` active automatiquement un **mini-aperçu épinglé en haut de l'écran** (`38vh`, `min-h-[210px]`, `max-h-[310px]`) tandis que les réglages défilent librement dans la moitié inférieure.
  2. Le composant `LiveCanvasPreview` reçoit `isMobileSplitCompact={true}`, masque ses barres d'outils secondaires sur mobile pour maximiser la surface visible de la boutique, et centre automatiquement la vue (`scrollIntoView({ behavior: "smooth", block: "center" })`) sur la section en cours d'édition (`#studio-section-${selectedSectionId}`).
  3. Un bouton **`Masquer aperçu` / `Aperçu direct`** (`data-testid="mobile-toggle-split-preview-btn"`) dans l'en-tête de `PropertiesInspector.tsx` permet au vendeur de replier ou déplier ce mini-aperçu à tout moment, en complément du bouton **`Plein écran`** (`data-testid="mobile-return-to-canvas-btn"`).

### 10.2 Chantier 2 — Simplification Radicale de l'Inspecteur de Section (3 Onglets Unifiés sans Doublons)
* **Problème résolu :** L'ancien inspecteur divisait les réglages d'une section en 5 onglets séparés (`Contenu`, `Style`, `Disposition`, `Appareils`, `Avancé`) et répétait les réglages de coins arrondis et d'ombres à la fois dans `Contenu` et dans `Style`.
* **Fonctionnement du code (`SectionInspectorPanel.tsx`, `HeroStep1ShapePanel.tsx`, `CanvasSectionFloatingDock.tsx`) :**
  1. **Barre unifiée à 3 onglets (`data-testid="inspector-unified-3-tabs"`) :**
     * **`1. Contenu`** (`content`) : Médias, textes, produits, rayons et liens des boutons.
     * **`2. Design`** (`style` + `layout` fusionnés dans `data-testid="unified-design-tab-panel"`) : Modèle, couleurs, coins arrondis, ombres portées, espacement haut/bas (`paddingY`), marges latérales (`paddingX`) et disposition des colonnes réunis au même endroit.
     * **`3. Appareils`** (`responsive` + `advanced` fusionnés dans `data-testid="unified-options-tab-panel"`) : Adaptations Mobile / Tablette / Ordinateur et tiroir dépliable *« Options avancées (Programmation dates, Ancre #id, CSS) »*.
  2. **Élimination des doublons dans les bannières (`HeroStep1ShapePanel.tsx`) :** L'étape `1. Format` de l'onglet Contenu ne duplique plus les curseurs d'arrondis des 4 coins ni le sélecteur d'ombre ; elle affiche un résumé clair (*Arrondi · Ombre*) accompagné d'un bouton direct **`Ouvrir 2. Design →`** (`data-testid="hero-goto-design-tab-btn"`).

### 10.3 Chantier 3 — Manipulation Directe sur le Canevas Central (`In-Canvas Editing & Insertion + entre les sections`)
* **Problème résolu :** Pour insérer une section au milieu de la page, le vendeur devait passer par la colonne de gauche, ajouter la section tout en bas, puis la remonter manuellement. De plus, en mode Guidé, cliquer sur une photo ou un bouton du canevas ne débloquait pas immédiatement l'étape correspondante (Photo ou Bouton) dans l'inspecteur.
* **Fonctionnement du code :**
  1. **Bouton `+ Insérer une section ici` entre chaque bloc sur l'aperçu central (`CanvasSectionInsertBar.tsx`, `LiveCanvasPreview.tsx`, `SectionTreePanel.tsx`, `AddSectionModal.tsx`, `studioSectionMutations.ts`) :**
     * En mode édition (`!isInteractiveMode`), `LiveCanvasPreview.tsx` affiche entre chaque section une barre interactive **`+ Insérer une section ici`** (`data-testid="canvas-insert-section-btn-{idx}"`).
     * Au clic, un événement `studio:open-add-section-modal` est émis avec `{ insertAtIndex: idx + 1 }`.
     * `SectionTreePanel.tsx` intercepte `insertAtIndex` et ouvre `AddSectionModal.tsx` en affichant le badge **`Insertion en position #{insertAtIndex + 1}`** (`data-testid="add-section-insert-position-badge"`).
     * Lorsqu'une section ou un pack est choisi, `addSection(type, settings, title, insertAtIndex)` dans `studioSectionMutations.ts` insère la nouvelle section exactement à l'index demandé (`nextSections.splice(targetIdx, 0, newSection)`) et recalcule l'ordre (`order: idx`) de toutes les sections.
  2. **Clic direct sur les images et les boutons du canevas (`useStudioStore.ts`, `useSectionStepProgress.ts`, `HeroContentEditor.tsx`, `HeroCtaButtonControls.tsx`, `CategoryContentEditor.tsx`, `PromoSlidesListEditor.tsx`, `InfoContentEditor.tsx`) :**
     * La méthode `selectStep(step, forceUnlock = true)` dans `useSectionStepProgress.ts` et `setSectionActiveStep(key, step, forceUnlock)` dans `useStudioStore.ts` permettent désormais un déblocage instantané lorsqu'un sous-élément est cliqué directement sur l'aperçu central, même en mode Guidé.
     * **Clic sur une photo du canevas (`data-sub-element="background"`, `data-testid="hero-pure-photo"`, ou image de slide/histoire) :** Sélectionne la section, bascule automatiquement sur l'onglet **`1. Contenu`**, débloque et ouvre directement l'étape Photo (`HeroPhotoAndCtaStepPanels` / `StudioImagePicker` avec `data-testid="studio-image-picker-root"`).
     * **Clic sur un bouton du canevas (`data-testid="hero-single-cta-btn"`, `data-testid="hero-secondary-cta-btn"`, `data-testid="brand-story-cta"`, `data-testid="promo-slide-cta-{idx}"`) :** Sélectionne la section, débloque et ouvre immédiatement l'étape Texte & Bouton (`data-testid="hero-step-panel-4"`), met en surbrillance l'éditeur de bouton (`data-testid="hero-cta-editor-box"`, `data-cta-focused="true"`) et place le curseur directement dans le champ **`Texte sur le bouton`** (`data-testid="hero-cta-text-input"`).

### 10.4 Chantier 4 — Maquettes Visuelles Réalistes, Aperçu Couleurs en Direct & Vocabulaire Simplifié
* **Problème résolu :** Les miniatures des 5 modèles de bannières et des dispositions de rayons/produits n'affichaient que des traits gris abstraits difficiles à distinguer, les réglages de couleurs de bannière ne montraient pas d'aperçu combiné en direct dans l'inspecteur, et le sélecteur d'ambiance utilisait du jargon technique (*« Scheme 1..4 »*, *« Palettes Harmoniques (WCAG AA) »*).
* **Fonctionnement du code (`HeroModelWireframes.tsx`, `visualLayoutSvgIcons.tsx`, `HeroModelSpecificConfigPanel.tsx`, `HeroColorElementPickers.tsx`, `ColorSchemePicker.tsx`) :**
  1. **Maquettes SVG réalistes et colorées (`HeroModelWireframes.tsx` & `visualLayoutSvgIcons.tsx`) :**
     * Chaque modèle de bannière (`data-testid="hero-wireframe-{modelId}"`) et de grille de rayons/produits (`data-testid="layout-svg-{id}"`) affiche désormais une scène photo explicite (ciel bleu `#DBEAFE`, soleil ambré `#F59E0B`, collines `#60A5FA`), un fond éditorial net, des lignes de titre/sous-titre hiérarchisées et une pilule de bouton CTA distincte.
  2. **Aperçu en direct des couleurs de la bannière & inversion 1-clic (`HeroColorElementPickers.tsx` & `HeroModelSpecificConfigPanel.tsx`) :**
     * Les boutons **Harmonies rapides** (`data-testid="hero-palette-{id}"`) affichent une pastille triple montrant simultanément la couleur de fond, la barre de titre et le point du bouton.
     * Une carte **`Aperçu en direct des couleurs`** (`data-testid="hero-color-live-mini-preview"`) placée juste au-dessus des sélecteurs affiche en temps réel le fond de la bannière (y compris le dégradé 4 coins), le badge, le vrai titre de la bannière, le sous-titre et le bouton d'action, avec un bouton **`Inverser contraste`** (`data-testid="hero-invert-colors-btn"`) pour permuter fond et texte en un clic.
  3. **Combinaisons de couleurs en français simple (`ColorSchemePicker.tsx`) :**
     * Remplacement des termes techniques par des intitulés évidents : **`Combinaisons de couleurs prêtes à l'emploi`**, **`1 • Fond Clair`**, **`2 • Fond Doux`**, **`3 • Couleur Marque`** et **`4 • Fond Sombre`**, avec personnalisation complète du fond, du texte et du bouton dans **`Choisir mes propres couleurs`**.

### 10.5 Benchmark Shopify Online Store 2.0 & Refonte Visuelle Professionnelle (Style Polaris)
* **Problème résolu :** L'analyse comparative avec l'éditeur de thème **Shopify Online Store 2.0 (Polaris)** a mis en évidence 4 frictions visuelles majeures : une barre de navigation de pages (`Accueil | Catalogue | Rayons`) incrustée *à l'intérieur* du cadre de la boutique (cassant l'illusion d'une vraie vitrine), un fond de scène à points distrayant, des bordures de sélection noires épaisses avec un dock encombré de badges techniques (`S1`–`S4`), et l'absence de bascule œil directe au survol dans l'arborescence.
* **Fonctionnement du code (`studio-tokens.css`, `LiveCanvasPreview.tsx`, `PreviewControlToolbar.tsx`, `CanvasPageSwitcherBar.tsx`, `StoreSectionRenderer.tsx`, `CanvasSectionFloatingDock.tsx`, `SectionCard.tsx`, `SectionTreePanel.tsx`, `SectionInspectorPanel.tsx`) :**
  1. **Séparation stricte entre l'interface éditeur et la vitrine (`LiveCanvasPreview.tsx`, `PreviewControlToolbar.tsx`, `CanvasPageSwitcherBar.tsx`) :** Le sélecteur de page (`Accueil | Catalogue | Pages | Rayons`) est déplacé dans la barre supérieure du canevas (`data-testid="studio-canvas-chrome-bar"`), en dehors du cadre de la boutique (`.olmart-store-canvas-scope`), et le padding artificiel autour des sections plein écran est supprimé afin que les bannières bord à bord s'affichent comme en production.
  2. **Scène neutre Polaris & ombre réaliste (`studio-tokens.css`) :** Remplacement de la grille de points par un fond neutre `#F1F2F4` avec élévation `.studio-storefront-frame` et accent de focus bleu cobalt `#005BD3`.
  3. **Preview Inspector style Shopify (`StoreSectionRenderer.tsx`, `CanvasSectionFloatingDock.tsx`) :** Contour de sélection précis `ring-2 ring-[#005BD3]`, étiquette bleue `#005BD3`, actions fantômes épurées et libellés d'ambiance en français courant (`Clair`, `Doux`, `Marque`, `Sombre`, `Perso`).
  4. **Arborescence fluide & Inspecteur segmenté (`SectionCard.tsx`, `SectionTreePanel.tsx`, `SectionInspectorPanel.tsx`) :** Bouton œil (Masquer/Afficher) disponible immédiatement au survol dans la liste gauche, bouton bleu **`+ Ajouter une section`** (`data-testid="tree-bottom-add-section-btn"`) en bas de la liste des sections, et onglets `1. Contenu | 2. Design | 3. Appareils` présentés en contrôle segmenté Polaris.

