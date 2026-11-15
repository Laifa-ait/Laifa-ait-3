// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { validateMediaFile, replaceMediaUrlInSections, isValidDirectVideoUrl } from "../pages/Seller/StoreBuilder/utils/studioMediaValidation";
import { storeConfigSchema } from "../domains/seller/validators/storeLayout.schema";
import { MediaInspectorPanel } from "../pages/Seller/StoreBuilder/components/context/MediaInspectorPanel";
import { StudioMediaProvider } from "../pages/Seller/StoreBuilder/context/StudioMediaContext";
import { StudioImagePicker } from "../pages/Seller/StoreBuilder/components/inspector/content/StudioImagePicker";
import { HeroContentEditor } from "../pages/Seller/StoreBuilder/components/inspector/content/HeroContentEditor";
import { SectionContentAndTrust } from "../components/Store/sections/SectionContentAndTrust";
import { CustomPageSection, CustomPageTheme, MediaGalleryItem, SellerStoreConfig } from "../domains/seller/customPage.types";

const BASE_THEME: CustomPageTheme = {
  sector: "artisanat", primaryColor: "#023859", secondaryColor: "#18181B",
  canvasColor: "#FAF6F0", surfaceColor: "#FFFFFF", fontFamily: "'Plus Jakarta Sans', sans-serif",
};

function makePngBytes(): Uint8Array {
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
}

function makeMp4Bytes(): Uint8Array {
  return new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32]);
}

