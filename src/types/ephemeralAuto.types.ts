import {
  VehiclePublicDetailDto,
  VehicleSellerPrivateDto,
  VehicleFuel,
  VehicleTransmission,
  VehiclePaperStatus,
  VehicleBodyCondition,
  VehiclePriceType,
} from "../domains/auto/auto.types";
import { AutoPartDto } from "../domains/auto/autoParts.types";

export interface EphemeralVehicleConfig {
  id: string;
  title: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  mileage: number;
  fuel: VehicleFuel;
  transmission: VehicleTransmission;
  paperStatus: VehiclePaperStatus;
  bodyCondition: VehicleBodyCondition;
  price: number;
  priceType: VehiclePriceType;
  wilayaId: number;
  wilayaName: string;
  commune: string;
  options: string[];
  description: string;
  accentColor: string;
}

export interface EphemeralAutoState {
  enabled: boolean;
  selectedPresetId: string;
  customConfig: EphemeralVehicleConfig;
}

export interface UseEphemeralAutoStudioReturn {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  selectedPresetId: string;
  selectPreset: (presetId: string) => void;
  customConfig: EphemeralVehicleConfig;
  updateCustomConfig: (patch: Partial<EphemeralVehicleConfig>) => void;
  resetCustomConfig: () => void;
  ephemeralVehicles: VehiclePublicDetailDto[];
  ephemeralSellerListings: VehicleSellerPrivateDto[];
  ephemeralParts: AutoPartDto[];
  activeEphemeralVehicle: VehiclePublicDetailDto;
  getEphemeralVehicleById: (id: string) => VehiclePublicDetailDto | null;
}
