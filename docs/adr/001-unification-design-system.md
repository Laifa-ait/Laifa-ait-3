# ADR 001: Unification du Design System & Charte Mindazzle Twilight

## Statut
Accepté & Mis à jour (2026-11-12)

## Contexte
L'application présentait historiquement une fragmentation visuelle entre d'anciennes classes utilitaires disparates (`slate-*`, `emerald-*`, `zinc-*`, `rose-*`) et la charte identitaire d'Olmart définie dans `src/index.css`, ainsi que des textes français codés en dur qui brisaient l'expérience multilingue (`fr`, `ar`, `en`).

## Décision
1. **Unification Chromatique (Mindazzle Twilight & Sunset Amber)** :
   - Toute la marketplace publique (`Home.tsx`, `BentoHero`, `NeoCategoryGrid`, `CategoryCard`, `SponsoredSection`, `SponsoredProductCard`, `DynamicSection`, `SectionHeader`, `SectionLayouts`, `HomeEndlessGrid`, `ProductCard`) est consolidée autour des 6 tokens maîtres de `src/index.css` :
     - `#1A1836` (*Midnight Indigo*) — Encre principale & surfaces sombres
     - `#42164B` (*Royal Aubergine*) — Surfaces profondes & bordures actives
     - `#622347` (*Rich Mulberry*) — Couleur interactive primaire
     - `#A54055` (*Crimson Berry*) — Badges de remise & accents secondaires
     - `#E99856` (*Sunset Amber*) — Accents chauds, étoiles & CTA Hero
     - `#E0B4B2` (*Blush Rose*) & `#FAF7F6` / `#EFE6E6` — Bordures douces & fond ivoire chaud
2. **Typographie 2+1 & Support RTL Arabe** :
   - Standardisation sur `Plus Jakarta Sans` (`--font-sans`), `Playfair Display` (`--font-display`), `JetBrains Mono` (`--font-mono`) et bascule automatique sur `Cairo` en mode RTL (`html[dir="rtl"]`).
3. **Zéro Code Dur & Parité Trilingue (FR / AR / EN)** :
   - Synchronisation systématique des dictionnaires via `src/locales/homeTranslations.ts` et `public/locales/{fr,ar,en}.json`.

## Conséquences
- **Positif** : Cohérence visuelle totale sur la page d'accueil, lisibilité optimale (WCAG AA), support complet de l'arabe (RTL) et de l'anglais sans chaînes françaises résiduelles.
- **Vérification** : Couvert par la suite de tests automatisés `src/tests/homePageTranslationsAndColors.test.tsx`.
