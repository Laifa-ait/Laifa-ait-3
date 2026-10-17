import { describe, it, expect } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import {
  AutoButton,
  AutoBadge,
  AutoCard,
  AutoInput,
  AutoSelect,
  OLMA_TOKENS,
} from "../components/Auto/ui";

describe("Phase 02 — Design System & Composants Atomiques V2", () => {
  describe("1. Tokens & Palette Officielle Olma Auto", () => {
    it("defines the exact required Navy 950 and Lime 400 design tokens", () => {
      expect(OLMA_TOKENS.colors.navy950).toBe("#0B1730");
      expect(OLMA_TOKENS.colors.navy800).toBe("#172B4D");
      expect(OLMA_TOKENS.colors.lime400).toBe("#D9F66F");
      expect(OLMA_TOKENS.colors.lime500).toBe("#C5E94F");
      expect(OLMA_TOKENS.colors.surface).toBe("#FFFFFF");
      expect(OLMA_TOKENS.colors.bg).toBe("#F5F7FA");
      expect(OLMA_TOKENS.colors.border).toBe("#E2E8F0");
    });
  });

  describe("2. AutoButton (Hiérarchie d'Actions & Cibles Tactiles)", () => {
    it("renders primary action CTA with Lime 400 background and Navy 950 text", () => {
      const element = React.createElement(AutoButton, { variant: "primary" }, "Déposer une annonce");
      expect(element).toBeDefined();
      expect(element.props.variant).toBe("primary");
      expect(element.props.children).toBe("Déposer une annonce");

      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoButton, { variant: "primary" }, "Déposer une annonce")
      );
      expect(html).toContain("bg-[#D9F66F]");
      expect(html).toContain("text-[#0B1730]");
      expect(html).toContain("min-h-[44px]");
    });

    it("renders secondary button with Navy 800 border and clean white surface", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoButton, { variant: "secondary" }, "Filtrer")
      );
      expect(html).toContain("border-[#172B4D]");
      expect(html).toContain("text-[#172B4D]");
    });

    it("guarantees accessible touch target >= 44px on md and lg sizes", () => {
      const htmlMd = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoButton, { size: "md" }, "Moyen")
      );
      const htmlLg = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoButton, { size: "lg" }, "Grand")
      );
      expect(htmlMd).toContain("min-h-[44px]");
      expect(htmlLg).toContain("min-h-[48px]");
    });

    it("displays loading state and aria-busy when isLoading is true", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoButton, { isLoading: true }, "Sauvegarder")
      );
      expect(html).toContain('aria-busy="true"');
      expect(html).toContain("disabled");
    });
  });

  describe("3. AutoBadge (Distinction Déclaré vs Contrôlé vs Sponsoring)", () => {
    it("renders declared document with subtle neutral style and declared indicator", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoBadge, {
          type: "declared_document",
          label: "Carte Grise Safia",
        })
      );
      expect(html).toContain("bg-slate-100");
      expect(html).toContain("text-slate-700");
      expect(html).toContain("Document déclaré par le vendeur");
    });

    it("renders verified document with high-contrast Navy 950 and certified tag", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoBadge, {
          type: "verified_document",
          label: "Contrôle Technique",
          subtext: "Certifié Olmart",
        })
      );
      expect(html).toContain("bg-[#0B1730]");
      expect(html).toContain("text-white");
      expect(html).toContain("inspecteur Olmart");
    });

    it("strictly isolates sponsored visibility without any verification claim", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoBadge, {
          type: "sponsored",
          label: "Sponsorisé",
        })
      );
      expect(html).toContain("bg-amber-50");
      expect(html).toContain("text-amber-800");
      expect(html).toContain("Mise en avant sponsorisée");
      expect(html).not.toContain("vérifié");
      expect(html).not.toContain("certifié");
    });

    it("renders technical specs without pill enclosure", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoBadge, {
          type: "technical",
          label: "Diesel · 2.0 TDI",
        })
      );
      expect(html).toContain("text-slate-600");
    });
  });

  describe("4. AutoCard & Form Controls", () => {
    it("renders AutoCard with pristine border and padding preset", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoCard, { padding: "md" }, "Test")
      );
      expect(html).toContain("bg-white");
      expect(html).toContain("rounded-xl");
      expect(html).toContain("p-4");
    });

    it("renders AutoInput with accessible min-height and DZD right addon", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoInput, {
          label: "Prix",
          rightAddon: "DZD",
          placeholder: "2 500 000",
        })
      );
      expect(html).toContain("2 500 000");
      expect(html).toContain("DZD");
    });

    it("renders AutoSelect with 44px min-height", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoSelect, {
          label: "Carburant",
          options: [{ value: "diesel", label: "Diesel" }],
        })
      );
      expect(html).toContain("Diesel");
      expect(html).toContain("min-h-[44px]");
    });
  });
});
