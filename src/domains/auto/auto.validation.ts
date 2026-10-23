import { z } from "zod";

export const vehicleFuelEnum = z.enum(["essence", "diesel", "gpl", "hybride", "electrique"]);
export const vehicleTransmissionEnum = z.enum(["manuelle", "automatique"]);
export const vehiclePaperStatusEnum = z.enum(["safia", "moudjahid", "en_cours", "procuration", "autre"]);
export const vehicleBodyConditionEnum = z.enum(["origine", "a_froid", "retouches", "masque_avant", "repeinte"]);
export const vehiclePriceTypeEnum = z.enum(["fixe", "negociable", "offert", "echange"]);
export const vehicleListingStatusEnum = z.enum([
  "draft",
  "pending_review",
  "active",
  "sold",
  "rejected",
  "expired",
  "archived",
]);
export const autoSellerTypeEnum = z.enum(["particulier", "professionnel", "concessionnaire"]);

export const createVehicleListingSchema = z.object({
  title: z.string().trim().min(3).max(120),
  brand: z.string().trim().min(2).max(50),
  model: z.string().trim().min(1).max(50),
  version: z.string().trim().max(80).optional(),
  year: z.number().int().min(1960).max(new Date().getFullYear() + 1),
  mileage: z.number().int().min(0).max(1000000),
  fuel: vehicleFuelEnum,
  transmission: vehicleTransmissionEnum,
  paperStatus: vehiclePaperStatusEnum,
  bodyCondition: vehicleBodyConditionEnum,
  price: z.number().positive().max(1000000000), // En DZD
  priceType: vehiclePriceTypeEnum,
  currentOfferPrice: z.number().positive().optional(),
  wilayaId: z.number().int().min(1).max(69),
  wilayaName: z.string().trim().min(2).max(60),
  commune: z.string().trim().min(2).max(60),
  images: z.array(z.string().url()).min(1).max(10),
  options: z.array(z.string().trim().max(50)).max(30).default([]),
  description: z.string().trim().min(10).max(5000),
  sellerPhoneNumber: z.string().trim().regex(/^(05|06|07|02)[0-9]{8}$/, "Numéro algérien valide requis (05/06/07/02)"),
  sellerWhatsappNumber: z.string().trim().regex(/^(05|06|07|02|\+213)[0-9]{8,11}$/, "Numéro WhatsApp valide requis"),
  sellerType: autoSellerTypeEnum.default("particulier"),
  submitForReview: z.boolean().default(true),
});

export const updateVehicleListingSchema = createVehicleListingSchema.partial();

const parseOptionalNumber = (val: unknown) => (val !== undefined && val !== "" && !isNaN(Number(val)) ? Number(val) : undefined);

export const vehicleFilterSchema = z.object({
  brand: z.string().trim().optional(),
  model: z.string().trim().optional(),
  fuel: vehicleFuelEnum.optional(),
  transmission: vehicleTransmissionEnum.optional(),
  paperStatus: vehiclePaperStatusEnum.optional(),
  bodyCondition: vehicleBodyConditionEnum.optional(),
  priceType: vehiclePriceTypeEnum.optional(),
  minPrice: z.preprocess(parseOptionalNumber, z.number().positive().optional()),
  maxPrice: z.preprocess(parseOptionalNumber, z.number().positive().optional()),
  minYear: z.preprocess(parseOptionalNumber, z.number().int().min(1960).optional()),
  maxYear: z.preprocess(parseOptionalNumber, z.number().int().optional()),
  maxMileage: z.preprocess(parseOptionalNumber, z.number().int().positive().optional()),
  wilayaId: z.preprocess(parseOptionalNumber, z.number().int().min(1).max(69).optional()),
  sellerType: autoSellerTypeEnum.optional(),
  onlyInspected: z.preprocess((val) => (val === "true" || val === true ? true : undefined), z.boolean().optional()),
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : 20), z.number().int().min(1).max(50).default(20)),
  sort: z.enum(["date_desc", "price_asc", "price_desc", "mileage_asc", "year_desc"]).default("date_desc"),
});

export const vehicleStatusTransitionSchema = z.object({
  targetStatus: vehicleListingStatusEnum,
  rejectionReason: z.string().trim().min(5).max(500).optional(),
});

export const vehicleReportSchema = z.object({
  reason: z.enum(["already_sold", "wrong_price", "suspicious_fraud", "bad_condition", "other"]),
  details: z.string().trim().max(1000).optional(),
});
