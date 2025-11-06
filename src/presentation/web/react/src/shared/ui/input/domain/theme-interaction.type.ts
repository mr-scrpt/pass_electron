import { createDict } from "@/shared/lib/typescript";

export const INTERACTION_THEME_ARRAY = [
  "PRIMARY",
  "SECONDARY",
  "SUCCESS",
  "ATTENTION",
  "WARNING",
  "NONE",
] as const;

export const INTERACTION_THEME = createDict(INTERACTION_THEME_ARRAY);

export type InteractionThemeType = (typeof INTERACTION_THEME_ARRAY)[number];

/**
 * Набор интерактивных тем для Input
 * Input имеет три типа интерактивных состояний: focus, hover, active
 */
export type InputInteractionThemeType = {
  focus: InteractionThemeType;
  hover: InteractionThemeType;
  active: InteractionThemeType;
};
