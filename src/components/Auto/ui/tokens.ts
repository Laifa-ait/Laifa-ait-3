/**
 * Olma Auto V2 — Design System Tokens
 * Strict Navy 950 / Lime 400 Color System & Hierarchy Standards
 * Conformité : WCAG AA (>= 4.5:1), Zero-pill discipline, Mobile-first
 */

export const OLMA_TOKENS = {
  colors: {
    navy950: "#0B1730",
    navy900: "#101E3D",
    navy800: "#172B4D",
    navy700: "#23416A",
    lime400: "#D9F66F",
    lime500: "#C5E94F",
    surface: "#FFFFFF",
    bg: "#F5F7FA",
    border: "#E2E8F0",
    slate800: "#1E293B",
    slate600: "#475569",
    slate400: "#94A3B8",
    emerald600: "#059669",
    amber500: "#D97706",
  },
  touchTargetMin: "44px",
  radius: {
    button: "rounded-xl",
    card: "rounded-xl",
    input: "rounded-xl",
    badge: "rounded-md",
  },
} as const;

export type ButtonVariant =
  | "primary"     // High priority single CTA: Lime 400 bg, Navy 950 text
  | "secondary"   // Secondary action: Navy 800 border, white bg
  | "dark"        // Navy 950 bg, white text
  | "ghost"       // Transparent bg, Navy text
  | "danger"      // Muted red outline/bg for destructive actions
  | "whatsapp"    // WhatsApp call-to-action
  | "phone";      // Direct phone call CTA

export type ButtonSize = "sm" | "md" | "lg";

export type BadgeSemanticType =
  | "declared_document"  // Vendeur déclare un papier (Safia, Carte Grise) - Neutre slate
  | "verified_document"  // Vérifié par agent Olmart - Navy contrasté + ShieldCheck
  | "sponsored"          // Sponsoring payant - Ambre discret + Sparkles (JAMAIS vérifié)
  | "technical"          // Spécification technique (carburant, boîte)
  | "status";            // État du véhicule (Disponible, Réservé, Vendu)
