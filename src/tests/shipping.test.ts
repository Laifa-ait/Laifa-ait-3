import { describe, it, expect, vi, Mock } from "vitest";
import {
  getShippingLocations,
  calculateShippingRates,
  getCarriers,
  getDairas,
  getCommunes,
  calculateCarrierRate
} from "../domains/shipping/controllers/ShippingController";
import {
  calculateCarrierShippingRates
} from "../domains/shipping/services/shippingCalculatorService";
import { Request, Response } from "express";

describe("ShippingController & Algerian Carrier Engine", () => {
  it("should get shipping locations with 69 wilayas", async () => {
    const req = {} as Request;
    const res = {
      json: vi.fn(),
    } as unknown as Response;

    await getShippingLocations(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = (res.json as Mock).mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.data.wilayas).toBeInstanceOf(Array);
    expect(responseData.data.wilayas.length).toBeGreaterThanOrEqual(58);
    expect(responseData.data.wilayas[0]).toHaveProperty("id");
    expect(responseData.data.wilayas[0]).toHaveProperty("name");
  });

  it("should list supported carriers (Yalidine, ZR, Maystro) and unlisted carriers", async () => {
    const req = {} as Request;
    const res = { json: vi.fn() } as unknown as Response;

    await getCarriers(req, res);
    expect(res.json).toHaveBeenCalled();
    const responseData = (res.json as Mock).mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.data.carriers.length).toBe(3);
    expect(responseData.data.carriers.map((c: { id: string }) => c.id)).toContain("yalidine");
    expect(responseData.data.carriers.map((c: { id: string }) => c.id)).toContain("zr_express");
    expect(responseData.data.carriers.map((c: { id: string }) => c.id)).toContain("maystro");

    // Unsupported without online pricing
    expect(responseData.data.unsupportedCarriers.length).toBeGreaterThanOrEqual(2);
    expect(responseData.data.unsupportedCarriers.map((c: { id: string }) => c.id)).toContain("procolis");
    expect(responseData.data.unsupportedCarriers.map((c: { id: string }) => c.id)).toContain("kazitour");
  });

  it("should return dairas and communes for a specific wilaya", async () => {
    const reqDaira = { query: { wilaya: "16" } } as unknown as Request;
    const resDaira = { json: vi.fn() } as unknown as Response;
    await getDairas(reqDaira, resDaira);
    const dairaData = (resDaira.json as Mock).mock.calls[0][0];
    expect(dairaData.success).toBe(true);
    expect(dairaData.data.length).toBeGreaterThan(0);

    const firstDaira = dairaData.data[0];
    const reqCommune = { query: { wilaya: "16", daira: firstDaira } } as unknown as Request;
    const resCommune = { json: vi.fn() } as unknown as Response;
    await getCommunes(reqCommune, resCommune);
    const communeData = (resCommune.json as Mock).mock.calls[0][0];
    expect(communeData.success).toBe(true);
    expect(communeData.data.length).toBeGreaterThan(0);
  });

  it("should accurately calculate Yalidine Express intra-wilaya shipping", () => {
    const result = calculateCarrierShippingRates({
      carrierId: "yalidine",
      originWilaya: "16 - Alger",
      originDaira: "Sidi M'Hamed",
      originCommune: "Alger Centre",
      destWilaya: "16 - Alger",
      destDaira: "Bab El Oued",
      destCommune: "Bab El Oued",
      weightKg: 2.0,
      deliveryMethod: "domicile"
    });

    expect(result.isIntraWilaya).toBe(true);
    expect(result.zoneIndex).toBe(0);
    expect(result.homeDelivery.fee).toBe(600); // 600 DA Domicile
    expect(result.stopDeskDelivery.fee).toBe(350); // 350 DA Stop Desk
    expect(result.selectedFee).toBe(600);
  });

  it("should calculate Yalidine shipping from Alger to Oran (Zone 2)", () => {
    const result = calculateCarrierShippingRates({
      carrierId: "yalidine",
      originWilaya: "16 - Alger",
      destWilaya: "31 - Oran",
      weightKg: 1.5,
      deliveryMethod: "stopdesk"
    });

    expect(result.isIntraWilaya).toBe(false);
    expect(result.zoneIndex).toBe(2);
    expect(result.homeDelivery.fee).toBe(750);
    expect(result.stopDeskDelivery.fee).toBe(450);
    expect(result.selectedFee).toBe(450);
  });

  it("should calculate Yalidine shipping to Grand Sud (Tamanrasset) with overweight", () => {
    const result = calculateCarrierShippingRates({
      carrierId: "yalidine",
      originWilaya: "16 - Alger",
      destWilaya: "11 - Tamanrasset",
      weightKg: 7.0, // 2kg extra (base is 5kg, South extra is 100 DA/kg -> +200 DA)
      deliveryMethod: "domicile"
    });

    expect(result.zoneIndex).toBe(6);
    expect(result.homeDelivery.baseFee).toBe(1600);
    expect(result.homeDelivery.weightFee).toBe(200);
    expect(result.homeDelivery.fee).toBe(1800);
  });

  it("should calculate ZR Express rates correctly", () => {
    const result = calculateCarrierShippingRates({
      carrierId: "zr_express",
      originWilaya: "16 - Alger",
      destWilaya: "25 - Constantine",
      weightKg: 1.0,
      deliveryMethod: "domicile"
    });

    expect(result.carrier.id).toBe("zr_express");
    expect(result.homeDelivery.fee).toBe(750);
    expect(result.stopDeskDelivery.fee).toBe(500);
  });

  it("should calculate Maystro Delivery rates correctly", () => {
    const result = calculateCarrierShippingRates({
      carrierId: "maystro",
      originWilaya: "16 - Alger",
      destWilaya: "09 - Blida",
      weightKg: 1.0,
      deliveryMethod: "domicile"
    });

    expect(result.carrier.id).toBe("maystro");
    expect(result.homeDelivery.fee).toBe(600);
    expect(result.stopDeskDelivery.fee).toBe(400);
  });

  it("should handle free shipping correctly", () => {
    const result = calculateCarrierShippingRates({
      carrierId: "yalidine",
      originWilaya: "16 - Alger",
      destWilaya: "31 - Oran",
      weightKg: 2.0,
      freeShipping: true
    });

    expect(result.isFreeShipping).toBe(true);
    expect(result.homeDelivery.fee).toBe(0);
    expect(result.stopDeskDelivery.fee).toBe(0);
    expect(result.selectedFee).toBe(0);
  });

  it("should handle calculateCarrierRate controller endpoint", async () => {
    const req = {
      body: {
        carrierId: "yalidine",
        originWilaya: "16 - Alger",
        destWilaya: "31 - Oran",
        weightKg: 1.5,
        deliveryMethod: "domicile"
      }
    } as Request;
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() } as unknown as Response;

    await calculateCarrierRate(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = (res.json as Mock).mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.data.selectedFee).toBe(750);
  });

  it("should calculate shipping rates for default wilaya with backward compatibility", async () => {
    const req = { body: {} } as Request;
    const res = { json: vi.fn() } as unknown as Response;

    await calculateShippingRates(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = (res.json as Mock).mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.data).toHaveProperty("home_fee");
    expect(responseData.data).toHaveProperty("desk_fee");
    expect(responseData.data).toHaveProperty("delay");
  });

  it("should calculate volumetric weight (L x l x h) / 5000 for bulky items exceeding physical weight", () => {
    // 100 x 50 x 50 cm = 250,000 / 5,000 = 50 kg volumetric vs 5 kg physical
    const result = calculateCarrierShippingRates({
      carrierId: "yalidine",
      originWilaya: "16 - Alger",
      destWilaya: "31 - Oran",
      weightKg: 5.0,
      dimensions: "100x50x50",
      deliveryMethod: "domicile"
    });

    expect(result.weightDetails.isVolumetricApplied).toBe(true);
    expect(result.weightDetails.volumetricWeightKg).toBe(50);
    expect(result.weightDetails.chargeableWeightKg).toBe(50);
    // Base is 5kg (750 DA), Extra 45kg * 50 DA/kg in Zone 2 = +2250 DA -> Total 3000 DA
    expect(result.homeDelivery.baseFee).toBe(750);
    expect(result.homeDelivery.weightFee).toBe(2250);
    expect(result.homeDelivery.fee).toBe(3000);
  });

  it("should automatically apply volumetric calculations for bulky categories like canapés or gros électroménager", () => {
    const result = calculateCarrierShippingRates({
      carrierId: "zr_express",
      originWilaya: "16 - Alger",
      destWilaya: "25 - Constantine",
      weightKg: 8.0,
      dimensions: "80x60x40", // (80*60*40)/5000 = 38.4 kg
      category: "Canapé & Salons",
      deliveryMethod: "domicile"
    });

    expect(result.weightDetails.isBulkyCategory).toBe(true);
    expect(result.weightDetails.isVolumetricApplied).toBe(true);
    expect(result.weightDetails.chargeableWeightKg).toBe(38.4);
  });

  it("should apply seasonal discounts when seasonal profile like Ramadan is active", () => {
    const standardResult = calculateCarrierShippingRates({
      carrierId: "yalidine",
      originWilaya: "16 - Alger",
      destWilaya: "31 - Oran",
      weightKg: 2.0,
      deliveryMethod: "stopdesk"
    });

    const ramadanResult = calculateCarrierShippingRates({
      carrierId: "yalidine",
      originWilaya: "16 - Alger",
      destWilaya: "31 - Oran",
      weightKg: 2.0,
      deliveryMethod: "stopdesk",
      seasonId: "ramadan"
    });

    // Ramadan offers 10% discount on Stop Desk base fee (450 DA -> 405 DA)
    expect(standardResult.stopDeskDelivery.fee).toBe(450);
    expect(ramadanResult.stopDeskDelivery.fee).toBe(405);
  });
});
