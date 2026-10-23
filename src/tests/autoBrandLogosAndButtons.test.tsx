import { describe, it, expect, vi } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import {
  POPULAR_AUTO_BRANDS,
  getCarBrandLogoComponent,
  RenaultLogo,
  PeugeotLogo,
  VolkswagenLogo,
  HyundaiLogo,
  ToyotaLogo,
  DaciaLogo,
  KiaLogo,
  AudiLogo,
  BmwLogo,
  MercedesLogo,
  OlmaAutoEmblem,
} from "../domains/auto/data/carBrandLogos";
import { AutoPopularBrandsSection } from "../components/Auto/AutoPopularBrandsSection";
import { AutoButton } from "../components/Auto/ui/AutoButton";

vi.mock("react-router-dom", () => ({
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) =>
    React.createElement("a", { href: to, className }, children),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

describe("Logos & Boutons Automobiles (Olma Auto V2)", () => {
  describe("1. Référentiel des Marques & Logos Vectoriels SVG", () => {
    it("contains all major automotive brands popular in Algeria", () => {
      const brandNames = POPULAR_AUTO_BRANDS.map((b) => b.name);
      expect(brandNames).toContain("Renault");
      expect(brandNames).toContain("Peugeot");
      expect(brandNames).toContain("Volkswagen");
      expect(brandNames).toContain("Hyundai");
      expect(brandNames).toContain("Dacia");
      expect(brandNames).toContain("Toyota");
      expect(brandNames).toContain("Kia");
      expect(brandNames).toContain("Seat");
      expect(brandNames).toContain("Audi");
      expect(brandNames).toContain("BMW");
      expect(brandNames).toContain("Mercedes-Benz");
      expect(brandNames).toContain("Fiat");
    });

    it("resolves brand logo components dynamically by name or id", () => {
      expect(getCarBrandLogoComponent("renault")).toBe(RenaultLogo);
      expect(getCarBrandLogoComponent("Peugeot")).toBe(PeugeotLogo);
      expect(getCarBrandLogoComponent("volkswagen")).toBe(VolkswagenLogo);
      expect(getCarBrandLogoComponent("Hyundai")).toBe(HyundaiLogo);
      expect(getCarBrandLogoComponent("Toyota")).toBe(ToyotaLogo);
      expect(getCarBrandLogoComponent("dacia")).toBe(DaciaLogo);
      expect(getCarBrandLogoComponent("kia")).toBe(KiaLogo);
      expect(getCarBrandLogoComponent("audi")).toBe(AudiLogo);
      expect(getCarBrandLogoComponent("bmw")).toBe(BmwLogo);
      expect(getCarBrandLogoComponent("Mercedes-Benz")).toBe(MercedesLogo);
      expect(getCarBrandLogoComponent("inconnue")).toBeNull();
    });

    it("renders official vector SVG logos with valid viewBox and accessibility attributes", async () => {
      const { renderToString } = await import("react-dom/server");

      const renaultSvg = renderToString(React.createElement(RenaultLogo, { className: "w-8 h-8" }));
      expect(renaultSvg).toContain("viewBox=\"0 0 100 100\"");
      expect(renaultSvg).toContain("aria-label=\"Logo Renault\"");

      const vwSvg = renderToString(React.createElement(VolkswagenLogo));
      expect(vwSvg).toContain("aria-label=\"Logo Volkswagen\"");

      const peugeotSvg = renderToString(React.createElement(PeugeotLogo));
      expect(peugeotSvg).toContain("aria-label=\"Logo Peugeot\"");

      const emblemSvg = renderToString(React.createElement(OlmaAutoEmblem));
      expect(emblemSvg).toContain("aria-label=\"Emblème Officiel Olma Auto\"");
      expect(emblemSvg).toContain("olmaShieldGrad");
      expect(emblemSvg).toContain("olmaLimeGrad");
    });
  });

  describe("2. Section Explorer par Marque (AutoPopularBrandsSection)", () => {
    it("renders brand showcase cards with link targets to catalog", async () => {
      const { renderToString } = await import("react-dom/server");
      const html = renderToString(React.createElement(AutoPopularBrandsSection));
      expect(html).toContain("Explorer par Marque");
      expect(html).toContain("Toutes les marques");
      expect(html).toContain("Renault");
      expect(html).toContain("Peugeot");
      expect(html).toContain("Volkswagen");
      expect(html).toContain("Hyundai");
      expect(html).toContain("/auto/catalog?brand=");
    });
  });

  describe("3. Design Système des Boutons Tactiles Modernes", () => {
    it("renders primary button with electric lime gradient, tactile shadow and micro-interactions", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoButton, { variant: "primary" }, "Rechercher")
      );
      expect(html).toContain("bg-[#D9F66F]");
      expect(html).toContain("text-[#0B1730]");
      expect(html).toContain("bg-gradient-to-r");
      expect(html).toContain("shadow-[0_4px_14px_0_rgba(217,246,111,0.39)]");
    });

    it("renders whatsapp button with dedicated emerald gradient and tactile shadow", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoButton, { variant: "whatsapp" }, "Contacter")
      );
      expect(html).toContain("bg-[#25D366]");
      expect(html).toContain("bg-gradient-to-r");
      expect(html).toContain("text-white");
    });

    it("renders dark action button with navy gradient and subtle border highlight", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(AutoButton, { variant: "dark" }, "Voir l'annonce")
      );
      expect(html).toContain("bg-[#0B1730]");
      expect(html).toContain("bg-gradient-to-r");
      expect(html).toContain("text-white");
    });
  });
});
