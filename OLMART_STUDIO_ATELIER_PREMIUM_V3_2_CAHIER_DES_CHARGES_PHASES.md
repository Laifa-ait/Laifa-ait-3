# OLMART STUDIO — ATELIER PREMIUM
## Cahier des charges maître V3.2 — Amélioration progressive du Studio existant

**Projet :** Olmart Marketplace — Studio Vendeur / Store Builder  
**Dépôt de référence :** https://github.com/Laifa-ait/Laifa-ait-3  
**Branche inspectée pendant la préparation :** `main`  
**Repère de code retrouvé par la recherche GitHub :** `6d8303f3be9f214d45e9494ae0b991072be96fe7` (à revalider au démarrage de chaque phase)  
**Date de rédaction :** 15 novembre 2026  
**Version du document :** 3.2  
**Nature :** cahier des charges d'exécution, de contrôle et de validation humaine  
**Périmètre :** évolution du Studio Vendeur existant, sans reconstruction générale

---

# 0. INSTRUCTION PRINCIPALE À L'IA DE DÉVELOPPEMENT

Tu interviens sur un produit existant : **Olmart Studio**. Tu n'es pas autorisé à repartir de zéro, à créer un nouveau constructeur de boutique indépendant, ni à remplacer toute l'architecture par une solution que tu préfères.

Ton objectif est de faire évoluer le Studio actuel vers un outil de création de boutiques de qualité professionnelle, accessible à un vendeur non spécialiste, mais suffisamment précis et puissant pour un utilisateur avancé.

Le travail doit être **progressif, vérifiable, réversible et piloté par le propriétaire du projet**. Tu dois travailler sur une seule phase à la fois. À la fin de chaque phase, tu dois remettre un rapport complet et t'arrêter. Tu ne peux pas commencer la phase suivante avant que le propriétaire ait explicitement donné son accord.

## 0.1 Règle de progression obligatoire

Le cycle de travail est le suivant :

1. Lire ce cahier des charges et identifier la phase demandée.
2. Inspecter le code réellement présent dans le dépôt au moment de l'intervention.
3. Établir l'état initial de cette phase : fichiers existants, fonctionnalités, dépendances, tests et risques.
4. Proposer un plan technique limité à cette phase.
5. Exécuter uniquement le périmètre autorisé.
6. Exécuter les tests pertinents et les vérifications possibles.
7. Comparer le résultat au comportement initial pour repérer toute régression.
8. Fournir un rapport de livraison avec fichiers modifiés, décisions, tests, limites et points à vérifier.
9. **S'arrêter et demander une validation explicite.**

Une réponse comme « continue », « passe à la phase suivante » ou une validation équivalente autorise la phase suivante. Une question, une demande de critique ou une demande de correction n'autorise pas automatiquement la poursuite du plan.

## 0.2 Ce que signifie « une phase terminée »

Une phase n'est pas terminée parce que le code compile ou parce qu'un écran paraît plus joli. Elle est terminée uniquement lorsque :

- les objectifs annoncés pour cette phase sont réalisés ou chaque élément non réalisé est clairement expliqué ;
- les comportements existants du périmètre sont préservés ou les changements de comportement ont été explicitement prévus ;
- les tests pertinents passent, ou les échecs connus sont documentés et reliés à leur cause ;
- les parcours Desktop, Tablette et Mobile concernés ont été vérifiés ;
- les erreurs, états vides, chargements, conflits et cas limites pertinents ont été traités ;
- aucun faux contenu, produit fictif, identifiant fictif ou succès simulé n'est utilisé pour masquer un manque ;
- le rapport final permet au propriétaire de décider s'il faut continuer, corriger ou revoir l'orientation.

## 0.3 Interdiction de faire semblant

Tu ne dois jamais dire : « c'est fait », « les fichiers ont été modifiés », « les tests passent » ou « le problème est corrigé » sans preuve correspondante.

Si tu n'as pas accès au dépôt, à un fichier, à une commande ou à un environnement de test, indique-le clairement. Ne prétends pas avoir exécuté une commande que tu n'as pas pu exécuter. Ne fabrique pas de sortie terminal, de capture, de résultat de test ou de commit.

Si le dépôt n'est pas accessible, arrête l'implémentation et fournis uniquement un diagnostic sur les éléments réellement disponibles. Ne remplace pas le code absent par une architecture imaginée.

---

# 1. CONTEXTE, OBJECTIF PRODUIT ET PRINCIPES DE CONCEPTION

## 1.1 Vision du Studio

Olmart Studio doit permettre à un vendeur de construire une vitrine de boutique cohérente, lisible et convaincante, sans devoir connaître le HTML, le CSS ou le développement web.

Le vendeur doit pouvoir :

- définir l'identité de sa boutique ;
- choisir une direction visuelle et l'adapter ;
- ajouter, organiser, masquer, dupliquer et supprimer des sections ;
- modifier le contenu et l'apparence de chaque section ;
- gérer les images et les autres médias ;
- sélectionner ses vrais produits et catégories ;
- voir les changements dans un aperçu proche du résultat public ;
- contrôler le rendu sur ordinateur, tablette et téléphone ;
- annuler et rétablir ses actions ;
- retrouver ses modifications après un incident raisonnablement récupérable ;
- contrôler les problèmes avant publication ;
- publier une version distincte du brouillon ;
- consulter l'historique et revenir à une version antérieure si cette fonction est prise en charge par le backend.

Le Studio ne doit pas être un panneau rempli de champs techniques. Il doit guider les décisions du vendeur avec des libellés simples, des aperçus fidèles, des valeurs de départ intelligentes et des avertissements compréhensibles.

## 1.2 Qualités attendues

### Qualité visuelle

Les boutiques créées doivent avoir une hiérarchie visuelle claire, une typographie maîtrisée, des espacements cohérents, des images bien cadrées, des boutons lisibles et une composition adaptée au secteur d'activité.

### Simplicité

Les actions essentielles doivent être faciles à trouver. Les options avancées ne doivent pas encombrer le parcours de base. Un vendeur doit comprendre ce qu'un réglage change avant de l'utiliser.

### Contrôle

Le vendeur garde le contrôle de ses choix. Les suggestions automatiques ne doivent jamais remplacer silencieusement son contenu ou ses réglages personnalisés.

### Fiabilité

Une modification ne doit pas disparaître sans avertissement. Une erreur de chargement du catalogue ne doit jamais être présentée comme un catalogue vide. Une erreur de sauvegarde ne doit jamais être présentée comme une sauvegarde réussie.

### Cohérence

Le même contenu de boutique doit produire un rendu cohérent dans le Studio, dans l'aperçu et dans la boutique publique. Les règles de rendu ne doivent pas être dupliquées de manière divergente.

### Progressivité

Le mode guidé doit aider un vendeur débutant à avancer sans lui exposer tout le système simultanément. Le mode expert doit conserver un accès direct aux outils, sans forcer l'utilisateur avancé à suivre un tutoriel.

---

# 2. BASE TECHNIQUE ET PÉRIMÈTRE RÉEL À RESPECTER

Cette section sert de point de départ vérifié pendant la préparation du document. Elle n'autorise pas l'IA à supposer que le dépôt restera identique. **Au début de chaque phase, revalide la branche, le commit, les dépendances et les chemins.**

## 2.1 Racine du Studio retrouvée

Le chemin réel retrouvé dans le dépôt est :

```text
src/pages/Seller/StoreBuilder/
```

Ne pars pas du chemin `src/components/seller/store-builder/` ni d'un chemin issu d'un ancien rapport si le dépôt actuel ne le confirme pas.

Des fichiers importants retrouvés dans cette zone comprennent notamment :

```text
src/pages/Seller/StoreBuilder/
├── StudioWorkspace.tsx
├── hooks/
│   ├── useSellerStudio.ts
│   ├── useStudioSaveManager.ts
│   ├── useStudioUndoRedo.ts
│   ├── studioCatalogLoader.ts
│   ├── useStudioMediaManager.ts
│   ├── studioSectionMutations.ts
│   └── useStudioWorkspaceEvents.ts
├── store/
│   ├── useStudioStore.ts
│   └── studioStore.types.ts
├── constants/
│   ├── sectionCatalog.ts
│   ├── sectorCoherenceDefaults.ts
│   ├── heroBannerModels.ts
│   └── artisticStudioPresets.ts
├── components/
│   ├── studio/
│   │   ├── StudioColumnsLayout.tsx
│   │   ├── StudioTopBar.tsx
│   │   ├── StudioSidebar.tsx
│   │   ├── SectionTreePanel.tsx
│   │   ├── SectionCard.tsx
│   │   ├── PropertiesInspector.tsx
│   │   ├── StudioPreview.tsx
│   │   └── composants de navigation mobile et d'actions
│   ├── inspector/
│   │   ├── SectionInspectorPanel.tsx
│   │   ├── SectionContentTab.tsx
│   │   ├── SectionStyleTab.tsx
│   │   ├── SectionLayoutTab.tsx
│   │   ├── SectionResponsiveTab.tsx
│   │   ├── SectionAdvancedTab.tsx
│   │   └── content/
│   ├── context/
│   │   ├── MediaInspectorPanel.tsx
│   │   ├── ThemeInspectorPanel.tsx
│   │   ├── CatalogInspectorPanel.tsx
│   │   └── autres panneaux contextuels
│   └── preview/
└── utils/
    ├── storeQualityAuditor.ts
    └── publishReadinessChecks.ts
```

Cette arborescence est indicative : l'IA doit vérifier chaque fichier avant de l'utiliser. Certains noms peuvent avoir été déplacés ou renommés après la rédaction du présent document.

## 2.2 Architecture technique constatée dans `package.json`

Les éléments suivants ont été retrouvés dans le `package.json` du dépôt au moment de la préparation :

- React 19 et React DOM 19 ;
- TypeScript ;
- Vite pour la construction du client ;
- Express côté serveur ;
- Firebase et Firebase Admin ;
- Zustand 5 pour le store du Studio ;
- Vitest pour les tests unitaires et d'intégration ;
- Playwright pour les tests de parcours ;
- Tailwind CSS v4 ;
- `react-router-dom` est présent dans les dépendances relevées.

Commandes disponibles relevées dans `package.json` :

```bash
npm run dev
npm run build
npm run test
npm run test:e2e
npm run typecheck
npm run typecheck:client
npm run typecheck:node
npm run lint
```

Ne remplace pas cette stack par Next.js, Drizzle, PostgreSQL, un autre routeur ou une autre gestion d'état sans décision explicite du propriétaire et sans justification technique documentée. Les informations de stack provenant d'anciens audits ne prévalent pas sur le `package.json` courant.

## 2.3 Données et types métier

Le type `CustomPageSectionType` retrouvé dans `src/domains/seller/customPage.types.ts` comprend 16 types :

```ts
export type CustomPageSectionType =
  | "hero_banner"
  | "promo_carousel"
  | "kinetic_marquee"
  | "featured_categories"
  | "curated_collections"
  | "new_arrivals"
  | "featured_products"
  | "best_sellers"
  | "product_grid"
  | "brand_story"
  | "showcase_video"
  | "verified_reviews"
  | "delivery_info"
  | "return_policy"
  | "faq_accordion"
  | "contact_footer";
```

Cette union est le repère de départ. Ne crée pas un catalogue parallèle de 15 sections ou une liste déconnectée des types réellement supportés.

