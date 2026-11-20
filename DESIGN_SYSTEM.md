# OLMART — Design System
## Source de vérité visuelle & Architecture de la Page d'Accueil

---

## 1. Identité Visuelle : Palette « Émeraude & Porcelaine d'Alger » (Règle 60-30-10)

Direction artistique lumineuse, contemporaine et méditerranéenne : un fond minéral clair à haute respirabilité (`60 %`), structuré par une encre Obsidienne Marine et un Vert Émeraude profond inspirant la confiance (`30 %`), ponctué d'accents Ambre Saharien réservés aux appels à l'action clés (`10 %`).

### Palette Principale (`src/index.css`)

| Rôle (60-30-10) | Token | Hex | Variable CSS | Usage |
|-----------------|-------|-----|--------------|-------|
| **60 % Fond** | `surface-subtle` | `#F7F8F6` | `--color-surface-subtle` | Fond de page principal (*Porcelaine Minérale*) |
| **60 % Fond** | `surface` | `#FFFFFF` | `--color-surface` | Cartes produits, barre de navigation, conteneurs de sections |
| **60 % Fond** | `surface-muted` | `#EFF3F1` | `--color-surface-muted` | Sections alternées (`SponsoredSection`), squelettes de chargement, fonds photo (`#F2F5F3`) |
| **60 % Structure** | `border-subtle` | `#E3E9E5` | `--color-border-subtle` | Bordures hairline de cartes et séparateurs |
| **60 % Structure** | `border-strong` | `#D4DFD9` | `--color-border-strong` | Bordures de section et survols discrets (`#C3D3CB`) |
| **30 % Encre & Marque** | `brand-obsidian` | `#0F1B1D` | `--color-brand-obsidian` | Encre principale, top bar utilitaire, footer (`#0C1719` → `#060C0D`), cadre Hero |
| **30 % Encre & Marque** | `brand-primary` | `#0D5C4B` | `--color-brand-primary` | Couleur interactive primaire (*Émeraude Méditerranéenne*), CTA principaux, hover de titres, icônes actives |
| **30 % Encre & Marque** | `brand-primary-hover` | `#084236` | `--color-brand-primary-hover` | État survol / actif des boutons primaires (*Émeraude Forêt*) |
| **30 % Encre & Marque** | `brand-primary-soft` | `#E9F4F1` | `--color-brand-primary-soft` | Surbrillance douce, fonds de sélection actifs |
| **30 % Encre & Marque** | `text-secondary` | `#2E4144` | `--color-text-secondary` | Textes secondaires lisibles |
| **30 % Encre & Marque** | `text-muted` | `#5F7073` | `--color-text-muted` | Sous-titres, libellés de catégories, métadonnées |
| **30 % Encre & Marque** | `text-subtle` | `#839497` | `--color-text-subtle` | Prix barrés, états vides, placeholders |
| **10 % Accent** | `brand-amber` | `#E59A42` | `--color-brand-amber` | Accent lumineux (*Ambre Saharien*) : CTA Hero, bouton « Vendre sur Olmart », étoiles d'avis, indicateurs actifs |
| **10 % Accent** | `brand-ruby` | `#C83E4D` | `--color-brand-ruby` | Micro-étiquettes de remise (`-XX%`), pastilles favoris / alertes |

### Dégradés & Voiles Signatures

```css
/* Bouton primaire Émeraude */
btn-primary: #0D5C4B -> hover #084236;

/* Accent CTA Hero Ambre Saharien */
cta-amber: #E59A42 -> hover #EDAB59 (texte #0F1B1D);

/* Voile directionnel Hero pour lisibilité typographique (sans ternir la photo) */
hero-scrim-x: linear-gradient(100deg, rgba(15,27,29,0.92) 0%, rgba(15,27,29,0.68) 42%, rgba(15,27,29,0.12) 100%);

/* Ruban supérieur du Footer */
footer-top-ribbon: linear-gradient(to right, #0D5C4B, #1B7A63, #E59A42);
```

