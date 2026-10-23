import { CATEGORY_PRESETS_PART1 } from "./categoryPresetsPart1";
import { CATEGORY_PRESETS_PART2 } from "./categoryPresetsPart2";
import { CategoryPreset } from "./categoryPresetTypes";

export * from "./categoryPresetTypes";

export const CATEGORY_PRESETS: CategoryPreset[] = [
  ...CATEGORY_PRESETS_PART1,
  ...CATEGORY_PRESETS_PART2,
];
