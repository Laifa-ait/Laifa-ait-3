import { describe, it, expect } from "vitest";
import { buildProductPayload } from "../pages/Seller/ProductForm/utils/productPayloadBuilder";
import { ProductFormData } from "../types/seller";

describe("Product Colors and Sizes Normalization & Payload Builder", () => {
  it("should extract colors and sizes explicitly from formData", () => {
    const formData: Partial<ProductFormData> = {
      name: "Veste en Cuir",
      price: "12000",
      colors: ["Noir", "Marron"],
      sizes: ["M", "L", "XL"],
      variants: [
        { name: "NOIR - M", stock: 5, isActive: true },
        { name: "NOIR - L", stock: 5, isActive: true },
      ],
    };

    const payload = buildProductPayload(formData as ProductFormData, {
      status: "active",
      sellerId: "seller_123",
    });

    expect(payload.colors).toEqual(["Noir", "Marron"]);
    expect(payload.sizes).toEqual(["M", "L", "XL"]);
    expect(payload.stock).toBe(10);
  });

  it("should derive colors and sizes from variants when formData colors/sizes are empty", () => {
    const formData: Partial<ProductFormData> = {
      name: "Veste en Cuir",
      price: "12000",
      colors: [],
      sizes: [],
      variants: [
        { name: "NOIR - M", stock: 5, isActive: true },
        { name: "NOIR - L", stock: 5, isActive: true },
        { name: "NOIR - XL", stock: 5, isActive: true },
        { name: "NOIR - 36", stock: 5, isActive: false }, // inactive
      ],
    };

    const payload = buildProductPayload(formData as ProductFormData, {
      status: "active",
      sellerId: "seller_123",
    });

    expect(payload.colors).toEqual(["NOIR"]);
    // Should only derive from active variants
    expect(payload.sizes).toEqual(["M", "L", "XL"]);
    expect(payload.stock).toBe(15);
  });

  it("should handle variants with explicit color and size properties", () => {
    const formData: Partial<ProductFormData> = {
      name: "T-Shirt Sport",
      price: "2500",
      colors: [],
      sizes: [],
      variants: [
        { name: "Rouge / S", color: "Rouge", size: "S", stock: 8, isActive: true },
        { name: "Bleu / M", color: "Bleu", size: "M", stock: 4, isActive: true },
      ],
    };

    const payload = buildProductPayload(formData as ProductFormData, {
      status: "active",
      sellerId: "seller_123",
    });

    expect(payload.colors).toEqual(["Rouge", "Bleu"]);
    expect(payload.sizes).toEqual(["S", "M"]);
    expect(payload.stock).toBe(12);
  });
});