---

## 2. Typographie (Règle 2+1 Éditoriale & Support RTL Arabe)

### Polices (`src/index.css`)
- **Principale UI (`--font-sans`)** : `"Plus Jakarta Sans", "Cairo", ui-sans-serif, system-ui, sans-serif`
- **Éditoriale / Titres (`--font-display`)** : `"Playfair Display", "Cormorant Garamond", Georgia, serif` (`text-wrap: balance` sur les grands titres)
- **Chiffres, Prix & Index (`--font-mono`)** : `"JetBrains Mono", ui-monospace, monospace` avec `tabular-nums` systématique
- **Arabe (`html[dir="rtl"]`)** : `"Cairo", sans-serif` appliqué automatiquement sur `--font-sans` et `--font-display`

---

## 3. Architecture & Composants de la Page d'Accueil (`Home.tsx`)

### A. Alignement Global & Rythme Spatial
- **Largeur unifiée** : Tous les grands blocs de la page d'accueil (Navbar, Carrousel Hero, Grille des Départements, Sélection Sponsorisée, Sections Dynamiques, Grille Infinie et Footer) partagent un conteneur strictement aligné à **`max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8`**.
- **Discipline éditoriale stricte (Zéro contenu inventé)** : Aucune promesse commerciale non validée, aucune statistique fictive, aucun bloc marketing inventé n'est ajouté. La page affiche exclusivement les données réelles de la plateforme et préserve intégralement les mentions légales d'intermédiation existantes.
- **Zéro surcharge de pilules (« Zero-Pill Discipline »)** : Les sur-titres de sections, méta-tags éditoriaux (`01 · INTÉRIEUR & DESIGN`), mentions légales et notes d'avis sont présentés en typographie nue et nette (sans capsules `rounded-full` décoratives ni points animés `animate-pulse`).

### B. Barre de Navigation & Recherche (`Navbar.tsx`, `NavbarTopUtilityBar.tsx`, `AdvancedSearchbar.tsx`, `CurvedBottomNav.tsx`)
- **Barre utilitaire supérieure** : Fond `#0F1B1D`, états actifs `#0D5C4B`, appel vendeur en `#E59A42`.
- **Barre principale** : Fond blanc translucide `bg-white/95`, emblème dégradé Émeraude (`from-[#0D5C4B] to-[#084236]`) avec icône Ambre, recherche `#F4F6F4` avec focus anneau `#0D5C4B`.
- **Navigation mobile basse (`CurvedBottomNav.tsx`)** : Barre blanche à découpe liquide bordée de `#D4DFD9`, bulle active dégradée Émeraude (`#1B7A63` → `#0D5C4B` → `#084236`), pastilles `#C83E4D`.

### C. Carrousel Hero (`BentoHero.tsx` & `BentoHeroSlide.tsx`)
- **Visuel par défaut local** : Utilise l'illustration éditoriale locale `/src/assets/images/olmart_hero_flagship_1795059554378.jpg` (aucune dépendance fragile à une image Unsplash externe pour le hero par défaut).
- **Conteneur** : `rounded-3xl bg-[#0F1B1D] border border-[#D4DFD9] shadow-[0_24px_48px_-16px_rgba(15,27,29,0.22)]`.
- **Hiérarchie** : Sur-titre nu (`·`), titre `Playfair Display` équilibré, CTA principal `#E59A42` (`text-[#0F1B1D]`), flèches survol `#0D5C4B`, barre de progression active `#E59A42`.

### D. Grille des Départements (`NeoCategoryGrid.tsx`, `CategoryCard.tsx`, `categoryThemes.ts`)
- **Cartes éditoriales simple élévation** : Suppression des doubles cadres sombres imbriqués. Photographie plein cadre lumineuse, voiles de contraste haut/bas mesurés, index monospace nu (`01 · ...`), filet d'accent `#E59A42` ou `#3DA88D`, flèche de révélation Émeraude/Ambre au survol et fallback dégradé + icône en cas d'erreur d'image.

