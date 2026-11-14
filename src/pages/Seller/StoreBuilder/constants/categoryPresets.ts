import { CATEGORY_PRESETS_PART1 } from "./categoryPresetsPart1";
import { CATEGORY_PRESETS_PART2 } from "./categoryPresetsPart2";
import { SECTOR_EXTRA_CATEGORY_PRESETS } from "./sectorCoherenceDefaults";
import { CategoryPreset } from "./categoryPresetTypes";

export * from "./categoryPresetTypes";

export const CATEGORY_PRESETS: CategoryPreset[] = [
  ...CATEGORY_PRESETS_PART1,
  ...CATEGORY_PRESETS_PART2,
  SECTOR_EXTRA_CATEGORY_PRESETS.maison,
  SECTOR_EXTRA_CATEGORY_PRESETS.sport,
  SECTOR_EXTRA_CATEGORY_PRESETS.accessoires,
  SECTOR_EXTRA_CATEGORY_PRESETS.enfants,
];