Les modèles métier doivent rester ceux du dépôt : `CustomPageSection`, `CustomPageTheme`, `SellerStoreConfig`, `StoreLayoutVersion`, `StoreHistoryEntry`, `MediaGalleryItem` et les types produits réellement présents dans `src/domains/`.

Avant toute évolution de schéma, inspecte les usages dans le Studio, les renderers publics, les routes API, les services serveur, les validateurs et les données historiques.

## 2.4 Architecture de rendu public à préserver

Le fichier suivant a été retrouvé :

```text
src/components/Store/sections/StoreSectionRenderer.tsx
```

Le renderer de bannière publique a également été retrouvé ici :

```text
src/components/Store/sections/SectionHeroBanner.tsx
```

Le renderer Hero utilise cinq composants spécialisés :

```text
HeroFullBleed
HeroSplit
HeroArch
HeroGallery
HeroDiptych
```

La normalisation des réglages Hero est déjà portée par :

```text
src/components/Store/sections/hero/heroResponsiveHelper.ts
```

Une fonction existante s'appelle `normalizeHeroSettingsAdapter()`. **Tu dois la réutiliser et l'améliorer si nécessaire ; ne crée pas un second adaptateur concurrent.**

Ne déplace pas les renderers publics dans le dossier vendeur. Ne crée pas une seconde série de renderers pour l'aperçu du Studio si le renderer partagé peut être utilisé avec un mode éditable.

## 2.5 Fonctions Studio déjà retrouvées

Les éléments suivants existent déjà dans le dépôt consulté. Il faut les auditer, les consolider et les compléter plutôt que les recréer :

- `StudioWorkspace` comme orchestrateur de l'espace de travail ;
- `StudioColumnsLayout` pour l'organisation des panneaux ;
- `useStudioStore` et `studioStore.types.ts` pour l'état d'interface ;
- `useSellerStudio` pour la coordination des données, mutations, sauvegarde et publication ;
- `useStudioSaveManager` pour la sauvegarde du brouillon ;
- `useStudioUndoRedo` pour l'historique des actions ;
- `studioCatalogLoader.ts` pour le chargement du Studio et du catalogue ;
- `sectionCatalog.ts` pour les types de sections et leurs réglages de départ ;
- `SectionTreePanel` et `SectionCard` pour l'organisation des sections ;
- `SectionInspectorPanel` et ses onglets Content, Style, Layout, Responsive et Advanced ;
- `MediaInspectorPanel` pour les médias ;
- `ThemeInspectorPanel` et les presets de thème ;
- `storeQualityAuditor.ts` pour un rapport de qualité ;
- `publishReadinessChecks.ts` pour des contrôles de préparation à la publication ;
- `LiveCanvasPreview` et `StoreSectionRenderer` pour l'aperçu et le rendu ;
- un parcours guidé en 4 étapes et un mode expert.

## 2.6 Sauvegarde et historique : données de départ

Le `useStudioSaveManager.ts` examiné présente notamment :

- les statuts `idle`, `unsaved`, `saving`, `retrying`, `saved`, `offline`, `error`, `conflict` ;
- un délai de debounce par défaut de 1 500 ms ;
- jusqu'à 3 tentatives de reprise par défaut ;
- une sauvegarde locale de secours ;
- la détection d'une sauvegarde locale récupérable ;
- une révision serveur confirmée et une révision demandée ;
- une référence `isSavingRef` pour éviter des sauvegardes concurrentes.

Le `useStudioUndoRedo.ts` examiné présente notamment :

- une limite de 40 étapes d'historique ;
- une fenêtre de regroupement de modifications rapprochées ;
- des instantanés de sections et de thème ;
- une persistance de l'historique dans `sessionStorage` lorsque configurée.

Ces paramètres sont des valeurs observées, pas des objectifs arbitraires à augmenter. Toute modification doit être justifiée par des tests et un besoin réel.

## 2.7 Tests Studio déjà retrouvés

Le dépôt contient déjà plusieurs tests spécifiques au Studio, notamment :

```text
src/tests/studioProgressiveWorkflow.test.tsx
src/tests/heroBannerModelsAndResponsive.test.tsx
src/tests/studioPhase4ConstructionTools.test.tsx
src/tests/studioBannerAndSectionCoherence.test.tsx
src/tests/studioAuditRemediation.test.tsx
src/tests/studioAuditRemediationPart2.test.tsx
src/tests/sellerStudioPhase1Engine.test.ts
src/tests/studioSaveManager.test.ts
```

La liste doit être revalidée au moment des travaux. Il est interdit d'affirmer qu'il n'existe aucun test Studio sans refaire une recherche dans le dépôt.

## 2.8 Documentation historique

Le dépôt contient un fichier `STUDIO_LAIFA.md`. Le propriétaire précise que certains fichiers Markdown existants peuvent être obsolètes ou ne plus refléter le code courant.

Règle obligatoire :

- le code actuel, les types actuels, les tests actuels, les routes et les services actuels sont les références principales ;
- un fichier Markdown existant peut servir d'index ou de piste de recherche ;
- aucune fonctionnalité ne doit être tenue pour acquise uniquement parce qu'elle est décrite dans un ancien document ;
- si une documentation contredit le code, signale la divergence et fonde l'implémentation sur le comportement réellement vérifié, après validation du propriétaire si la divergence change la portée fonctionnelle.

---

# 3. RÈGLES NON NÉGOCIABLES POUR TOUTES LES PHASES

## 3.1 Améliorer l'existant, ne pas reconstruire

Avant de créer un composant, un hook, un type, un service, un helper ou un endpoint :

1. recherche les noms existants et les fonctions équivalentes ;
2. lis leurs appels et leurs consommateurs ;
3. vérifie les renderers et les types qui partagent les données ;
4. décide si l'outil doit être corrigé, étendu, découpé ou remplacé ;
5. documente pourquoi une nouvelle abstraction est nécessaire si tu en crées une.

Ne crée jamais deux sources de vérité pour le même réglage.

## 3.2 Pas de modèles concurrents

Pour le Hero, n'invente pas un type comme `HeroBannerConfig` en parallèle de `HeroBannerSettings` et des types existants. N'ajoute pas un second système de normalisation comme `normalizeHeroConfig()` à côté de `normalizeHeroSettingsAdapter()`.

Pour les sections, n'invente pas un deuxième identifiant de type alors que `CustomPageSectionType` existe déjà. Pour les thèmes, n'ajoute pas un objet de configuration global indépendant des modèles actuels sans migration et accord explicites.

## 3.3 Pas de faux contenus ni de valeurs trompeuses

- Ne fabrique pas de produits pour remplir les aperçus.
- Ne remplace pas une erreur de catalogue par une liste vide.
- N'invente pas de numéro de téléphone, d'adresse, de nom commercial ou de prix.
- N'utilise pas des images de démonstration comme si elles appartenaient au vendeur.
- N'affiche pas une confirmation de sauvegarde avant confirmation du serveur ou d'un mécanisme local explicitement distingué.
- N'affiche pas « publié » si seule la version brouillon a été enregistrée.

Les exemples de démonstration doivent être identifiés comme tels et ne jamais être mélangés aux données réelles.

## 3.4 Pas de perte de personnalisations

Le thème global fournit des valeurs par défaut. Les styles propres à une section et les ajustements spécifiques d'un élément restent prioritaires. Changer de preset ne doit pas écraser toutes les personnalisations sans aperçu, avertissement et possibilité d'annulation.

Une recommandation automatique doit être proposée sous forme de prévisualisation ou d'action explicite. Le vendeur doit pouvoir refuser.

## 3.5 Pas de régression de la boutique publique

Toute modification qui touche aux données, aux styles, aux renderers, au Hero, aux catégories, aux produits ou au responsive doit vérifier le rendu de la boutique publique. Un aperçu plus joli dans l'éditeur ne suffit pas si la boutique publiée devient différente ou cassée.

## 3.6 Respect de la lisibilité du code

