// @vitest-environment jsdom
import React, { act, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MediaGalleryItem, StoreConfig } from "../domains/seller/customPage.types";

const mockApiPut = vi.fn();
const mockUploadStrict = vi.fn();
const mockDeleteStorage = vi.fn();

vi.mock("../lib/api", () => ({
  apiPut: (...args: unknown[]) => mockApiPut(...args),
}));

vi.mock("../services/storage.service", () => ({
  uploadFileStrictWithProgress: (...args: unknown[]) => mockUploadStrict(...args),
  deleteStorageFile: (...args: unknown[]) => mockDeleteStorage(...args),
}));

import { useStudioMediaManager } from "../pages/Seller/StoreBuilder/hooks/useStudioMediaManager";

function makePngFile(): File {
  const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 1]);
  return new File([bytes.buffer as ArrayBuffer], "artisan.png", { type: "image/png" });
}

describe("Phase 6 Hook — useStudioMediaManager (progression, nettoyage orphelins, protection suppression)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    container.remove();
  });

  it("nettoie le fichier Storage orphelin si la persistance Firestore échoue et protège les IDs système/catalogue", async () => {
    let apiHandle: ReturnType<typeof useStudioMediaManager> | null = null;
    const Harness: React.FC = () => {
      const [gallery, setGallery] = useState<MediaGalleryItem[]>([
        { id: "logo", url: "https://cdn.olmart.dz/logo.png", type: "image", uploadedAt: "2026-11-10T00:00:00Z" },
      ]);
      const [, setConfig] = useState<StoreConfig | null>(null);
      apiHandle = useStudioMediaManager({
        userId: "seller_42", mediaGallery: gallery, setMediaGallery: setGallery, setStoreConfig: setConfig,
      });
      return <div data-testid="err">{apiHandle.uploadError || ""}</div>;
    };

    await act(async () => { root.render(<Harness />); });

    mockUploadStrict.mockImplementation(async (_path: string, _blob: Blob, opts: { onProgress?: (p: number) => void }) => {
      opts.onProgress?.(60);
      return "https://storage.googleapis.com/olmart/shops/seller_42/studio_1_artisan.png";
    });
    mockApiPut.mockRejectedValueOnce(new Error("Erreur serveur 500"));
    mockDeleteStorage.mockResolvedValue(undefined);

    await act(async () => {
      await expect(apiHandle!.uploadMedia(makePngFile(), { folder: "banners", allowVideo: false })).rejects.toThrow("Erreur serveur 500");
    });

    expect(mockDeleteStorage).toHaveBeenCalledTimes(1);
    expect(String(mockDeleteStorage.mock.calls[0][0])).toContain("shops/seller_42/");
    expect(container.querySelector('[data-testid="err"]')?.textContent).toBe("Erreur serveur 500");

    // Protected system/catalog ID must NOT trigger config mutation or Storage delete
    await act(async () => {
      await apiHandle!.deleteMedia("logo");
      await apiHandle!.deleteMedia("prod_99");
    });
    expect(mockApiPut).toHaveBeenCalledTimes(1); // Only the failed upload call above
    expect(mockDeleteStorage).toHaveBeenCalledTimes(1);
  });
});
