# OLMART — Design System
## Source de vérité pour la génération de composants et pages

---

## 1. Identité Visuelle (Palette Mindazzle Twilight & Sunset Amber)

### Palette Principale (`src/index.css`)

| Token | Hex | Variable CSS | Usage |
|-------|-----|--------------|-------|
| `brand-midnight` | `#1A1836` | `--color-brand-midnight` | Encre principale, surfaces sombres architecturales, titres |
| `brand-aubergine` | `#42164B` | `--color-brand-aubergine` | Surfaces profondes de marque, états actifs, bordures sombres |
| `brand-primary` | `#622347` | `--color-brand-primary` | Couleur interactive primaire (Rich Mulberry), hover de titres |
| `brand-crimson` | `#A54055` | `--color-brand-crimson` | Accents secondaires vibrants, badges de remise (`-XX%`), alertes |
| `brand-amber` | `#E99856` | `--color-brand-amber` | Accent chaud luxe (Sunset Amber), CTA Hero, étoiles d'avis, puces |
| `brand-blush` | `#E0B4B2` | `--color-brand-blush` | Reflets doux (Blush Rose), bordures au survol, sous-titres sur fond sombre |
| `surface-subtle` | `#FAF7F6` | `--color-surface-subtle` | Fond de page principal (Warm Ivory Canvas) |
| `surface` | `#FFFFFF` | `--color-surface` | Cartes produits, modales, conteneurs de sections |
| `surface-muted` | `#F4EDED` | `--color-surface-muted` | Sections alternées (ex: `SponsoredSection`), squelettes de chargement |
| `border-subtle` | `#EFE6E6` | `--color-border-subtle` | Bordures subtiles de cartes, séparateurs de sections |
| `text-primary` | `#1A1836` | `--color-text-primary` | Titres, prix, textes principaux |
| `text-muted` | `#6E5A6F` | `--color-text-muted` | Sous-titres, catégories, méta-textes |
| `text-subtle` | `#9B879C` | `--color-text-subtle` | Prix barrés, états vides, placeholders |
| `brand-trust` | `#059669` | `--color-brand-trust` | Succès, stock disponible, badges certifiés |

### Dégradés Signatures

```css
btn-primary-gradient: linear-gradient(to right, #42164B, #622347, #A54055);
cta-amber-gradient: linear-gradient(to right, #E99856, #f0aa6e);
hero-overlay-gradient: linear-gradient(to top, #1A1836 0%, #1A183699 45%, transparent 100%);
```

---

## 2. Typographie (Règle 2+1 Luxe & Support RTL Arabe)

### Polices (`src/index.css`)
- **Principale (`--font-sans`)** : `"Plus Jakarta Sans", "Cairo", ui-sans-serif, system-ui, sans-serif`
- **Éditoriale / Titres (`--font-display`)** : `"Playfair Display", "Cormorant Garamond", Georgia, serif`
- **Chiffres & Prix (`--font-mono`)** : `"JetBrains Mono", ui-monospace, monospace` (`tabular-nums`)
- **Arabe (`html[dir="rtl"]`)** : `"Cairo", sans-serif` appliqué automatiquement sur `--font-sans` et `--font-display`

---

## 3. Composants de la Page d'Accueil (`Home.tsx`)

### A. Carrousel Hero (`BentoHero.tsx` & `BentoHeroSlide.tsx`)
- Conteneur : `rounded-3xl bg-[#1A1836] border border-[#42164B]/30 shadow-[0_20px_48px_-12px_rgba(26,24,54,0.22)]`
- Bouton d'action principal : `bg-gradient-to-r from-[#E99856] to-[#f0aa6e] text-[#1A1836] font-extrabold rounded-xl`
- Badge de remise : `bg-[#A54055] text-white` avec icône `Sparkles` en `#E99856`
- Indicateurs de diapositives : pilule active `bg-[#E99856]`, inactive `bg-[#E0B4B2]/45`

### B. Grille des Départements (`NeoCategoryGrid.tsx` & `CategoryCard.tsx`)
- En-tête éditorial : puce `#E99856`, sur-titre `text-[#A54055]`, titre `text-[#1A1836]`, bordure `border-[#EFE6E6]`
- Carte de rayon (`CategoryCard`) : cadre architectural `bg-[#1A1836] border-[#42164B]/25 hover:border-[#E99856]/70`, photographie plein cadre lumineuse, badge d'index `/01` en `#E99856` et tag d'édition traduit (`cat_tag.*`)

### C. Sélection Sponsorisée (`SponsoredSection.tsx` & `SponsoredProductCard.tsx`)
- Section : `bg-[#F4EDED]/65 border-y border-[#EFE6E6]`
- Badge Sponsorisé : `bg-[#FDF4EC] text-[#622347] border border-[#E99856]/40` (en-tête) et `bg-[#1A1836]/85 text-[#E0B4B2]` (carte)
- Carte Produit Sponsorisé : alignée sur `ProductCard` (`border-[#EFE6E6] hover:border-[#E0B4B2]`, remise `bg-[#A54055]`, prix `text-[#1A1836] font-mono tabular-nums` formaté via `formatPrice()`)

### D. Sections Dynamiques & Grille Infinie (`DynamicSection.tsx`, `SectionLayouts.tsx`, `HomeEndlessGrid.tsx`)
- Conteneur de section : `bg-white rounded-3xl border border-[#EFE6E6] shadow-[0_2px_12px_rgba(26,24,54,0.04)]`
- Squelettes de chargement : `bg-[#EFE6E6]/70` et `bg-[#F4EDED]` (aucune classe `slate-*` ou `zinc-*` disparate)
- Bouton `"Afficher plus d'articles"` : `bg-gradient-to-r from-[#42164B] via-[#622347] to-[#A54055]`

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
2. **Cohérence chromatique stricte** : Utiliser exclusivement les tokens de la palette **Mindazzle Twilight & Sunset Amber** sur la marketplace publique (aucun mélange accidentel avec `slate-*`, `emerald-*` ou `zinc-*`).
3. **Support RTL natif** : Utiliser les propriétés logiques (`start-*`, `end-*`, `ms-*`, `me-*`) et gérer l'inversion directionnelle des carrousels lorsque `dir="rtl"`.
4. **Limite stricte de 250 lignes par fichier** : Chaque composant ou module de logique doit rester sous la barre des 250 lignes.