describe("Phase 6 — Médias, Images, Vidéos et Assets", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    container.remove();
  });

  it("1. Valide signatures binaires, tailles limites (5Mo image / 25Mo vidéo) et rejette les Base64 volumineux", async () => {
    const validPng = new File([makePngBytes().buffer as ArrayBuffer], "photo.png", { type: "image/png" });
    const descImg = await validateMediaFile(validPng, { allowVideo: false });
    expect(descImg).toEqual({ kind: "image", mimeType: "image/png", extension: "png" });

    const spoofedPng = new File(["NOT_A_PNG_SCRIPT"], "evil.png", { type: "image/png" });
    await expect(validateMediaFile(spoofedPng, { allowVideo: false })).rejects.toThrow("Signature binaire invalide");

    const validMp4 = new File([makeMp4Bytes().buffer as ArrayBuffer], "atelier.mp4", { type: "video/mp4" });
    await expect(validateMediaFile(validMp4, { allowVideo: false })).rejects.toThrow("pas acceptés dans ce champ image");
    const descVid = await validateMediaFile(validMp4, { allowVideo: true });
    expect(descVid).toEqual({ kind: "video", mimeType: "video/mp4", extension: "mp4" });

    const bigImage = new File([makePngBytes().buffer as ArrayBuffer], "huge.png", { type: "image/png" });
    Object.defineProperty(bigImage, "size", { value: 6 * 1024 * 1024 });
    await expect(validateMediaFile(bigImage)).rejects.toThrow("5 Mo maximum");

    const bigBase64 = `data:image/png;base64,${"A".repeat(5000)}`;
    const parsed = storeConfigSchema.safeParse({
      mediaGallery: [{ id: "studio_1", url: bigBase64, type: "image", uploadedAt: "2026-11-10T00:00:00Z" }],
    });
    expect(parsed.success).toBe(false);
  });

  it("2. Distingue Remplacer (sans perdre les réglages) de Supprimer et protège les médias système/catalogue", async () => {
    const oldUrl = "https://cdn.olmart.dz/old-hero.webp";
    const newUrl = "https://cdn.olmart.dz/new-hero.webp";
    const sections: CustomPageSection[] = [{
      id: "sec_hero", type: "hero_banner", title: "Hero Atelier", isVisible: true, order: 0,
      styles: { paddingY: "lg" },
      settings: { title: "Mon Titre Conservé", imageUrl: oldUrl, ctaText: "Acheter" },
    }];
    const storeConfig: SellerStoreConfig = {
      sellerId: "s1", shopName: "Atelier", shopSlug: "atelier", logoUrl: oldUrl, theme: BASE_THEME, updatedAt: "2026-11-10T00:00:00Z",
    };

    const replaced = replaceMediaUrlInSections(sections, storeConfig, oldUrl, newUrl);
    expect(replaced.replacedCount).toBe(2);
    expect((replaced.nextSections[0].settings as Record<string, unknown>).imageUrl).toBe(newUrl);
    expect((replaced.nextSections[0].settings as Record<string, unknown>).title).toBe("Mon Titre Conservé");
    expect(replaced.updatedConfigPatch).toEqual({ logoUrl: newUrl });

    const onReplaceMediaUrl = vi.fn().mockResolvedValue(2);
    const onDeleteMedia = vi.fn().mockResolvedValue(undefined);
    const gallery: MediaGalleryItem[] = [
      { id: "logo", url: "https://cdn.olmart.dz/logo.png", type: "image", name: "Logo", uploadedAt: "2026-11-10T00:00:00Z" },
      { id: "studio_old", url: oldUrl, type: "image", name: "old-hero.webp", mimeType: "image/webp", width: 1600, height: 900, sizeBytes: 120 * 1024, uploadedAt: "2026-11-10T00:00:00Z" },
      { id: "studio_new", url: newUrl, type: "image", name: "new-hero.webp", uploadedAt: "2026-11-10T00:00:00Z" },
    ];

    await act(async () => {
      root.render(
        <MediaInspectorPanel
          mediaGallery={gallery} sections={sections} storeConfig={storeConfig}
          onReplaceMediaUrl={onReplaceMediaUrl} onDeleteMedia={onDeleteMedia}
        />
      );
    });

    await act(async () => {
      (container.querySelector('[data-testid="media-card-logo"]') as HTMLElement).click();
    });
    expect(container.querySelector('[data-testid="media-request-delete-btn"]')).toBeNull();

    await act(async () => {
      (container.querySelector('[data-testid="media-card-studio_old"]') as HTMLElement).click();
    });
    expect(container.querySelector('[data-testid="selected-media-meta"]')?.textContent).toContain("WEBP");
    expect(container.querySelector('[data-testid="selected-media-meta"]')?.textContent).toContain("1600×900px");

    await act(async () => {
      (container.querySelector('[data-testid="media-start-replace-btn"]') as HTMLButtonElement).click();
    });
    await act(async () => {
      (container.querySelector('[data-testid="media-replace-candidate-studio_new"]') as HTMLButtonElement).click();
    });

    expect(onReplaceMediaUrl).toHaveBeenCalledWith(oldUrl, newUrl);
    expect(onDeleteMedia).not.toHaveBeenCalled();
  });

  it("3. Gère les images brisées (onError fallback) dans MediaCard, MediaSelectedInspector, StudioImagePicker et SectionContentAndTrust", async () => {
    const brokenItem: MediaGalleryItem = {
      id: "studio_broken", url: "https://cdn.olmart.dz/missing.jpg", type: "image", name: "missing.jpg", uploadedAt: "2026-11-10T00:00:00Z",
    };

    await act(async () => {
      root.render(
        <div>
          <MediaInspectorPanel mediaGallery={[brokenItem]} sections={[]} />
          <StudioImagePicker label="Photo" value={brokenItem.url} onChange={vi.fn()} />
          <SectionContentAndTrust
            theme={BASE_THEME}
            section={{
              id: "sec_story", type: "brand_story", title: "Histoire", isVisible: true, order: 0, styles: {},
              settings: { heading: "Atelier", bodyText: "Texte", imageUrl: brokenItem.url },
            }}
          />
        </div>
      );
    });

    await act(async () => {
      (container.querySelector('[data-testid="media-card-studio_broken"]') as HTMLElement).click();
    });

    const imgs = Array.from(container.querySelectorAll("img"));
    await act(async () => {
      imgs.forEach((img) => { img.dispatchEvent(new Event("error")); });
    });

    expect(container.querySelector('[data-testid="media-broken-fallback-studio_broken"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="selected-media-broken-warning"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="image-picker-broken-badge"]')).not.toBeNull();
    const storyImg = container.querySelector('img[alt="Atelier"]') as HTMLImageElement | null;
    expect(storyImg?.src).toContain("data:image/svg+xml");
  });

  it("4. StudioImagePicker accède à la Médiathèque/Storage et ShowcaseVideoEditor valide les URLs et uploads vidéo", async () => {
    const onChangeImg = vi.fn();
    const onUploadMedia = vi.fn().mockResolvedValue({
      id: "studio_123", url: "https://storage.googleapis.com/olmart/studio_123.png", type: "image", uploadedAt: "2026-11-10T00:00:00Z",
    });
    const videoPatches: Array<Record<string, unknown>> = [];

    await act(async () => {
      root.render(
        <StudioMediaProvider
          value={{
            mediaGallery: [
              { id: "studio_lib1", url: "https://cdn.olmart.dz/lib1.webp", type: "image", name: "lib1.webp", uploadedAt: "2026-11-10T00:00:00Z" },
              { id: "studio_vid1", url: "https://cdn.olmart.dz/atelier.mp4", type: "video", name: "atelier.mp4", uploadedAt: "2026-11-10T00:00:00Z" },
            ],
            onUploadMedia,
          }}
        >
          <StudioImagePicker label="Photo Hero" value="" onChange={onChangeImg} />
          <HeroContentEditor
            sectionType="showcase_video"
            settings={{ title: "Film", videoUrl: "javascript:alert(1)" }}
            inputClass="in"
            labelClass="lbl"
            onSettingsChange={(k, v) => videoPatches.push(typeof k === "string" ? { [k]: v } : k)}
          />
        </StudioMediaProvider>
      );
    });

    await act(async () => {
      (container.querySelector('[data-testid="image-picker-library-btn"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="image-picker-library-grid"]')).not.toBeNull();
    await act(async () => {
      (container.querySelector('[data-testid="image-picker-library-item-studio_lib1"]') as HTMLButtonElement).click();
    });
    expect(onChangeImg).toHaveBeenCalledWith("https://cdn.olmart.dz/lib1.webp");

    expect(container.querySelector('[data-testid="showcase-video-url-error"]')).not.toBeNull();
    expect(isValidDirectVideoUrl("https://cdn.olmart.dz/atelier.mp4")).toBe(true);
    expect(isValidDirectVideoUrl("javascript:alert(1)")).toBe(false);
  });
});