- TypeScript strict et types métier existants.
- Composants cohérents et responsabilités nettes.
- Pas de composant géant concentrant état, accès API, logique métier et présentation.
- Pas de découpage artificiel qui crée des fichiers minuscules uniquement pour respecter un nombre de lignes.
- Pour tout nouveau module, viser une taille maîtrisable (repère de projet : environ 250 lignes ou moins lorsque c'est pertinent) ; si le module grossit, extraire les responsabilités cohérentes.
- Ne déplace pas une logique partagée dans une zone réservée à un seul écran.
- Préfère des noms explicites et une API de composant stable.

## 3.7 Accessibilité et langues

- Les commandes doivent fonctionner au clavier.
- Les contrôles doivent avoir des libellés accessibles.
- Les états focus, hover, disabled, loading et error doivent être visibles.
- Les couleurs ne doivent pas être le seul moyen d'exprimer un statut.
- Les textes doivent respecter le système de traduction déjà présent dans le dépôt.
- Prévoir les libellés longs en français et les langues réellement prises en charge par le produit.
- Tester les directions RTL uniquement si le produit les prend effectivement en charge ; ne pas bricoler une pseudo-prise en charge incomplète.

---

# 4. CIBLE FONCTIONNELLE GLOBALE

Le Studio cible doit être organisé autour de ces domaines, en réutilisant les panneaux et composants déjà présents :

1. **Identité de boutique** : nom, logo, profil, coordonnées, adresse, liens et informations utiles réellement disponibles.
2. **Structure de vitrine** : liste des sections, ajout, déplacement, duplication, visibilité, suppression et organisation.
3. **Édition de section** : contenu, style, disposition, responsive et réglages avancés.
4. **Thème global** : couleurs, typographies, surfaces, rayons, espacements et presets sectoriels.
5. **Médias** : import, bibliothèque, classement, sélection, suppression protégée et usages.
6. **Catalogue** : produits, catégories, collections et contenus dynamiques provenant des données du vendeur.
7. **Aperçu** : rendu interactif, sélection d'éléments, appareils et comparaison avec la boutique publique.
8. **Historique** : annulation, rétablissement, restauration et versions si le backend les permet.
9. **Qualité** : diagnostics visuels, contenu manquant, SEO, contraste, mobile, médias et données.
10. **Publication** : contrôles, confirmation, suivi du résultat et retour arrière.

Ces domaines ne sont pas une obligation de créer dix nouvelles pages. Ce sont des responsabilités fonctionnelles à retrouver et à organiser dans l'expérience existante.

---

# 5. SPÉCIFICATION DES OUTILS ET COMPORTEMENTS

## 5.1 Navigation et espace de travail

Le Studio doit conserver une expérience de travail claire. L'organisation de départ constatée utilise une navigation latérale, une zone d'aperçu et un panneau de propriétés. L'IA doit vérifier l'implémentation actuelle avant de figer les dimensions et les comportements.

### Panneau de navigation

Il doit permettre d'accéder aux domaines principaux : sections, identité, thème, catalogue, médias, pages et historique selon les fonctionnalités réellement disponibles.

Attendus :

- libellé clair pour chaque entrée ;
- indicateur visuel du panneau actif ;
- état conservé lors d'une sélection de section lorsque cela ne crée pas de confusion ;
- raccourci évident pour revenir à l'aperçu ;
- navigation utilisable sur petits écrans ;
- aucune action destructive immédiate depuis une icône non expliquée.

### Zone centrale d'aperçu

Elle doit montrer le rendu de la boutique et permettre une sélection directe des sections ou éléments éditables.

Attendus :

- aperçu Desktop, Tablette et Mobile ;
- prise en compte de la largeur réelle du viewport simulé ;
- sélection claire de la section active ;
- survol identifiable sans être confondu avec la sélection ;
- mode interactif séparé du mode édition, pour que les liens, carrousels et accordéons puissent être essayés sans lancer accidentellement une modification ;
- zoom utile sans fausser les proportions du viewport ;
- comportement correct en cas de section vide, masquée ou avec média absent.

### Inspecteur de propriétés

Les onglets existants sont à conserver et à rendre cohérents :

- **Contenu** : données métier propres à la section ;
- **Style** : couleurs, typographie, surfaces, bordures, boutons et effets ;
- **Disposition** : largeur, alignement, ordre, espacement et composition ;
- **Responsive** : valeurs par appareil et adaptation ;
- **Avancé** : identifiants, classes autorisées, animations et options réellement supportées.

Le panneau doit afficher le nom de la section et l'élément éventuellement sélectionné. Chaque réglage doit être accompagné d'un libellé compréhensible et, si nécessaire, d'une courte explication.

### Redimensionnement et densité

Sur grand écran, l'utilisateur doit pouvoir conserver une zone d'aperçu suffisamment large. Sur tablette et téléphone, les panneaux doivent devenir des écrans ou tiroirs clairement navigables. Ne réduis pas simplement trois colonnes jusqu'à rendre les contrôles illisibles.

## 5.2 Mode guidé et mode expert

Le dépôt contient un mode `guided` et un mode `expert` dans le store du Studio, ainsi qu'un parcours progressif en quatre étapes.

### Mode guidé

Il doit réduire le nombre de décisions visibles et aider le vendeur à compléter les fondations de sa boutique avant d'accéder aux réglages plus complexes.

Les étapes actuelles doivent être relues dans le code et préservées tant qu'une nouvelle séquence n'est pas validée. Le test `studioProgressiveWorkflow.test.tsx` indique déjà une règle importante : l'étape suivante ne doit pas se débloquer avant la réussite de l'enregistrement attendu.

Règles :

- une étape terminée doit refléter un enregistrement réel, pas seulement un clic ;
- en cas d'échec, rester sur l'étape concernée et montrer l'erreur ;
- préserver les saisies ;
- permettre de revenir à une étape déjà déverrouillée ;
- afficher clairement ce qui reste à faire ;
- ne pas bloquer artificiellement une action utile lorsque les données nécessaires sont déjà remplies.

### Mode expert

Il doit rendre les outils avancés et la navigation complète accessibles directement. Il ne doit pas supprimer les protections de sauvegarde, les validations de données ou les confirmations nécessaires.

### Changement de mode

Le changement de mode ne doit jamais réinitialiser les sections, le thème, les réglages ou la progression de sauvegarde. Il s'agit d'un changement d'expérience d'interface, pas d'une réinitialisation du projet.

## 5.3 Thème global et système visuel

Le thème global doit être la base visuelle de la boutique. Il ne doit pas imposer un style unique à toutes les sections.

### Propriétés à inventorier

À partir des types existants, inspecte les propriétés disponibles et leur utilisation réelle :

- couleur principale ;
- couleur secondaire ;
- couleur d'accent ;
- couleur du fond de page ;
- couleur des surfaces/cartes ;
- famille typographique ;
- tailles et graisses typographiques si gérées ;
- espacements verticaux et horizontaux ;
- largeur des conteneurs ;
- rayons des angles ;
- ombres et élévations ;
- styles de boutons ;
- bordures et séparateurs.

Ne crée pas une liste de tokens uniquement décorative. Chaque token doit avoir un usage dans le rendu réel.

### Hiérarchie de styles recommandée

La résolution doit rester déterministe. Le comportement attendu est :

1. valeurs de base du Design System ;
2. preset de secteur ou de direction visuelle choisi ;
3. thème personnalisé de la boutique ;
4. réglages de style propres à une section ;
5. réglages explicites d'un élément lorsque le modèle le permet.

Cette hiérarchie doit être comparée au code existant et adaptée aux structures actuelles. Ne duplique pas les propriétés entre `settings` et `styles` sans stratégie de compatibilité.

### Presets Atelier Premium

Les cinq univers suivants peuvent servir de presets de départ à intégrer ou à améliorer si leur équivalent n'existe pas déjà :

| Preset | Direction | Couleurs et matière suggérées | Usage de départ |
|---|---|---|---|
| Minimal Pure | Minimalisme lumineux et précis | Blanc cassé, noir doux, gris minéral | Catalogue général, design contemporain |
| Feminine Silk | Élégance délicate et éditoriale | Rose poudré, ivoire, champagne | Beauté, mode, accessoires |
| Onyx Luxury | Luxe sombre, contrastes maîtrisés | Noir profond, ivoire, laiton discret | Bijoux, parfumerie, collections premium |
| Botanical Studio | Naturel, doux et artisanal | Sauge, lin, terre cuite | Artisanat, décoration, produits naturels |
| Tech Cobalt | Moderne, net et énergique | Bleu cobalt, graphite, blanc | Électronique, accessoires tech |

Ces cinq directions ne sont pas présentées comme les cinq styles les plus populaires du marché. Ce sont des références initiales. Elles ne doivent pas exclure les thèmes existants par secteur, les créations personnalisées ni les identités culturelles locales, notamment les univers inspirés de l'artisanat algérien.

### Application d'un preset

Avant d'appliquer un preset :

- montrer un aperçu ;
- indiquer les éléments qui vont changer ;
- conserver une copie de l'état précédent dans l'historique ;
- préserver les contenus, les médias, les liens et les données produits ;
- signaler les réglages personnalisés qui seront écrasés ou transformés ;
- offrir une annulation fiable.

Le preset doit fournir des valeurs de départ, pas verrouiller le thème.

## 5.4 Gestion des sections

Le catalogue des sections doit être piloté par `CustomPageSectionType` et la source de catalogue existante, notamment `sectionCatalog.ts`.

Actions attendues :

- ajouter depuis un catalogue compréhensible ;
- expliquer le rôle de chaque section avant ajout ;
- rechercher une section par nom ;
- filtrer par famille fonctionnelle ;
- ajouter une section avec des valeurs initiales cohérentes ;
- déplacer avec glisser-déposer et avec des commandes accessibles ;
- dupliquer en donnant un nouvel identifiant unique ;
- masquer ou afficher ;
- supprimer avec confirmation ;
- restaurer après suppression via Undo lorsque possible ;
- distinguer les sections structurelles ou de bas de page selon le comportement actuel ;
- avertir si une section est vide ou n'a aucun contenu utile.

### Règles de mutation

Les opérations doivent utiliser les helpers existants comme `studioSectionMutations.ts` si leur rôle est confirmé. Ne crée pas plusieurs implémentations dupliquées pour l'ajout ou la duplication.

Lors de la duplication :

- produire un nouvel identifiant ;
- ne pas partager par référence des objets mutables entre l'original et le clone ;
- préserver les données utiles ;
- vérifier les références produits, catégories et médias ;
- ajuster l'ordre ;
- enregistrer l'action dans Undo/Redo.

Lors de la suppression :

- demander une confirmation compréhensible ;
- indiquer si le contenu va être retiré ;
- permettre l'annulation tant que l'historique le permet ;
- ne pas supprimer par erreur un média partagé ou un produit réel.

## 5.5 Catalogue des 16 sections — exigences minimales

Les exigences suivantes définissent le comportement attendu de chaque type. Elles ne signifient pas que chaque champ doit être créé immédiatement. L'IA doit cartographier les réglages existants, indiquer ce qui est déjà pris en charge et ne construire que les écarts validés.

### 1. `hero_banner` — Bannière principale

Rôle : présenter immédiatement l'univers de la boutique, une collection ou une offre prioritaire.

Attendus : composition visuelle, titre, sous-titre, badge éventuel, image principale, image secondaire selon le modèle, CTA, point focal, zoom, couleurs, contraste, hauteur, largeur, rayons et réglages par appareil.

La composition doit être lisible sur mobile. Si une image secondaire requise par un modèle manque, le renderer doit utiliser un fallback visuel propre ou basculer vers une composition de secours clairement définie, sans afficher un trou vide.

Le contenu textuel doit rester modifiable. Une recommandation de sobriété est permise, mais il ne faut pas imposer une limite absolue de trois lignes ou de trois éléments si cela ne correspond pas au modèle réel. Préférer des recommandations, des avertissements de densité et un aperçu.

### 2. `promo_carousel` — Carrousel promotionnel

Rôle : présenter plusieurs campagnes ou offres.

Attendus : liste de slides, ajout/suppression/réorganisation, image, badge, titre, texte, CTA, style, durée si automatique, navigation, points de progression et comportement tactile.

Comportements :

- ne pas démarrer automatiquement un mouvement agressif ;
- respecter les préférences de réduction des animations lorsque disponibles ;
- offrir des boutons accessibles ;
- empêcher un slide incomplet de casser le carrousel ;
- sur mobile, maintenir un texte et un CTA lisibles ;
- afficher un état clair lorsqu'il n'y a aucune slide exploitable.

### 3. `kinetic_marquee` — Bandeau cinétique

Rôle : mettre en valeur un message court, une promesse, une information ou un motif typographique défilant.

Attendus : texte ou items répétables, séparateur, style typographique, vitesse, direction, couleur et espacement si supportés.

Accessibilité : le mouvement doit pouvoir être arrêté ou réduit ; le contenu essentiel ne doit pas dépendre uniquement de l'animation ; éviter les défilements trop rapides et les clignotements.

### 4. `featured_categories` — Catégories mises en avant

Rôle : aider à explorer rapidement les rayons de la boutique.

Attendus : sélection des catégories réelles, image, titre, ordre, nombre de colonnes, style de carte, filtre et fallback si une catégorie n'a pas d'image.

La synchronisation depuis le catalogue doit être une action contrôlée. Elle ne doit pas remplacer sans avertissement les catégories éditées manuellement. Une catégorie sans produit doit être signalée comme vide si le calcul est fiable.

### 5. `curated_collections` — Collections sélectionnées

Rôle : créer une sélection éditoriale de produits.

Attendus : nom de collection, description éventuelle, image de couverture, critères ou sélection manuelle, ordre et règles de visibilité.

L'éditeur doit expliquer si la collection est dynamique ou manuelle. Ne mélange pas ces modes dans un contrôle ambigu.

### 6. `new_arrivals` — Nouveautés

Rôle : présenter les produits considérés comme nouveaux.

Attendus : source de données réelle, règle de fraîcheur connue, nombre de produits, ordre, mise en page et état vide.

Si la date de création ne permet pas de calculer les nouveautés, expliquer la limite et ne pas inventer un classement.

### 7. `featured_products` — Produits mis en avant

Rôle : sélectionner quelques produits importants.

Attendus : sélection manuelle à partir du vrai catalogue, recherche, aperçu des images, contrôle des produits indisponibles, ordre et nombre maximum cohérent.

### 8. `best_sellers` — Meilleures ventes

Rôle : présenter les produits les plus vendus lorsque les données permettent réellement ce classement.

Ne pas appeler « meilleures ventes » une simple liste arbitraire. Si les données de ventes ne sont pas disponibles ou non fiables, proposer une sélection manuelle clairement nommée ou afficher une limite explicite.

### 9. `product_grid` — Grille de produits

Rôle : présenter le catalogue sous forme de grille.

Attendus : source, catégories/collections, nombre de colonnes par appareil, nombre d'items, ordre, filtres disponibles, prix, prix promotionnel, badges et état sans résultat.

Vérifier que le rendu respecte les champs réellement présents dans `Product` et les règles de visibilité du catalogue.

### 10. `brand_story` — Histoire de marque

Rôle : présenter le vendeur, l'origine de la marque, son savoir-faire et ses valeurs.

Attendus : titre, texte, médias, composition, largeur de lecture et alignement. Le contenu doit être rédigé par le vendeur ou explicitement identifié comme exemple.

### 11. `showcase_video` — Vidéo de présentation

Rôle : montrer un produit, un atelier, un processus ou l'univers de la boutique.

Attendus : URL ou source autorisée, miniature, texte alternatif ou description accessible, bouton de lecture, contrôle du ratio et fallback si le média échoue.

Ne lance pas de lecture sonore automatique. Vérifie la politique de stockage, les domaines autorisés et la taille des fichiers.

### 12. `verified_reviews` — Avis vérifiés

Rôle : rassurer le client avec des avis authentiques.

Les avis doivent provenir d'une source réelle et vérifiable. Ne crée pas d'avis fictifs pour rendre la section visuellement complète. Si aucun avis n'est disponible, proposer un état vide professionnel qui invite le vendeur à revenir lorsque des avis seront collectés.

### 13. `delivery_info` — Informations de livraison

Rôle : communiquer les conditions et informations logistiques réellement utilisées par la boutique.

Attendus : délais, zones, modes de livraison, tarifs ou liens d'information si disponibles. Les informations spécifiques à l'Algérie, aux wilayas et aux prestataires doivent venir des données ou paramètres réellement maintenus par le produit, pas de valeurs inventées dans le composant.

### 14. `return_policy` — Politique de retour

Rôle : informer clairement le client des conditions de retour ou d'échange.

Attendus : texte explicite, conditions, délais, contact ou lien utile. Ne pas inventer des obligations commerciales ou juridiques. Utiliser les règles réelles définies par la boutique et la plateforme.

### 15. `faq_accordion` — Questions fréquentes

Rôle : répondre aux questions habituelles.

Attendus : liste de questions/réponses, ajout, suppression, réorganisation, état ouvert/fermé, contrôle du texte et navigation clavier.

Ne pas insérer de réponses présentées comme officielles si elles ne correspondent pas à la politique réelle de la boutique.

### 16. `contact_footer` — Pied de boutique et contact

Rôle : permettre au visiteur de retrouver les coordonnées et les liens de la boutique.

Attendus : téléphone, e-mail, adresse, wilaya/commune, horaires, réseaux sociaux et liens présents dans les données réelles du vendeur.

Les coordonnées réelles doivent être proposées depuis le profil du vendeur lorsque les données sont disponibles. Ne pas ajouter de faux numéro ou d'e-mail d'exemple dans une boutique publiée.

## 5.6 Réglages communs des sections

Lorsque le type de section le permet, les réglages communs doivent être cohérents :

- largeur du conteneur : pleine, contenue ou étroite ;
- espacement vertical et horizontal ;
- fond et surface ;
- couleurs du texte, titre et sous-titre ;
- rayons simples ou par angle si supportés ;
- bordures ;
- boutons ;
- ombres ;
- séparateurs ;
- animation ;
- visibilité par appareil uniquement si le modèle actuel le permet.

Ne montre pas un contrôle si le renderer ne sait pas l'appliquer. Chaque propriété visible dans l'inspecteur doit être reliée à un effet concret.

## 5.7 Responsive par appareil

Le responsive doit être traité comme une fonction de conception, pas comme une simple réduction de largeur.

Pour chaque section, vérifier :

- ordre des éléments ;
- largeur des images et du texte ;
- ratio d'image ;
- point focal ;
- taille du titre et du texte ;
- position du CTA ;
- espacement ;
- nombre de colonnes ;
- débordements horizontaux ;
- lisibilité et cibles tactiles.

Si les réglages sont indépendants par appareil, une modification Desktop ne doit pas écraser silencieusement Mobile. Si un réglage hérite du Desktop, l'interface doit rendre cet héritage visible.

Une fonction de suggestion d'adaptation peut calculer des valeurs de départ, mais l'application doit être confirmée par le vendeur. La suggestion ne doit pas écraser une configuration mobile déjà personnalisée.

## 5.8 Bibliothèque de médias

Le dépôt contient `MediaInspectorPanel`, `MediaGalleryItem`, un gestionnaire de médias et une recherche des usages dans les sections et la configuration de boutique.

Objectifs : transformer cette base en une bibliothèque fiable et facile à utiliser.

### Fonctions attendues

- importer une image depuis l'appareil ;
- voir une progression et une erreur d'import compréhensible ;
- voir une miniature ;
- rechercher par nom ;
- filtrer par catégorie de dossier ;
- sélectionner un média pour un champ précis ;
- afficher dimensions, format et taille si disponibles ;
- retrouver les sections qui utilisent un média ;
- empêcher ou confirmer une suppression si le média est utilisé ;
- distinguer une suppression de bibliothèque d'un remplacement dans une section ;
- gérer un état vide et un état d'échec de chargement.

### Validation technique

Les contraintes côté interface ne remplacent jamais la validation côté serveur. Le code actuel de `MediaInspectorPanel` indique des types MIME et une limite client de 5 Mo ; l'IA doit vérifier les règles d'upload serveur et Storage avant de modifier ces paramètres.

Contrôler :

- taille réelle du fichier ;
- type MIME et signature si disponible ;
- formats acceptés par les renderers ;
- compression et génération de miniatures ;
- conservation des proportions ;
- noms de fichiers sûrs ;
- suppression des fichiers orphelins ;
- autorisations du vendeur ;
- absence de stockage Base64 volumineux dans les documents de configuration.

### Gestion des images absentes

Un média manquant doit produire un fallback prévu, pas une image brisée. Le vendeur doit voir quel média manque et pouvoir le remplacer sans perdre les autres réglages.

## 5.9 Connexion au catalogue vendeur

Le chargement des données du Studio et du catalogue est déjà distingué dans `studioCatalogLoader.ts` avec les statuts `idle`, `loading`, `loaded` et `error`.

Cette distinction doit être conservée partout.

Comportement obligatoire :

- `loading` : afficher un état de chargement ;
- `loaded` avec zéro produit : afficher un vrai état vide ;
- `error` : afficher l'erreur et une action de rechargement ;
- `loaded` avec produits : afficher les produits réellement disponibles.

Ne transforme pas `error` en `loaded` avec une liste vide.

### Sélection de produits

Le sélecteur doit offrir, selon les données disponibles :

- recherche par nom ;
- filtres de catégorie ;
- aperçu image et prix ;
- distinction produit actif, brouillon, suspendu ou indisponible si ces statuts existent ;
- sélection multiple lorsque la section le permet ;
- indication du nombre sélectionné ;
- suppression de sélection ;
- gestion d'un produit supprimé après sa sélection.

### Cohérence des données

Les champs produits peuvent évoluer. Ne suppose pas un schéma simplifié. Lis le type `Product` complet, les endpoints réellement appelés et les règles backend. N'utilise pas un alias de catégorie sans vérifier les champs de compatibilité déjà présents.

## 5.10 Pages et organisation de la boutique

Les outils de pages existants doivent être recensés avant toute extension. S'ils existent, vérifier :

- création et suppression de page ;
- nom et identifiant/slug ;
- choix des sections autorisées ;
- liens depuis la navigation ;
- état brouillon/publication ;
- comportement d'une page vide ;
- navigation entre pages ;
- cohérence avec la boutique publique.

Ne crée pas un deuxième système de pages si un outil existant remplit déjà ce rôle.

## 5.11 Aperçu en direct et fidélité du rendu

Le Studio doit réutiliser autant que possible le renderer partagé de la boutique publique. La même donnée de section doit produire le même rendu visuel, à l'exception des overlays et contrôles nécessaires à l'édition.

Vérifier en particulier :

- styles calculés dans le même ordre ;
- champs manquants ;
- médias non accessibles ;
- variation de viewport ;
- liens et interactions ;
- sélection des sous-éléments ;
- mise à jour à chaud après modification ;
- contenu dynamique issu du catalogue ;
- comportement d'une section masquée.

Le mode interactif ne doit pas déclencher involontairement l'édition lorsqu'un vendeur essaie un bouton ou un lien.

## 5.12 Diagnostic qualité

Un outil d'audit de qualité existe déjà sous forme de `storeQualityAuditor.ts`, avec des résultats de contrôle, des statuts `pass`, `warn` ou `fail`, un score et des actions possibles.

Le travail doit améliorer l'utilité et la justesse de ce diagnostic.

### Familles de contrôles

- identité de boutique ;
- présence d'une structure de vitrine ;
- hiérarchie et cohérence des sections ;
- contraste des couleurs ;
- lisibilité typographique ;
- images absentes ou invalides ;
- texte alternatif si attendu ;
- poids et formats médias ;
- qualité mobile ;
- liens et CTA ;
- données produits ;
- coordonnées ;
- livraison et retours ;
- SEO et métadonnées réellement prises en charge.

### Qualité du score

Le score doit être explicable. Chaque point gagné ou perdu doit être relié à un contrôle concret. Un score ne doit pas augmenter simplement parce qu'une section artificielle a été ajoutée.

### Corrections automatiques

Une correction automatique doit :

- expliquer son effet ;
- proposer un aperçu lorsque le changement est visuel ;
- ne jamais inventer une donnée métier ;
- garder un Undo ;
- enregistrer correctement le résultat ;
- signaler ce qu'elle n'a pas pu corriger.

## 5.13 Sauvegarde, Undo/Redo et publication

### Brouillon

Le brouillon doit être sauvegardé sans bloquer les interactions ordinaires. L'interface doit distinguer :

- modifications non enregistrées ;
- enregistrement en cours ;
- tentative de reprise ;
- sauvegarde réussie ;
- mode hors ligne ;
- erreur ;
- conflit de révision.

Ne modifie pas les mécanismes de concurrence sans analyser `useStudioSaveManager`, `useSellerStudio`, le service serveur et les routes du contrôleur.

### Conflits de révision

L'usage de `expectedRevision` est déjà présent dans le client et dans les chemins backend retrouvés. L'IA doit examiner le cycle complet : lecture initiale, sauvegarde, réponse serveur, mise à jour de révision, publication et conflit.

Un conflit doit éviter d'écraser silencieusement une version plus récente. Le vendeur doit comprendre qu'une autre version existe et choisir une action sûre selon les capacités backend : recharger, comparer, réessayer ou demander une résolution explicite.

Ne propose pas de bouton `forceOverwrite` visible comme solution générale. Vérifie les permissions, les contrôles serveur et les risques de perte avant toute utilisation.

### Sauvegarde locale de secours

La sauvegarde locale doit être :

- associée au bon vendeur et à la bonne boutique ;
- versionnée si le format évolue ;
- validée avant restauration ;
- comparée à l'état serveur ;
- restaurable par action explicite ;
- supprimée uniquement après confirmation d'une sauvegarde serveur sûre ou décision documentée.

### Undo/Redo

Undo/Redo doit couvrir les modifications de sections et de thème si c'est le comportement actuel. Vérifier également les actions structurelles : ajout, suppression, duplication, déplacement, visibilité, application d'un preset et restauration.

Éviter que chaque caractère tapé crée une étape indépendante. Le regroupement doit rester naturel, sans fusionner des actions distinctes. Les raccourcis clavier doivent respecter les champs de saisie et les conventions du navigateur.

### Publication

Le flux doit clairement séparer brouillon et version publiée.

Avant publication :

- vérifier que le brouillon a été réellement enregistré ;
- vérifier la révision à publier ;
- exécuter les contrôles bloquants et avertissements ;
- présenter un résumé du changement ;
- empêcher les doubles soumissions ;
- afficher une progression ;
- conserver la modale ou le contexte en cas d'erreur ;
- confirmer le résultat serveur avant d'afficher « publié ».

### Historique et restauration

Si l'API offre l'historique et le rollback, vérifier :

- ordre des versions ;
- auteur et date ;
- résumé compréhensible ;
- différence brouillon/publié ;
- aperçu d'une version si disponible ;
- confirmation avant rollback ;
- sauvegarde de la version actuelle avant restauration ;
- mise à jour correcte des révisions et caches.

---

# 6. DIRECTION ARTISTIQUE DU HERO — SPÉCIFICATION DÉTAILLÉE

Le Hero est une section majeure, mais il ne doit pas monopoliser toute la refonte. Les autres sections et l'expérience générale du Studio ont la même importance dans le plan global.

Le dépôt contient déjà cinq renderers spécialisés et un système de modèles. Le rôle de l'IA est de fiabiliser, simplifier et approfondir les outils de conception autour de cette base.

## 6.1 Les cinq compositions à préserver

| Composition | Renderer existant | Intention visuelle | Structure cible |
|---|---|---|---|
| Full Bleed | `HeroFullBleed` | Image immersive et impact immédiat | Image en fond ou surface dominante, texte superposé maîtrisé, CTA visible |
| Split | `HeroSplit` | Éditorial équilibré | Zone image et zone texte séparées, proportions réglables |
| Arch | `HeroArch` | Composition architecturale élégante | Image cadrée dans une arche ou forme dédiée, texte complémentaire |
| Gallery | `HeroGallery` | Composition de plusieurs images | Image principale et images secondaires avec positions contrôlées |
| Diptych | `HeroDiptych` | Deux panneaux visuels complémentaires | Deux surfaces image équilibrées, écart et ratio réglables |

Les identifiants enregistrés et les noms de presets peuvent être différents de ces libellés. Le système actuel de modèles et de normalisation est la source de vérité.

## 6.2 Full Bleed

### Réglages à vérifier

- hauteur du Hero ;
- largeur pleine ou contenue ;
- image ;
- position focale ;
- zoom ;
- niveau et couleur de superposition ;
- position du bloc texte ;
- largeur maximale du texte ;
- taille du titre ;
- bouton ;
- rayon et ombre ;
- hauteur minimale sur mobile.

### Rendu attendu

L'image doit remplir la zone sans distorsion. Le texte doit rester lisible dans les zones claires ou sombres de la photo. Si le contraste est insuffisant, proposer un overlay ou une couleur de texte adaptée sans modifier automatiquement le choix du vendeur.

## 6.3 Split

### Réglages à vérifier

- image à gauche ou à droite ;
- proportions existantes réellement supportées ;
- ratio ou hauteur de l'image ;
- alignement vertical du texte ;
- largeur du texte ;
- fond de la zone éditoriale ;
- espacement et rayons ;
- ordre sur mobile.

### Rendu attendu

Le ratio doit être calculé sur le conteneur réel. Une image portrait ne doit pas pousser le bloc texte hors écran. Sur mobile, l'ordre image/texte doit être explicite et le CTA doit rester visible.

## 6.4 Arch

### Réglages à vérifier

- type de forme d'arche disponible ;
- dimensions ;
- proportions image ;
- position ;
- rayon ou courbure ;
- point focal ;
- fond et espace autour de l'arche ;
- placement du texte.

### Rendu attendu

La forme doit rester maîtrisée sur les trois appareils. Aucun bord ne doit être coupé par un parent overflow de manière inattendue. Les réglages de forme doivent être visibles dans l'aperçu.

## 6.5 Gallery

### Réglages à définir précisément

- nombre d'images réellement supporté ;
- image principale ;
- images secondaires ;
- positions relatives de chaque image ;
- tailles relatives ;
- espace entre les visuels ;
- éventuel chevauchement ;
- ordre de profondeur et `z-index` ;
- rayons ;
- points focaux indépendants ;
- comportement tablette ;
- comportement mobile.

Les positions et chevauchements ne doivent pas être codés de manière implicite dans plusieurs CSS différents. Définir une règle de composition cohérente dans le renderer existant.

Sur mobile, la galerie doit adopter une composition verticale ou une alternative prévue ; elle ne doit pas simplement réduire les images jusqu'à les rendre illisibles.

## 6.6 Diptych

### Réglages à définir précisément

- image principale et image secondaire ;
- proportions de chaque panneau ;
- écart entre panneaux ;
- ratio de chaque image ;
- points focaux indépendants ;
- ordre des panneaux ;
- hauteur minimale ;
- rayons et bordures.

### Cas où la deuxième image manque

Le renderer doit avoir un comportement de secours déterministe :

1. montrer une composition à un seul panneau prévue pour le modèle ; ou
2. proposer un fallback de mise en page cohérent sans fausse image ;
3. conserver l'identifiant du modèle si un fallback temporaire suffit, ou proposer explicitement le changement de modèle si le modèle devient impossible à représenter.

Ne jamais afficher une zone vide comme si la composition était complète.

## 6.7 Point focal, zoom et cadrage

Le point focal doit pouvoir être réglé sans déformer l'image.

Approche technique à évaluer avec le renderer existant :

- conteneur positionné avec `overflow: hidden` lorsque nécessaire ;
- image rendue avec `object-fit: cover` ou un comportement équivalent adapté au modèle ;
- `object-position` piloté par les coordonnées focales ;
- zoom appliqué de manière bornée via `transform: scale(...)` ou mécanisme existant ;
- transformation avec origine cohérente ;
- validation de l'absence de débordement non souhaité.

Les valeurs de zoom et de point focal doivent être bornées et validées. Une modification Desktop ne doit pas écraser les profils Tablet/Mobile indépendants.

## 6.8 Contenu et densité

Le vendeur doit pouvoir modifier le badge, le titre, le sous-titre, le CTA et les autres éléments réellement pris en charge par le modèle.

L'interface doit aider à éviter la surcharge :

- indication de longueur recommandée ;
- avertissement si le texte devient trop long ;
- aperçu du retour à la ligne ;
- largeur maximale configurable ;
- hiérarchie claire entre titre, sous-titre et badge.

Ne supprime pas arbitrairement une partie du contenu du vendeur pour imposer une composition minimaliste. Le minimalisme est une recommandation de design, pas une destruction de contenu.

## 6.9 Tests Hero

Étendre les tests existants pour couvrir :

- les cinq modèles ;
- la normalisation des anciens réglages ;
- les valeurs inconnues ;
- les médias absents ;
- image secondaire manquante ;
- ratios ;
- positions et zoom ;
- isolation des profils Desktop/Tablet/Mobile ;
- contraste ;
- CTA sûrs ;
- cohérence aperçu/public ;
- aucune perte des anciennes boutiques.

---

# 7. MIGRATION, COMPATIBILITÉ ET PROTECTION DES BOUTIQUES EXISTANTES

Toute amélioration touchant au schéma doit protéger les boutiques déjà créées.

## 7.1 Distinguer normalisation et migration

### Normalisation à la lecture

La normalisation à la lecture adapte une donnée existante à un format sûr pour le rendu, sans réécrire silencieusement la donnée stockée.

Elle doit être :

- déterministe ;
- idempotente ;
- non destructive ;
- tolérante aux propriétés absentes ;
- testée avec les données historiques.

Le `normalizeHeroSettingsAdapter()` existant doit rester le point d'entrée principal de normalisation Hero, sauf décision documentée de refactorisation.

### Migration persistée

Une migration persistée modifie les données stockées. Elle doit être séparée de la normalisation et nécessiter :

- un inventaire des anciennes formes ;
- un mapping explicite ancien champ → nouveau champ ;
- une validation des données ;
- un mode de sauvegarde ou une stratégie de restauration ;
- une version de schéma lorsque cela est nécessaire ;
- un traitement des erreurs par lot ;
- une journalisation sans données sensibles ;
- un plan de rollback ;
- des tests de migration sur fixtures représentatives.

Ne lance pas une migration générale des boutiques sans accord explicite du propriétaire.

## 7.2 Cas de compatibilité à couvrir

- propriété supprimée ou renommée ;
- champ optionnel absent ;
- valeur d'enum inconnue ;
- URL d'image invalide ;
- média supprimé ;
- ancien identifiant de modèle Hero ;
- ancien format de ratio ;
- réglage mobile absent ;
- section inconnue ;
- produit référencé qui n'existe plus ;
- catégorie supprimée ;
- ordre de sections incohérent ;
- données partiellement sauvegardées ;
- version de brouillon et version publiée différentes.

Une section inconnue ne doit pas faire planter toute la boutique. Prévoir un fallback maîtrisé et un diagnostic, sans effacer son contenu original.

## 7.3 Sauvegarde avant migration

Avant toute migration persistée, documenter :

- ce qui sera modifié ;
- combien d'enregistrements sont concernés ;
- la méthode de sauvegarde ;
- la procédure de reprise ;
- les critères d'arrêt ;
- la vérification post-migration.

La migration ne doit pas être intégrée à une refonte de l'interface sans séparation claire.

---

# 8. SÉCURITÉ ET FRONTIÈRES DE CONFIANCE

Le Studio modifie des données marchandes et médias. Toute fonctionnalité d'édition doit respecter les protections serveur existantes.

À vérifier dans les contrôleurs, services, validateurs et règles Firebase réellement utilisés :

- vendeur authentifié ;
- propriété de la boutique ;
- autorisation sur les produits et médias référencés ;
- validation des types et tailles ;
- validation des URLs et liens ;
- protection contre injection de code dans les champs textuels ;
- sanitation des classes ou styles personnalisés si ces champs existent ;
- contrôle de révision ;
- limites de débit adaptées ;
- absence de données privées dans les logs ;
- droits de suppression et de rollback.

Le client ne fait jamais autorité pour une permission. Les contrôles critiques doivent exister côté serveur.

Toute fonctionnalité de partage, import ou média externe doit être évaluée selon les risques réels et les capacités déjà autorisées par la plateforme.

---

# 9. PERFORMANCE, QUALITÉ D'INTERACTION ET ACCESSIBILITÉ

## 9.1 Performance

À contrôler avant d'ajouter de nouvelles couches :

- rendus React inutiles ;
- sélecteurs Zustand trop larges ;
- mises à jour de store qui déclenchent tout l'aperçu ;
- listes longues de produits ;
- images lourdes ;
- chargement des panneaux non utilisés ;
- recalculs de style ou de layout répétés ;
- événements globaux et écouteurs non nettoyés ;
- appels API redondants ;
- sauvegardes trop fréquentes.

Ne pas optimiser à l'aveugle. Mesurer ou identifier précisément le problème avant de complexifier l'architecture.

## 9.2 Accessibilité pratique

- navigation clavier de bout en bout ;
- ordre de tabulation logique ;
- focus visible ;
- labels pour tous les champs ;
- messages d'erreur liés aux champs concernés ;
- boutons d'icône avec nom accessible ;
- modales qui gèrent le focus ;
- glisser-déposer doublé d'une alternative accessible ;
- contraste lisible ;
- animations non indispensables ;
- support `prefers-reduced-motion` lorsque pertinent.

## 9.3 États d'interface à traiter

Pour chaque panneau important, vérifier les états suivants :

- chargement ;
- succès ;
- vide ;
- erreur ;
- hors ligne ;
- conflit ;
- enregistrement ;
- données partiellement disponibles ;
- absence de sélection ;
- élément sélectionné mais supprimé côté données ;
- action en cours ;
- action impossible.

Ne laisse pas les états d'erreur et de chargement être représentés par le même écran vide.

---

# 10. PLAN D'EXÉCUTION PAR PHASES ET POINTS D'ARRÊT

**Règle absolue : une seule phase par intervention.**  
Les phases ci-dessous sont ordonnées par dépendance. Une phase ne commence qu'après validation de la précédente par le propriétaire.

## PHASE 0 — AUDIT RÉEL, CARTOGRAPHIE ET PLAN DE RISQUE

**Lecture seule — aucune modification du code**

### Objectif

Établir un état exact du Studio actuel avant de modifier quoi que ce soit. Cette phase doit éliminer les hypothèses anciennes et repérer les véritables écarts entre code, tests, types, API et rendu public.

### Travaux obligatoires

1. Identifier le commit et la branche réellement inspectés.
2. Relire `package.json`, les scripts et les dépendances.
3. Cartographier `src/pages/Seller/StoreBuilder/`.
4. Cartographier les types de sections, de thème, de produit, de médias et de version de layout.
5. Suivre le flux de données : chargement → store → édition → sauvegarde → publication → rendu public.
6. Examiner chaque hook central et ses consommateurs.
7. Examiner les 16 types de section dans `sectionCatalog.ts`, l'inspecteur et le renderer public.
8. Comparer l'aperçu Studio à la boutique publique.
9. Rechercher les tests Studio existants et associer chaque suite à une fonctionnalité.
10. Examiner les routes API, contrôleurs, validateurs et services utilisés par la sauvegarde, la publication, l'historique et les médias.
11. Identifier les fichiers trop complexes, les dépendances circulaires éventuelles et les responsabilités mélangées.
12. Relever les problèmes fonctionnels visibles et les zones non testées.

### Livrables attendus

- carte d'architecture actuelle ;
- inventaire des fonctionnalités réellement présentes ;
- tableau des 16 sections avec état de leurs éditeurs et renderers ;
- diagramme du flux de sauvegarde et publication ;
- matrice Desktop/Tablet/Mobile ;
- tableau des tests existants ;
- liste des incohérences confirmées ;
- liste des risques classés Critique / Élevé / Moyen / Faible ;
- plan de phases ajusté si les dépendances réelles l'exigent.

### Interdictions

- aucun commit de code ;
- aucune refonte visuelle ;
- aucune migration ;
- aucun renommage ;
- aucune suppression de fichier.

### Critères de sortie

La phase est terminée lorsque le propriétaire peut comprendre ce que le Studio sait déjà faire, ce qui fonctionne mal, ce qui manque et l'ordre recommandé des corrections.

### Rapport obligatoire

Fournir : `ÉLÉMENT | ÉTAT ACTUEL | PREUVE / FICHIER | PROBLÈME | RISQUE | RECOMMANDATION`.

**POINT D'ARRÊT PHASE 0 :** remettre le rapport et demander : « Valides-tu cette cartographie et l'ordre de travail, ou souhaites-tu corriger certaines priorités avant toute modification ? » Ne commencer aucune phase d'implémentation.

---

## PHASE 1 — FIABILITÉ DU MOTEUR, ÉTAT, SAUVEGARDE ET HISTORIQUE

### Objectif

Garantir que le Studio ne perde pas les modifications et que ses états de sauvegarde, ses révisions, ses reprises et son historique soient fiables.

### Périmètre de code à inspecter

Commencer par les fichiers réellement présents, notamment :

- `hooks/useSellerStudio.ts` ;
- `hooks/useStudioSaveManager.ts` ;
- `hooks/useStudioUndoRedo.ts` ;
- `hooks/studioCatalogLoader.ts` ;
- `hooks/studioBackupStorage.ts` si présent ;
- `store/useStudioStore.ts` et `store/studioStore.types.ts` ;
- contrôleur et service serveur du Studio ;
- tests `studioSaveManager`, `sellerStudioPhase1Engine` et tests associés.

### Travaux

1. Tracer le chargement initial des sections, thème, configuration, historique et produits.
2. Vérifier que les états de catalogue `loading`, `loaded`, `error` et catalogue vide restent distincts.
3. Vérifier que l'état affiché dans l'interface correspond à l'état réel des données.
4. Tracer une sauvegarde automatique depuis une mutation utilisateur jusqu'à la réponse serveur.
5. Vérifier le debounce, le verrou anti-concurrence, la file d'attente des changements et les reprises.
6. Vérifier que la dernière modification ne peut pas être perdue lorsqu'une sauvegarde est déjà en cours.
7. Vérifier la gestion de `expectedRevision` de bout en bout, côté client et côté serveur.
8. Vérifier les réponses de conflit et les actions proposées au vendeur.
9. Vérifier la sauvegarde locale de secours, son isolation par boutique, sa validation et sa restauration.
10. Vérifier le nettoyage des sauvegardes locales après confirmation sûre du serveur.
11. Vérifier Undo/Redo pour les actions de contenu, style, thème et structure.
12. Vérifier les raccourcis clavier sans intercepter la saisie dans les champs.
13. Vérifier la persistance de l'historique de session et les limites de capacité.
14. Vérifier l'action « Enregistrer maintenant » ou son équivalent si elle existe.
15. Vérifier que la publication utilise la révision réellement confirmée par la dernière sauvegarde.

### Scénarios de test indispensables

- édition puis sauvegarde normale ;
- plusieurs modifications rapides ;
- modification pendant une sauvegarde en cours ;
- panne réseau temporaire ;
- sauvegarde serveur refusée ;
- conflit de révision ;
- restauration d'une sauvegarde locale ;
- sauvegarde locale plus ancienne que le serveur ;
- Undo puis Redo ;
- suppression puis Undo ;
- application d'un thème puis Undo ;
- fermeture/rechargement pendant qu'il existe des changements non enregistrés ;
- publication immédiatement après une modification.

### Critères de sortie

- aucune modification confirmée ne disparaît silencieusement ;
- les statuts sont exacts ;
- les conflits ne provoquent pas d'écrasement silencieux ;
- Undo/Redo reste cohérent ;
- le catalogue ne masque pas ses erreurs ;
- les tests de sauvegarde et de publication sont verts ou chaque échec restant est justifié.

### Rapport obligatoire

Indiquer la séquence exacte de sauvegarde, les cas de concurrence testés, les règles de récupération, les tests exécutés et les risques restants.

**POINT D'ARRÊT PHASE 1 :** ne pas réorganiser l'interface ni commencer la Phase 2 sans validation explicite.

---

## PHASE 2 — ESPACE DE TRAVAIL, NAVIGATION ET EXPÉRIENCE GUIDÉE

### Objectif

Rendre l'espace de travail compréhensible et fluide pour le vendeur débutant, sans réduire les capacités du mode expert.

### Fichiers à inspecter

- `StudioWorkspace.tsx` ;
- `StudioColumnsLayout.tsx` ;
- `StudioTopBar.tsx` ;
- `StudioSidebar.tsx` ;
- `PropertiesInspector.tsx` ;
- `SectionTreePanel.tsx` ;
- composants mobiles ;
- `useStudioWorkspaceEvents.ts` ;
- état Zustand et tests de workflow.

### Travaux

1. Cartographier toutes les destinations de navigation.
2. Identifier les entrées redondantes et les actions difficiles à trouver.
3. Clarifier les modes guidé et expert.
4. Garder les quatre étapes actuelles tant qu'une modification de parcours n'a pas été validée.
5. Montrer la progression, les tâches restantes et les actions bloquantes.
6. Améliorer les états sans section sélectionnée et sans contenu.
7. Clarifier la relation entre liste, aperçu et inspecteur.
8. Vérifier l'ouverture et la fermeture des panneaux.
9. Améliorer les contrôles de viewport et le statut de sauvegarde.
10. Clarifier l'accès à l'ajout de section, aux pages, aux thèmes et aux médias.
11. Sur mobile, privilégier une navigation par panneaux ou étapes adaptée plutôt qu'une miniaturisation de trois colonnes.
12. Conserver les données lors d'un changement de navigation ou de mode.

### Règles UX

- une action principale clairement visible par contexte ;
- les actions destructives sont séparées des actions fréquentes ;
- les icônes seules ont un libellé accessible ou une infobulle utile ;
- les panneaux ne doivent pas cacher le statut d'enregistrement ;
- le retour à l'aperçu doit être évident sur mobile ;
- le mode expert ne doit pas être une copie du mode guidé avec simplement plus de boutons.

### Tests

- bascule guidé/expert ;
- progression du parcours après sauvegarde réelle ;
- refus de progression après sauvegarde échouée ;
- navigation entre panneaux ;
- sélection d'une section depuis la liste et depuis l'aperçu ;
- viewport sur Desktop/Tablet/Mobile ;
- parcours mobile complet ;
- navigation clavier.

### Critères de sortie

L'utilisateur comprend où il se trouve, ce qu'il modifie, comment revenir à l'aperçu et comment accéder aux outils experts. Aucun changement d'interface ne doit réinitialiser les données.

**POINT D'ARRÊT PHASE 2 :** remettre les captures ou preuves d'interface disponibles et le rapport de tests, puis attendre la validation.

---

## PHASE 3 — DESIGN SYSTEM, THÈMES ET COHÉRENCE VISUELLE

### Objectif

Créer une base de design cohérente et personnalisable, sans imposer un style identique à toutes les sections.

### Fichiers à inspecter

- types `CustomPageTheme` et `CustomPageSectionStyles` ;
- `studio-tokens.css` ;
- `ThemeInspectorPanel.tsx` ;
- `ThemeColorPaletteTab.tsx` ;
- `sectorCoherenceDefaults.ts` ;
- `artisticStudioPresets.ts` ;
- fonctions de résolution de style dans les renderers.

### Travaux

1. Inventorier tous les tokens de thème existants.
2. Associer chaque token à ses consommateurs réels.
3. Repérer les couleurs et espacements codés en dur qui contournent le thème.
4. Définir la hiérarchie des valeurs globales et locales.
5. Vérifier la cohérence des boutons, cartes, typographies, rayons et surfaces.
6. Consolider les presets existants plutôt que créer une deuxième bibliothèque.
7. Ajouter ou améliorer les cinq univers Atelier Premium uniquement si les équivalents ne sont pas déjà présents.
8. Préserver les presets sectoriels et les thèmes personnalisés.
9. Permettre un aperçu avant application.
10. intégrer Undo/Redo lors de l'application d'un preset.
11. Vérifier le contraste réel des combinaisons de couleurs.
12. Vérifier que les styles propres à une section survivent à un changement de thème lorsque c'est attendu.

### Tests

- application d'un preset ;
- conservation des contenus ;
- conservation des médias ;
- conservation des overrides ;
- retour arrière ;
- rendu de chaque token dans plusieurs types de section ;
- contraste et lisibilité ;
- absence de couleurs codées en dur non justifiées.

### Critères de sortie

Un thème global influence l'ensemble de la boutique de manière cohérente, sans écraser les réglages locaux ni casser les renderers publics.

**POINT D'ARRÊT PHASE 3 :** ne pas commencer le chantier de tous les éditeurs de section avant validation de la hiérarchie visuelle.

---

## PHASE 4 — OUTILS DE CONSTRUCTION ET INSPECTEUR DES 16 SECTIONS

### Objectif

Rendre l'ajout, l'organisation et l'édition de chaque section complets et cohérents.

### Fichiers à inspecter

- `sectionCatalog.ts` ;
- `SectionTreePanel.tsx` et `SectionCard.tsx` ;
- `AddSectionModal.tsx` ;
- `SectionInspectorPanel.tsx` ;
- `SectionContentTab.tsx` ;
- `SectionStyleTab.tsx` ;
- `SectionLayoutTab.tsx` ;
- `SectionResponsiveTab.tsx` ;
- `SectionAdvancedTab.tsx` ;
- les éditeurs spécialisés dans `components/inspector/content/` ;
- `StoreSectionRenderer.tsx` ;
- tests de construction et de cohérence.

### Travaux

1. Construire une matrice par type : champs, contrôles, renderer, données, états vides, responsive, tests.
2. Comparer `CustomPageSectionType`, `SECTION_CATALOG`, labels, sous-arbres, inspecteurs et renderers.
3. Corriger les types manquants ou incohérents.
4. Garantir qu'un type affiché dans le catalogue possède un comportement de rendu prévu.
5. Améliorer les valeurs de départ par secteur sans créer de données mensongères.
6. Améliorer la recherche et les familles du catalogue.
7. Uniformiser les contrôles communs réellement applicables.
8. Compléter les éditeurs spécialisés section par section.
9. Vérifier les actions ajouter, déplacer, dupliquer, masquer, supprimer et annuler.
10. Ajouter les états vides et les messages d'erreur propres à chaque type.
11. Vérifier qu'aucun champ inutile n'est montré pour un type qui ne l'utilise pas.
12. Ajouter des tests de rendu et de mutation pour chaque type.

### Ordre de traitement conseillé

Après la cartographie, traiter les sections par familles :

1. Bannières et vitrine : Hero, carrousel promotionnel, bandeau cinétique.
2. Catalogue : catégories, collections, nouveautés, produits mis en avant, meilleures ventes, grille produits.
3. Marque : histoire de marque, vidéo.
4. Confiance et contact : avis, livraison, retours, FAQ, pied de page.

Cet ordre est un ordre de travail recommandé, pas une permission de modifier toutes les sections dans une seule intervention. Découper à l'intérieur de la phase si le volume l'exige, mais ne pas déclarer la phase terminée avant la validation de l'ensemble du périmètre convenu.

### Critères de sortie

- les 16 types disposent d'une chaîne cohérente catalogue → modèle → inspecteur → renderer ;
- les actions structurelles fonctionnent ;
- les erreurs et états vides sont visibles ;
- aucune section existante ne perd ses réglages ;
- les tests couvrent chaque famille et les mutations.

**POINT D'ARRÊT PHASE 4 :** fournir une matrice 16/16 et attendre l'accord avant la spécialisation approfondie du Hero ou le travail médias.

---

## PHASE 5 — HERO ATELIER PREMIUM ET RESPONSIVE AVANCÉ

### Objectif

Améliorer les outils de création Hero en s'appuyant sur les cinq renderers actuels, leurs modèles, les palettes et l'adaptateur de normalisation existants.

### Travaux

1. Cartographier les cinq modèles et leurs capacités.
2. Vérifier la correspondance entre identifiants enregistrés et composants.
3. Vérifier les valeurs par défaut et les anciennes configurations.
4. Simplifier la navigation de l'éditeur Hero sans retirer les options nécessaires.
5. Définir les contrôles de composition et les limites de chaque modèle.
6. Améliorer le point focal et le zoom.
7. Définir précisément Gallery et Diptych, y compris les cas image manquante.
8. Rendre les réglages par appareil compréhensibles.
9. Afficher les diagnostics de contraste et de densité du texte.
10. Préserver CTA, liens et résolution des destinations.
11. Vérifier chaque composition dans l'aperçu et la boutique publique.
12. Étendre les tests de compatibilité.

### Limites de périmètre

- ne pas créer un second type de configuration ;
- ne pas créer un second adaptateur de normalisation ;
- ne pas créer une nouvelle série de renderers ;
- ne pas déplacer les cinq renderers publics ;
- ne pas supprimer les modèles historiques sans migration démontrée ;
- ne pas imposer le même réglage à Desktop, Tablet et Mobile lorsque le modèle prévoit des profils indépendants.

### Critères de sortie

Les cinq compositions sont stables, lisibles, modifiables, compatibles avec les anciennes données et fidèles dans les trois viewports.

**POINT D'ARRÊT PHASE 5 :** fournir une grille de comparaison des cinq Hero et attendre la validation avant de développer davantage la bibliothèque média.

---

## PHASE 6 — MÉDIAS, IMAGES, VIDÉOS ET ASSETS

### Objectif

Améliorer l'import, l'organisation, la sélection, l'usage et la protection des médias.

### Travaux

1. Suivre un média depuis l'import jusqu'au stockage et à son rendu.
2. vérifier les règles serveur et le modèle `MediaGalleryItem`.
3. améliorer les dossiers et la recherche ;
4. afficher les métadonnées pertinentes ;
5. détecter les usages réels ;
6. protéger la suppression des médias utilisés ;
7. améliorer les remplacements dans le Hero et les sections ;
8. traiter les images manquantes ;
9. optimiser le chargement et les formats selon la stack actuelle ;
10. vérifier les vidéos séparément des images ;
11. contrôler les permissions et les fichiers orphelins ;
12. ajouter les tests d'upload, de suppression, de remplacement et de récupération.

### Critères de sortie

Aucun média utilisé ne peut être supprimé par inadvertance ; un échec d'import est explicite ; la bibliothèque reste utilisable sur mobile ; les images ne cassent pas la mise en page.

**POINT D'ARRÊT PHASE 6 :** présenter les flux complets d'import et de remplacement, puis attendre l'accord.

---

## PHASE 7 — CATALOGUE, CATÉGORIES ET CONTENUS DYNAMIQUES

### Objectif

Garantir que les sections catalogue affichent les données réelles et restent cohérentes lorsque le catalogue évolue.

### Travaux

1. Cartographier les endpoints et le modèle de produit.
2. vérifier les filtres et alias de catégories réellement pris en charge ;
3. améliorer le sélecteur de produits ;
4. distinguer produits actifs, inactifs et supprimés selon le modèle réel ;
5. contrôler les catégories synchronisées ;
6. différencier sélection manuelle et règles dynamiques ;
7. contrôler les sections nouveautés et meilleures ventes selon la disponibilité réelle des données ;
8. gérer les états sans produit et les erreurs réseau ;
9. traiter les références devenues invalides ;
10. vérifier les performances avec de gros catalogues ;
11. ajouter des tests de cohérence catalogue → section → preview → boutique publique.

### Critères de sortie

Les sections dynamiques reflètent les vraies données, n'inventent aucun classement et gèrent correctement les changements de catalogue.

**POINT D'ARRÊT PHASE 7 :** remettre la matrice de données et les tests de catalogue, puis demander validation.

---

## PHASE 8 — APERÇU, RENDU PUBLIC ET RESPONSIVE FINAL

### Objectif

Assurer la fidélité entre le Studio et la boutique publique, et corriger les différences de comportement par appareil.

### Travaux

1. Comparer `LiveCanvasPreview`, `StudioPreview` et `StoreSectionRenderer`.
2. vérifier la boutique publique qui consomme les renderers partagés ;
3. éliminer les règles de style dupliquées non nécessaires ;
4. vérifier les 16 types sur Desktop, Tablet et Mobile ;
5. vérifier les interactions en mode preview ;
6. vérifier les ancres, CTA et navigations ;
7. tester les images, ratios, titres longs et états vides ;
8. vérifier les sections masquées ;
9. mesurer les régressions de performance ;
10. ajouter des tests de rendu partagé et des tests E2E ciblés.

### Critères de sortie

Un même contenu donne un résultat cohérent dans l'aperçu et dans la boutique publique, avec des écarts uniquement lorsqu'ils sont intentionnels et documentés.

**POINT D'ARRÊT PHASE 8 :** fournir les captures comparatives ou les preuves de test disponibles et attendre la validation.

---

## PHASE 9 — QUALITÉ, PRÉPUBLICATION, PUBLICATION ET HISTORIQUE

### Objectif

Faire du diagnostic qualité et de la publication un véritable processus de contrôle, compréhensible et sûr.

### Fichiers à inspecter

- `storeQualityAuditor.ts` ;
- `publishReadinessChecks.ts` ;
- modale de publication existante ;
- `useSellerStudio.ts` ;
- contrôleur et service backend ;
- endpoints de publication, historique et rollback ;
- tests de publication.

### Travaux

1. Cartographier les contrôles de qualité et leur score.
2. distinguer blocages et avertissements ;
3. relier chaque problème au panneau qui permet de le corriger ;
4. éviter les suggestions de correction qui inventent des données ;
5. vérifier que le catalogue en erreur est signalé comme non vérifié ;
6. vérifier que le brouillon est enregistré avant publication ;
7. vérifier la révision exacte publiée ;
8. empêcher les doubles clics et les doubles requêtes ;
9. garder le contexte visible lorsque la publication échoue ;
10. confirmer la publication à partir de la réponse serveur ;
11. vérifier l'invalidation cache et la disponibilité de la boutique publique ;
12. vérifier historique, résumé et rollback si supportés ;
13. tester les conflits et les versions concurrentes.

### Critères de sortie

Le vendeur sait ce qui bloque, ce qui est recommandé et ce qui sera publié. Le statut publié correspond au résultat réel du serveur.

**POINT D'ARRÊT PHASE 9 :** fournir le parcours publication et rollback testé, puis attendre l'accord.

---

## PHASE 10 — VALIDATION TRANSVERSALE, ACCESSIBILITÉ, PERFORMANCE ET LIVRAISON

### Objectif

Vérifier l'ensemble du Studio après les phases acceptées, corriger les régressions et remettre un dossier de livraison clair.

### Travaux

1. Exécuter les tests unitaires et d'intégration pertinents.
2. exécuter les tests Studio dédiés ;
3. exécuter les tests E2E des parcours essentiels ;
4. exécuter les vérifications TypeScript client et serveur ;
5. exécuter ESLint ;
6. exécuter le build ;
7. tester Desktop, Tablet et Mobile ;
8. tester les modes guidé et expert ;
9. tester au moins un parcours complet de vendeur avec catalogue chargé ;
10. tester un parcours avec catalogue vide ;
11. tester un parcours avec erreur réseau ;
12. tester la récupération après sauvegarde échouée ;
13. tester la publication et le retour à une version antérieure si disponible ;
14. vérifier accessibilité clavier et focus ;
15. vérifier les performances avec un catalogue significatif ;
16. inspecter les erreurs console et serveur ;
17. contrôler les permissions et l'absence de fuite de données ;
18. vérifier les traductions touchées ;
19. vérifier les fichiers modifiés et supprimer les changements de debug ;
20. rédiger le rapport final.

### Livrables

- résumé exécutif ;
- matrice des fonctionnalités couvertes ;
- liste des commits ou fichiers modifiés ;
- résultats exacts des commandes ;
- tests passés et échoués ;
- captures ou preuves disponibles ;
- points non traités ;
- risques résiduels ;
- recommandations de maintenance.

### Critères de sortie

Aucune régression bloquante connue ne subsiste. Les limites restantes sont explicites. Le propriétaire sait ce qui a réellement été livré.

**POINT D'ARRÊT PHASE 10 :** remettre le rapport final et attendre la décision du propriétaire avant toute autre évolution.

---

# 11. MATRICE DE VALIDATION COMMUNE À CHAQUE PHASE

À chaque phase, l'IA doit compléter le tableau suivant. Utiliser `N/A` avec justification lorsqu'un point ne s'applique pas.

| Domaine | À vérifier | Résultat attendu | Statut |
|---|---|---|---|
| Code | Fichiers réellement présents | Aucun chemin supposé | À compléter |
| Types | Types et schémas | Pas de modèle concurrent | À compléter |
| Données | Données réelles | Aucun faux contenu | À compléter |
| Desktop | Largeur et interactions | Utilisable et fidèle | À compléter |
| Tablette | Navigation et composition | Aucun panneau inutilisable | À compléter |
| Mobile | Navigation et commandes | Actions accessibles | À compléter |
| Sauvegarde | État et révision | Statut réel | À compléter |
| Undo/Redo | Actions concernées | Annulation cohérente | À compléter |
| Erreurs | Réseau, validation, média | Messages exploitables | À compléter |
| Accessibilité | Clavier, focus, labels | Parcours compréhensible | À compléter |
| Performance | Rendus et chargements | Pas de régression évitable | À compléter |
| Tests | Suites pertinentes | Résultats réels et reportés | À compléter |
| Boutique publique | Renderer partagé | Pas de divergence accidentelle | À compléter |
| Sécurité | API et permissions | Contrôles serveur conservés | À compléter |

---

# 12. FORMAT OBLIGATOIRE DU RAPPORT À LA FIN DE CHAQUE PHASE

L'IA doit répondre avec cette structure, sans la remplacer par un simple résumé vague.

## 12.1 Résumé de la phase

- Phase exécutée :
- Commit de départ :
- Commit de fin :
- Objectif :
- Résultat général : terminé / partiellement terminé / bloqué.

## 12.2 Fichiers inspectés et modifiés

| Fichier | Action | Pourquoi | Risque / impact |
|---|---|---|---|
| chemin exact | inspecté / créé / modifié / supprimé | justification | impact |

Ne liste que les fichiers réellement touchés. Si un fichier a seulement été lu, ne le présente pas comme modifié.

## 12.3 Fonctionnalités

Pour chaque fonctionnalité :

- comportement avant ;
- comportement après ;
- résultat observé ;
- preuve ;
- cas non traités.

## 12.4 Tests et commandes

| Commande / test | Exécuté ? | Résultat exact | Commentaire |
|---|---|---|---|

Ne coche pas une commande qui n'a pas été lancée. Distingue « non exécuté », « échoué » et « bloqué par l'environnement ».

## 12.5 Contrôles visuels et parcours

Préciser les appareils, les tailles de viewport et les parcours réellement essayés. Inclure des captures uniquement si elles existent réellement.

## 12.6 Risques et dette restante

Classer chaque point en :

- **Critique** : risque de perte de données, sécurité, publication incorrecte ou indisponibilité ;
- **Élevé** : fonctionnalité centrale cassée ou forte régression UX ;
- **Moyen** : cas limite important ou incohérence notable ;
- **Faible** : amélioration non bloquante.

## 12.7 Décision demandée

Terminer avec une question courte et une seule demande de décision :

> « Valides-tu cette phase et m'autorises-tu à commencer la phase suivante, ou souhaites-tu d'abord corriger certains points ? »

Puis s'arrêter. Ne pas commencer la phase suivante dans la même réponse.

---

# 13. COMMANDES ET CONTRÔLES TECHNIQUES DE RÉFÉRENCE

Ces commandes ont été retrouvées dans le `package.json` du dépôt pendant la préparation. L'IA doit d'abord vérifier qu'elles existent toujours et choisir les commandes adaptées au périmètre.

```bash
npm run test
npm run typecheck
npm run typecheck:client
npm run typecheck:node
npm run lint
npm run build
npm run test:e2e
```

Ne lance pas systématiquement la suite la plus lourde après chaque petit changement si une sélection de tests ciblés est plus adaptée. En revanche, les validations globales doivent être prévues avant la livraison finale.

Pour les tests Vitest ciblés, utiliser la commande et le chemin qui correspondent réellement à la configuration présente, par exemple :

```bash
npx vitest run src/tests/studioSaveManager.test.ts
npx vitest run src/tests/studioProgressiveWorkflow.test.tsx
npx vitest run src/tests/heroBannerModelsAndResponsive.test.tsx
```

Si l'environnement ne possède pas les dépendances, ne prétends pas que les tests ont réussi. Indique ce qui manque et fournis une commande reproductible.

---

# 14. CE QUI NE DOIT PAS ÊTRE FAIT SANS ACCORD EXPLICITE

- reconstruire l'ensemble du Studio ;
- remplacer la stack technique ;
- changer le système de données ou les endpoints fondamentaux ;
- lancer une migration persistée des boutiques ;
- supprimer les anciennes propriétés de configuration ;
- retirer un type de section ;
- supprimer un modèle Hero historique ;
- remplacer `normalizeHeroSettingsAdapter()` par une nouvelle abstraction parallèle ;
- créer une seconde série de renderers publics ;
- modifier la boutique publique en dehors du périmètre validé ;
- ajouter des données de démonstration dans des boutiques réelles ;
- modifier les permissions de publication ;
- exposer un écrasement forcé des révisions ;
- supprimer des médias ou données historiques ;
- changer le parcours guidé de quatre étapes sans analyse et validation ;
- réécrire les fichiers Markdown historiques pour faire croire qu'ils reflètent le code ;
- continuer à la phase suivante sans validation du propriétaire.

---

# 15. PRIORITÉS EN CAS DE CONFLIT

Lorsque plusieurs objectifs entrent en conflit, respecter cet ordre :

1. sécurité et intégrité des données ;
2. conservation des boutiques existantes ;
3. fiabilité de sauvegarde et publication ;
4. cohérence du rendu public ;
5. accessibilité et responsive ;
6. clarté et facilité d'utilisation ;
7. qualité visuelle ;
8. confort développeur et refactorisations internes.

Une animation plus élégante ne justifie jamais une régression de sauvegarde. Un nouveau preset ne justifie jamais la perte des réglages personnalisés. Une simplification du code ne justifie jamais une migration risquée non validée.

---

# 16. DÉFINITION DE LA RÉUSSITE DU PROJET

Olmart Studio Atelier Premium sera considéré comme ayant atteint son objectif lorsque :

- un vendeur débutant peut construire une boutique sans aide technique permanente ;
- un vendeur avancé garde accès aux réglages experts ;
- les sections ont des outils spécialisés adaptés à leur rôle ;
- le design global est cohérent et personnalisable ;
- les cinq compositions Hero sont maîtrisables et robustes ;
- les médias et les données du catalogue sont fiables ;
- les aperçus reflètent correctement la boutique publique ;
- les trois formats Desktop, Tablette et Mobile sont réellement travaillés ;
- les sauvegardes, conflits, récupérations et annulations sont fiables ;
- les contrôles prépublication sont compréhensibles et exacts ;
- la publication est confirmée par le serveur ;
- les boutiques historiques continuent de fonctionner ;
- chaque phase a été validée par le propriétaire avant de poursuivre ;
- le code reste maintenable et les tests protègent les fonctionnalités essentielles.

Le niveau « Premium » ne signifie pas ajouter le maximum d'options. Il signifie offrir des outils précis, cohérents, fiables et agréables à utiliser, sans surcharge inutile.

---

# 17. MESSAGE DE DÉMARRAGE À COPIER DANS L'IA DE DÉVELOPPEMENT

```text
Tu dois appliquer le document OLMART_STUDIO_ATELIER_PREMIUM_V3_2_CAHIER_DES_CHARGES_PHASES.md.

Commence UNIQUEMENT par la PHASE 0 — AUDIT RÉEL, CARTOGRAPHIE ET PLAN DE RISQUE.

Je ne t'autorise pour l'instant à modifier aucun fichier. Tu dois inspecter le dépôt actuel, pas te baser sur les anciens fichiers Markdown comme source de vérité. Les références et chemins donnés dans le cahier des charges sont des points de départ à vérifier, pas une permission de supposer que le code n'a pas changé.

Je veux un audit concret : chemins exacts, composants existants, types, hooks, routes API, services, renderers, tests, problèmes confirmés, risques et ordre de priorité. N'invente aucun résultat et n'affirme pas avoir exécuté une commande si tu ne l'as pas exécutée.

À la fin, remets le rapport selon le format obligatoire du chapitre 12, propose un ordre de travail ajusté si nécessaire, puis ARRÊTE-TOI. Attends ma validation avant toute modification et avant de commencer la Phase 1.
```

---

# 18. REPÈRES DE SOURCES DU DÉPÔT À REVALIDER

Cette liste sert à retrouver les zones importantes. Elle ne remplace pas la lecture du code courant.

- Dépôt : https://github.com/Laifa-ait/Laifa-ait-3
- Workspace : `src/pages/Seller/StoreBuilder/StudioWorkspace.tsx`
- Layout : `src/pages/Seller/StoreBuilder/components/studio/StudioColumnsLayout.tsx`
- Store Zustand : `src/pages/Seller/StoreBuilder/store/useStudioStore.ts`
- Types du store : `src/pages/Seller/StoreBuilder/store/studioStore.types.ts`
- Orchestration vendeur : `src/pages/Seller/StoreBuilder/hooks/useSellerStudio.ts`
- Sauvegarde : `src/pages/Seller/StoreBuilder/hooks/useStudioSaveManager.ts`
- Undo/Redo : `src/pages/Seller/StoreBuilder/hooks/useStudioUndoRedo.ts`
- Catalogue chargé : `src/pages/Seller/StoreBuilder/hooks/studioCatalogLoader.ts`
- Catalogue sections : `src/pages/Seller/StoreBuilder/constants/sectionCatalog.ts`
- Types sections : `src/domains/seller/customPage.types.ts`
- Inspecteur : `src/pages/Seller/StoreBuilder/components/inspector/SectionInspectorPanel.tsx`
- Bibliothèque médias : `src/pages/Seller/StoreBuilder/components/context/MediaInspectorPanel.tsx`
- Audit qualité : `src/pages/Seller/StoreBuilder/utils/storeQualityAuditor.ts`
- Prépublication : `src/pages/Seller/StoreBuilder/utils/publishReadinessChecks.ts`
- Renderer public : `src/components/Store/sections/StoreSectionRenderer.tsx`
- Renderer Hero : `src/components/Store/sections/SectionHeroBanner.tsx`
- Helper Hero : `src/components/Store/sections/hero/heroResponsiveHelper.ts`
- Modèles Hero : `src/pages/Seller/StoreBuilder/constants/heroBannerModels.ts`
- Tests workflow : `src/tests/studioProgressiveWorkflow.test.tsx`
- Tests Hero : `src/tests/heroBannerModelsAndResponsive.test.tsx`
- Tests outils de construction : `src/tests/studioPhase4ConstructionTools.test.tsx`
- Tests moteur de sauvegarde : `src/tests/studioSaveManager.test.ts`
- Tests publication/moteur : `src/tests/sellerStudioPhase1Engine.test.ts`

**Fin du cahier des charges maître V3.2.**
