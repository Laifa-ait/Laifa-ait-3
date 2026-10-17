import { z } from "zod";

export const autoPartCategoryEnum = z.enum([
  "moteur",
  "carrosserie",
  "optique",
  "freinage",
  "suspension",
  "habitacle",
  "casse_depecage",
  "autre",
]);

export const autoPartConditionEnum = z.enum([
  "neuf",
  "tres_bon_etat",
  "bon_etat",
  "pour_pieces",
]);

export const autoPartCompatibilitySchema = z.object({
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  yearStart: z.number().int().min(1960).max(2030).optional(),
  yearEnd: z.number().int().min(1960).max(2030).optional(),
  engineType: z.string().max(50).optional(),
  isUniversal: z.boolean().optional(),
  isCertified: z.boolean().default(false),
});

export const createAutoPartSchema = z.object({
  title: z.string().min(3, "Titre requis (3 car. min)").max(120),
  category: autoPartCategoryEnum,
  condition: autoPartConditionEnum,
  priceDZD: z.number().int().min(100).max(50000000),
  isPriceNegotiable: z.boolean().default(false),
  wilayaId: z.number().int().min(1).max(58),
  commune: z.string().min(2).max(100),
  compatibilities: z.array(autoPartCompatibilitySchema).default([]),
  description: z.string().min(10, "Description trop courte (10 car. min)").max(3000),
  images: z.array(z.string().url()).min(1, "Au moins une photo requise").max(6),
  isJunkYard: z.boolean().default(false),
  sellerPhone: z.string().regex(/^(?:0[5-7]\d{8}|\+213[5-7]\d{8})$/, "Numéro algérien invalide"),
});

export const autoPartFilterSchema = z.object({
  category: autoPartCategoryEnum.optional(),
  condition: autoPartConditionEnum.optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().int().min(1960).max(2030).optional(),
  wilayaId: z.coerce.number().int().min(1).max(58).optional(),
  isJunkYard: z.preprocess((val) => (val === "true" ? true : val === "false" ? false : undefined), z.boolean().optional()),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  query: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
