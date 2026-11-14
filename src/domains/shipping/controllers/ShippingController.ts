import { Request, Response } from "express";
import { ALGERIA_WILAYAS, ALGERIA_SHIPPING_DATA } from "../../../constants";
import { safeLogger } from "../../../utils/logger";
import { ALGERIA_REGIONS } from "../../../data/algeriaRegions";
import { ALGERIA_WILAYAS_DATABASE } from "../../../data/algerianCommunesDatabase";
import { SUPPORTED_ALGERIAN_CARRIERS, CARRIERS_WITHOUT_ONLINE_PRICING } from "../services/algerianCarriersData";
import { calculateCarrierShippingRates } from "../services/shippingCalculatorService";

// Standard Wilayas mapped to standard format
const FALLBACK_WILAYAS = ALGERIA_WILAYAS.map((w: string, index: number) => {
  const parts = w.split(" ");
  const id = parseInt(parts[0] || "", 10) || (index + 1);
  const name = w.replace(/^[0-9]+(?:\s*-\s*|\s+)/, "").trim();
  return { id, code: String(id).padStart(2, "0"), name, rawName: w, zone: 1 };
});

const FLAT_COMMUNES = ALGERIA_WILAYAS_DATABASE.flatMap((wilaya) => {
  const wilayaId = parseInt(wilaya.code, 10) || 0;
  return wilaya.communes.map((commune, idx) => ({
    id: wilayaId * 1000 + idx + 1,
    wilaya_id: wilayaId,
    name: commune.name,
    name_ar: commune.name_ar,
    daira: commune.daira,
  }));
});

function resolveWilayaShippingKey(wilayaName?: unknown, wilayaId?: unknown): string {
  const numericId =
    wilayaId !== undefined && wilayaId !== null && String(wilayaId).trim() !== ""
      ? parseInt(String(wilayaId), 10)
      : NaN;

  if (Number.isInteger(numericId) && numericId >= 1 && numericId <= 69) {
    const padded = String(numericId).padStart(2, "0");
    const byIdMatch = ALGERIA_WILAYAS.find((w: string) => w.startsWith(`${padded} `) || w.startsWith(`${numericId} `));
    if (byIdMatch) {
      return byIdMatch.replace(/^[0-9]+(?:\s*-\s*|\s+)/, "").trim();
    }
  }

  if (typeof wilayaName === "string" && wilayaName.trim()) {
    const cleanTarget = wilayaName.trim().toLowerCase();
    const byNameMatch = ALGERIA_WILAYAS.find((w: string) => w.toLowerCase().includes(cleanTarget));
    if (byNameMatch) {
      return byNameMatch.replace(/^[0-9]+(?:\s*-\s*|\s+)/, "").trim();
    }
  }

  return "Default";
}

export const getShippingLocations = async (_req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: {
        wilayas: FALLBACK_WILAYAS,
        communes: FLAT_COMMUNES,
        centers: []
      }
    });
  } catch (error: unknown) {
    safeLogger.error("[Olmart Gateway] ❌ Error fetching shipping locations", { err: error instanceof Error ? error.message : String(error) });
    return res.json({
      success: true,
      data: {
        wilayas: FALLBACK_WILAYAS,
        communes: FLAT_COMMUNES,
        centers: []
      }
    });
  }
};

export const calculateShippingRates = async (req: Request, res: Response) => {
  try {
    const { wilaya_name, wilaya_id } = (req.body || {}) as { wilaya_name?: unknown; wilaya_id?: unknown };
    const wilayaKey = resolveWilayaShippingKey(wilaya_name, wilaya_id);

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
    return res.json({
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