### E. Cartes Produits & Sélection Sponsorisée (`ProductCard.tsx`, `SponsoredSection.tsx`, `SponsoredProductCard.tsx`)
- **Surface produit** : Fond blanc pur `#FFFFFF` sur toile `#F7F8F6`, scène photo `#F2F5F3`, bordure `border-[#E3E9E5] hover:border-[#C3D3CB]`.
- **Étiquettes rectangulaires nettes (`rounded-md`)** : Remise `bg-[#C83E4D]`, étiquette sponsorisée `bg-[#0F1B1D]/88 text-[#E59A42]`.
- **Prix & Note** : Prix en `#0F1B1D font-mono tabular-nums`, étoile `#E59A42` sans bordure superflue, titre survol `#0D5C4B`.

### F. Sections Dynamiques, Grille Infinie & Pied de Page (`DynamicSection.tsx`, `SectionHeader.tsx`, `SectionLayouts.tsx`, `HomeEndlessGrid.tsx`, `Footer.tsx`)
- **En-têtes de section** : Sur-titre éditorial nu, titre `Playfair Display`, séparateur hairline `#E3E9E5`, bouton rectangulaire `rounded-xl`.
- **Squelettes** : Unifiés sur `#EFF3F1`.
- **Bouton « Charger plus »** : Émeraude solide `bg-[#0D5C4B] hover:bg-[#084236]`.
- **Pied de page** : Fond Obsidienne profond `#0C1719` → `#060C0D`, ruban fin supérieur Émeraude-Ambre, contraste texte `#B8C8C4`, mention légale d'intermédiation épurée.

---

## 4. Architecture du Studio Vendeur — Acte 1 : Hero Scénographique (5 Styles Isolés)

Le système de bannière des boutiques vendeurs repose sur **5 composants architecturaux isolés** (`src/components/Store/sections/hero/`) et un contenu minimaliste pur (**1 Titre**, **1 Petite phrase explicative**, **1 Seul Bouton d'action**) :
1. **`HeroFullBleed`** (`cinema-full` / `full-bleed`) : Plein cadre 100 % surface avec voile dégradé radial doux localisé sous l'écriture.
2. **`HeroSplit`** (`editorial-split` / `split`) : 2 blocs distincts côte-à-côte (`50/50`, `60/40`, `70/30`), zéro texte sur la photo.
3. **`HeroArch`** (`arch-palace` / `arch`) : Découpe géométrique organique (**Arche Romaine**, **Capsule Oblongue**, **Feuille Asymétrique**, **Cadre Flottant**).
4. **`HeroGallery`** (`atelier-collage` / `gallery`) : Marge intérieure uniforme (*Passe-partout* de `16px` à `48px`) et cartouche typographique épuré.
5. **`HeroDiptych`** (`bento-hero` / `diptych`) : Exposition simultanée de 2 photographies complémentaires côte-à-côte (gap réglable de `8px` à `32px`).

---

## 5. Règles Absolues

1. **Zéro texte codé en dur** : Tout texte visible ou `aria-label` doit passer par `react-i18next` (`t()`) et être présent dans les 3 langues (`fr`, `ar`, `en`).
2. **Cohérence chromatique stricte** : Utiliser exclusivement les tokens de la palette **Émeraude & Porcelaine d'Alger** sur la marketplace publique (`#F7F8F6`, `#FFFFFF`, `#EFF3F1`, `#0F1B1D`, `#0D5C4B`, `#E59A42`, `#C83E4D`).
3. **Zéro ajout non assumé** : Ne jamais introduire de promesses commerciales, chiffres inventés, garanties fictives ou sections marketing non demandées.
4. **Support RTL natif** : Utiliser les propriétés logiques (`start-*`, `end-*`, `ms-*`, `me-*`) et gérer l'inversion directionnelle des carrousels lorsque `dir="rtl"`.
5. **Limite stricte de 250 lignes par fichier** : Chaque composant ou module de logique doit rester sous la barre des 250 lignes.
