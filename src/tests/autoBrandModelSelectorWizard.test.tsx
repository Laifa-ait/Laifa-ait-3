import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { getModelsForBrand } from "../domains/auto/auto.brands";
import { ListingWizardStep1, POPULAR_BRANDS, Step1Data } from "../components/Auto/ListingWizardStep1";
import { BrandModelSelector } from "../components/Auto/BrandModelSelector";

describe("Intégration des Modèles de Véhicules dans l'Ajout de Véhicule (Tunnel Vendeur)", () => {
  it("provides complete model catalog for all requested Algerian brands", () => {
    // 1. Kia (comme sur la capture utilisateur)
    const kiaModels = getModelsForBrand("Kia");
    expect(kiaModels).toContain("Picanto");
    expect(kiaModels).toContain("Sportage");
    expect(kiaModels).toContain("Rio");
    expect(kiaModels).toContain("Cerato");
    expect(kiaModels).toContain("Sorento");

    // 2. Fiat
    const fiatModels = getModelsForBrand("Fiat");
    expect(fiatModels).toContain("500");
    expect(fiatModels).toContain("Tipo");
    expect(fiatModels).toContain("Doblo");
    expect(fiatModels).toContain("Titano");

    // 3. Chery
    const cheryModels = getModelsForBrand("Chery");
    expect(cheryModels).toContain("Tiggo 2 Pro");
    expect(cheryModels).toContain("Tiggo 4 Pro");
    expect(cheryModels).toContain("Arrizo 5");

    // 4. Geely
    const geelyModels = getModelsForBrand("Geely");
    expect(geelyModels).toContain("Coolray");
    expect(geelyModels).toContain("GX3 Pro");
    expect(geelyModels).toContain("Monjaro");

    // 5. DFSK
    const dfskModels = getModelsForBrand("DFSK");
    expect(dfskModels).toContain("K01S");
    expect(dfskModels).toContain("Fengon 500");

    // 6. Jetour
    const jetourModels = getModelsForBrand("Jetour");
    expect(jetourModels).toContain("Dashing");
    expect(jetourModels).toContain("X70 Plus");

    // 7. Renault, Peugeot, Volkswagen
    expect(getModelsForBrand("Renault")).toContain("Clio");
    expect(getModelsForBrand("Peugeot")).toContain("208");
    expect(getModelsForBrand("Volkswagen")).toContain("Golf");
  });

  it("renders dynamic model dropdown when a brand is selected in BrandModelSelector", () => {
    const htmlKia = renderToString(
      React.createElement(BrandModelSelector, {
        brand: "Kia",
        model: "Sportage",
        brandsList: POPULAR_BRANDS,
        onBrandChange: () => {},
        onModelChange: () => {},
      })
    );

    // Vérifie que le logo officiel et les modèles de Kia sont bien rendus dans les options
    expect(htmlKia).toContain("Sportage");
    expect(htmlKia).toContain("Picanto");
    expect(htmlKia).toContain("Rio");
    expect(htmlKia).toContain("Logo Kia");
    expect(htmlKia).toContain("modèles intégrés pour");
    expect(htmlKia).toContain("11 disponibles");
  });

  it("renders BrandModelSelector inside ListingWizardStep1 and updates step title", () => {
    const sampleData: Step1Data = {
      title: "Kia Sportage GT Line 2019",
      brand: "Kia",
      model: "Sportage",
      version: "GT Line",
      year: 2019,
      mileage: 82000,
      fuel: "diesel",
      transmission: "manuelle",
    };

    const htmlStep1 = renderToString(
      React.createElement(ListingWizardStep1, {
        data: sampleData,
        onChange: () => {},
        onNext: () => {},
      })
    );

    expect(htmlStep1).toContain("Identité &amp; Caractéristiques du Véhicule");
    expect(htmlStep1).toContain("Marque");
    expect(htmlStep1).toContain("Modèle");
    expect(htmlStep1).toContain("Sportage");
    expect(htmlStep1).toContain("GT Line");
    expect(htmlStep1).toContain("Kia Sportage GT Line 2019");
    expect(htmlStep1).toContain("Continuer vers l&#x27;Étape 2");
  });

  it("exposes all 30 Algerian automotive brands in POPULAR_BRANDS", () => {
    const brands = [...POPULAR_BRANDS];
    expect(brands).toContain("Fiat");
    expect(brands).toContain("Chery");
    expect(brands).toContain("Opel");
    expect(brands).toContain("Geely");
    expect(brands).toContain("DFSK");
    expect(brands).toContain("Renault");
    expect(brands).toContain("Peugeot");
    expect(brands).toContain("Volkswagen");
    expect(brands).toContain("Dacia");
    expect(brands).toContain("Hyundai");
    expect(brands).toContain("Kia");
    expect(brands).toContain("Toyota");
    expect(brands).toContain("SEAT");
    expect(brands).toContain("Citroën");
    expect(brands).toContain("Ford");
    expect(brands).toContain("Mercedes-Benz");
    expect(brands).toContain("BMW");
    expect(brands).toContain("Audi");
    expect(brands).toContain("JAC");
    expect(brands).toContain("JMC");
    expect(brands).toContain("Sokon");
    expect(brands).toContain("Jetour");
    expect(brands).toContain("BAIC");
    expect(brands).toContain("Great Wall");
    expect(brands).toContain("Haval");
    expect(brands).toContain("Dongfeng");
    expect(brands).toContain("Joyear");
    expect(brands).toContain("MG");
    expect(brands).toContain("Bestune");
    expect(brands).toContain("Exeed");
  });
});
