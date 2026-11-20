export type { MasterThemeArchetype } from "./archetypeFactory";
import { ARCHETYPES_PART1 } from "./themeArchetypesPart1";
import { ARCHETYPES_PART2 } from "./themeArchetypesPart2";

export const MASTER_THEME_ARCHETYPES = [
  ...ARCHETYPES_PART1,
  ...ARCHETYPES_PART2,
];
