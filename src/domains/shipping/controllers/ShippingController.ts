import { Request, Response } from "express";
import { ALGERIA_WILAYAS, ALGERIA_SHIPPING_DATA } from "../../../constants";
import { safeLogger } from "../../../utils/logger";
import { ALGERIA_REGIONS } from "../../../data/algeriaRegions";
import { SUPPORTED_ALGERIAN_CARRIERS, CARRIERS_WITHOUT_ONLINE_PRICING } from "../services/algerianCarriersData";
import { calculateCarrierShippingRates } from "../services/shippingCalculatorService";

// Standard Wilayas mapped to standard format
const FALLBACK_WILAYAS = ALGERIA_WILAYAS.map((w: string, index: number) => {
  const parts = w.split(" ");
  const id = parseInt(parts[0] || "", 10) || (index + 1);
  const name = parts.slice(1).join(" ");
  return { id, name, zone: 1 };
});

export const getShippingLocations = async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: {
        wilayas: FALLBACK_WILAYAS,
        communes: [],
        centers: []
      }
    });
  } catch (error: unknown) {
    safeLogger.error("[Olmart Gateway] ❌ Error fetching shipping locations", { err: error instanceof Error ? error.message : String(error) });
    res.json({
      success: true,
      data: {
        wilayas: FALLBACK_WILAYAS,
        communes: [],
        centers: []
      }
    });
  }
};

export const calculateShippingRates = async (req: Request, res: Response) => {
  try {
    const { wilaya_name } = req.body;

    let wilayaKey = "Default";
    if (wilaya_name) {
      const match = ALGERIA_WILAYAS.find((w: string) => w.toLowerCase().includes(String(wilaya_name).toLowerCase()));
      if (match) {
        wilayaKey = match.replace(/^[0-9]+\s*/, '');
      }
    }

    const shippingInfo = ALGERIA_SHIPPING_DATA[wilayaKey] || ALGERIA_SHIPPING_DATA.Default;
    const directFee = shippingInfo.price || 600;

    return res.json({
      success: true,
      data: {
        home_fee: directFee,
        desk_fee: Math.max(300, directFee - 200),
        delay: shippingInfo.delay || "24-48h (Livraison Directe Vendeur)"
      }
    });

  } catch (error: unknown) {
    safeLogger.error("[Olmart Gateway] ❌ Error calculating shipping rates", { err: error instanceof Error ? error.message : String(error) });
    res.json({
      success: true,
      data: {
        home_fee: 600,
        desk_fee: 400,
        delay: "24-48h (Livraison Directe Vendeur)"
      }
    });
  }
};



export const getCarriers = async (_req: Request, res: Response) =>
  res.json({ success: true, data: { carriers: SUPPORTED_ALGERIAN_CARRIERS, unsupportedCarriers: CARRIERS_WITHOUT_ONLINE_PRICING } });

export const getDairas = async (req: Request, res: Response) => {
  const wilaya = String(req.query.wilaya || "");
  const region = Object.values(ALGERIA_REGIONS).find((item) => item.code === wilaya || item.name.toLowerCase() === wilaya.toLowerCase());
  return res.json({ success: true, data: region ? Object.keys(region.dairas) : [] });
};

export const getCommunes = async (req: Request, res: Response) => {
  const wilaya = String(req.query.wilaya || "");
  const daira = String(req.query.daira || "");
  const region = Object.values(ALGERIA_REGIONS).find((item) => item.code === wilaya || item.name.toLowerCase() === wilaya.toLowerCase());
  return res.json({ success: true, data: region?.dairas[daira] || [] });
};

export const calculateCarrierRate = async (req: Request, res: Response) =>
  res.json({ success: true, data: calculateCarrierShippingRates(req.body) });
