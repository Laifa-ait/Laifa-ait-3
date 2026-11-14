import { StudioNavMode } from "./studio.types";

export interface StudioJourneyStepMeta {
  step: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  defaultNav: StudioNavMode;
  subLinks: Array<{ id: StudioNavMode; label: string }>;
}

export const STUDIO_JOURNEY_STEPS: StudioJourneyStepMeta[] = [
  {
    step: 1,
    title: "Identité & En-tête",
    subtitle: "Nom, slug et menu principal",
    defaultNav: "identity",
    subLinks: [
      { id: "identity", label: "Identité" },
      { id: "header", label: "Menu & En-tête" },
    ],
  },
  {
    step: 2,
    title: "Thème & Couleurs",
    subtitle: "Palette, typographie et textures",
    defaultNav: "theme",
    subLinks: [
      { id: "theme", label: "Thème" },
      { id: "atelier", label: "Atelier" },
    ],
  },
  {
    step: 3,
    title: "Sections Vitrine",
    subtitle: "Blocs et contenu de l'accueil",
    defaultNav: "sections",
    subLinks: [
      { id: "sections", label: "Blocs Accueil" },
      { id: "media", label: "Médias" },
    ],
  },
  {
    step: 4,
    title: "Commerce & Pages",
    subtitle: "Livraison, catalogue et suivi",
    defaultNav: "settings",
    subLinks: [
      { id: "settings", label: "Livraison" },
      { id: "catalog", label: "Catalogue" },
      { id: "pages", label: "Pages" },
      { id: "orders", label: "Commandes" },
    ],
  },
];

export const EXPERT_NAV_GROUPS: Array<{
  title: string;
  items: Array<{ id: StudioNavMode; label: string }>;
}> = [
  {
    title: "Apparence",
    items: [
      { id: "sections", label: "Sections" },
      { id: "theme", label: "Thème" },
      { id: "atelier", label: "Atelier" },
      { id: "header", label: "En-tête" },
      { id: "identity", label: "Identité" },
      { id: "pages", label: "Pages" },
    ],
  },
  {
    title: "Commerce & Médias",
    items: [
      { id: "catalog", label: "Catalogue" },
      { id: "media", label: "Médias" },
      { id: "settings", label: "Livraison & SEO" },
      { id: "orders", label: "Commandes" },
      { id: "launchpad", label: "Check-list" },
    ],
  },
];
