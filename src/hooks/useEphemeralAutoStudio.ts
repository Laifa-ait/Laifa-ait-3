import { useState, useEffect, useCallback, useMemo } from "react";
import {
  EphemeralAutoState,
  EphemeralVehicleConfig,
  UseEphemeralAutoStudioReturn,
} from "../types/ephemeralAuto.types";
import { VehiclePublicDetailDto, VehicleSellerPrivateDto } from "../domains/auto/auto.types";
import { AutoPartDto } from "../domains/auto/autoParts.types";
import {
  EPHEMERAL_PRESETS,
  buildVehicleStudioSvgDataUri,
  configToPublicDto,
} from "../domains/auto/ephemeralAutoPresets";

export { EPHEMERAL_PRESETS, buildVehicleStudioSvgDataUri };

const STORAGE_KEY = "olmart_ephemeral_auto_studio_v1";
const SYNC_EVENT = "olmart:ephemeral-auto-sync";

function readInitialState(): EphemeralAutoState {
  if (typeof window === "undefined") {
    return { enabled: true, selectedPresetId: EPHEMERAL_PRESETS[0].id, customConfig: EPHEMERAL_PRESETS[0] };
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as EphemeralAutoState;
      if (parsed && parsed.customConfig && parsed.customConfig.brand) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  return { enabled: true, selectedPresetId: EPHEMERAL_PRESETS[0].id, customConfig: EPHEMERAL_PRESETS[0] };
}

export function useEphemeralAutoStudio(): UseEphemeralAutoStudioReturn {
  const [state, setState] = useState<EphemeralAutoState>(readInitialState);

  const persistAndBroadcast = useCallback((next: EphemeralAutoState) => {
    setState(next);
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: next }));
      } catch {
        // Ignore storage quota errors
      }
    }
  }, []);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<EphemeralAutoState>;
      setState(customEvent.detail || readInitialState());
    };
    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, []);

  const setEnabled = useCallback(
    (enabled: boolean) => persistAndBroadcast({ ...state, enabled }),
    [state, persistAndBroadcast]
  );

  const selectPreset = useCallback(
    (presetId: string) => {
      const found = EPHEMERAL_PRESETS.find((p) => p.id === presetId) || EPHEMERAL_PRESETS[0];
      persistAndBroadcast({
        enabled: true,
        selectedPresetId: found.id,
        customConfig: { ...found, id: "ephemeral-custom" },
      });
    },
    [persistAndBroadcast]
  );

  const updateCustomConfig = useCallback(
    (patch: Partial<EphemeralVehicleConfig>) => {
      const nextCustom: EphemeralVehicleConfig = {
        ...state.customConfig,
        ...patch,
        id: "ephemeral-custom",
        title:
          patch.title !== undefined
            ? patch.title
            : `${patch.brand || state.customConfig.brand} ${patch.model || state.customConfig.model} ${
                patch.version || state.customConfig.version
              }`.trim(),
      };
      persistAndBroadcast({ ...state, enabled: true, customConfig: nextCustom });
    },
    [state, persistAndBroadcast]
  );

  const resetCustomConfig = useCallback(() => {
    persistAndBroadcast({
      enabled: true,
      selectedPresetId: EPHEMERAL_PRESETS[0].id,
      customConfig: EPHEMERAL_PRESETS[0],
    });
  }, [persistAndBroadcast]);

  const ephemeralVehicles = useMemo<VehiclePublicDetailDto[]>(() => {
    return [
      configToPublicDto(state.customConfig, 0),
      configToPublicDto(EPHEMERAL_PRESETS[1], 1),
      configToPublicDto(EPHEMERAL_PRESETS[2], 2),
    ];
  }, [state.customConfig]);

  const ephemeralSellerListings = useMemo<VehicleSellerPrivateDto[]>(() => {
    return ephemeralVehicles.map((pub, idx) => ({
      id: pub.id,
      ownerUid: "ephemeral-studio-seller",
      status: idx === 0 ? "active" : idx === 1 ? "pending_review" : "active",
      sellerPhoneNumber: "0550123456",
      sellerWhatsappNumber: "0550123456",
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      deletedAt: null,
      publicData: pub,
    }));
  }, [ephemeralVehicles]);

  const ephemeralParts = useMemo<AutoPartDto[]>(() => {
    const cfg = state.customConfig;
    return [
      {
        id: "ephemeral-part-1",
        title: `Optique Full LED Avant Droit · ${cfg.brand} ${cfg.model}`,
        category: "optique",
        condition: "tres_bon_etat",
        priceDZD: 68000,
        isPriceNegotiable: true,
        wilayaId: cfg.wilayaId,
        commune: cfg.commune,
        compatibilities: [{ brand: cfg.brand, model: cfg.model, yearStart: cfg.year - 2, yearEnd: cfg.year + 1, isCertified: true }],
        images: [buildVehicleStudioSvgDataUri(cfg.brand, "Optique Full LED", cfg.year, "#E99856")],
        description: "Optique d'origine testé sur banc électronique, pattes de fixation intactes, garantie 3 mois.",
        sellerId: "ephemeral-casse-pro",
        sellerName: "Casse Agréée Olmart Auto",
        isJunkYard: true,
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ephemeral-part-2",
        title: `Kit Moteur & Distribution OEM · ${cfg.brand} ${cfg.model}`,
        category: "moteur",
        condition: "neuf",
        priceDZD: 94000,
        isPriceNegotiable: false,
        wilayaId: 16,
        commune: "Bab Ezzouar",
        compatibilities: [{ brand: cfg.brand, model: cfg.model, yearStart: 2019, yearEnd: 2025, isCertified: true }],
        images: [buildVehicleStudioSvgDataUri(cfg.brand, "Kit Moteur OEM", cfg.year, "#A54055")],
        description: "Pièce neuve d'origine constructeur sous scellé avec expédition 69 Wilayas.",
        sellerId: "ephemeral-pieces-pro",
        sellerName: "Comptoir Pièces Auto Algérie",
        isJunkYard: false,
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ];
  }, [state.customConfig]);

  const getEphemeralVehicleById = useCallback(
    (id: string): VehiclePublicDetailDto | null => {
      return ephemeralVehicles.find((v) => v.id === id) || null;
    },
    [ephemeralVehicles]
  );

  return {
    enabled: state.enabled,
    setEnabled,
    selectedPresetId: state.selectedPresetId,
    selectPreset,
    customConfig: state.customConfig,
    updateCustomConfig,
    resetCustomConfig,
    ephemeralVehicles,
    ephemeralSellerListings,
    ephemeralParts,
    activeEphemeralVehicle: ephemeralVehicles[0],
    getEphemeralVehicleById,
  };
}
