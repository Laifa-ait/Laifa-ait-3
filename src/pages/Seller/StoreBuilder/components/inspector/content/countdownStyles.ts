import { CountdownBannerStyle } from "../../../../../../components/Store/sections/ProductFeedEcommerceWidgets";

export interface CountdownStyleDefinition {
  id: CountdownBannerStyle;
  name: string;
  tag: string;
  desc: string;
  previewBg: string;
  previewSurface: string;
  previewText: string;
  previewAccent: string;
  previewBorder: string;
}

export const COUNTDOWN_STYLES: CountdownStyleDefinition[] = [
  {
    id: "dark-pro",
    name: "Obsidienne Prestige",
    tag: "Nuit & Azur",
    desc: "Fond marine profond, compteurs vitrés et accent lumineux",
    previewBg: "linear-gradient(135deg, #011C40 0%, #0F172A 100%)",
    previewSurface: "rgba(255, 255, 255, 0.09)",
    previewText: "#F8FAFC",
    previewAccent: "#38BDF8",
    previewBorder: "rgba(167, 235, 242, 0.22)",
  },
  {
    id: "minimal-pill",
    name: "Atelier Éditorial",
    tag: "Clair Épuré",
    desc: "Fond ivoire galerie, capsules fines et typographie contrastée",
    previewBg: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
    previewSurface: "#F1F5F9",
    previewText: "#0F172A",
    previewAccent: "#E11D48",
    previewBorder: "#E2E8F0",
  },
  {
    id: "warm-sunset",
    name: "Terre d'Ambre",
    tag: "Solaire & Or",
    desc: "Brun expresso chaleureux, filets dorés et chiffres ambrés",
    previewBg: "linear-gradient(135deg, #2A1205 0%, #451A03 100%)",
    previewSurface: "rgba(0, 0, 0, 0.35)",
    previewText: "#FFFBEB",
    previewAccent: "#F59E0B",
    previewBorder: "rgba(245, 158, 11, 0.3)",
  },
  {
    id: "nordic-fresh",
    name: "Émeraude Botanique",
    tag: "Nature & Jade",
    desc: "Vert forêt profond, compteurs jade et contraste menthe",
    previewBg: "linear-gradient(135deg, #022C22 0%, #064E3B 100%)",
    previewSurface: "rgba(2, 44, 34, 0.55)",
    previewText: "#ECFDF5",
    previewAccent: "#34D399",
    previewBorder: "rgba(52, 211, 153, 0.28)",
  },
  {
    id: "y2k-pink",
    name: "Velours Cramoisi",
    tag: "Haute Couture",
    desc: "Bordeaux velours intense, éclats rubis et finition poudrée",
    previewBg: "linear-gradient(135deg, #4C0519 0%, #831843 100%)",
    previewSurface: "rgba(0, 0, 0, 0.32)",
    previewText: "#FFF1F2",
    previewAccent: "#FB7185",
    previewBorder: "rgba(251, 113, 133, 0.3)",
  },
  {
    id: "theme-match",
    name: "Harmonie Boutique",
    tag: "Couleur Thème",
    desc: "S'adapte automatiquement à la couleur principale de votre boutique",
    previewBg: "linear-gradient(135deg, #023859 0%, #26658C 100%)",
    previewSurface: "rgba(255, 255, 255, 0.14)",
    previewText: "#FFFFFF",
    previewAccent: "#A7EBF2",
    previewBorder: "rgba(255, 255, 255, 0.24)",
  },
];
