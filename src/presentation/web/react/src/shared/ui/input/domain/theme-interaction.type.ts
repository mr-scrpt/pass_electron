import { createBrandedDict } from "@/shared/lib/typescript";

const INTERACTION_THEME_BRAND = "InteractionTheme" as const;

export const INTERACTION_THEME_ARRAY = [
  "PRIMARY",
  "SECONDARY",
  "SUCCESS",
  "ATTENTION",
  "WARNING",
  "NONE",
] as const;

export const INTERACTION_THEME = createBrandedDict(
  INTERACTION_THEME_ARRAY,
  INTERACTION_THEME_BRAND,
);

export type InteractionThemeType =
  typeof INTERACTION_THEME[keyof typeof INTERACTION_THEME];

/**
 * Набор интерактивных тем для Input
 * Input имеет три типа интерактивных состояний: focus, hover, active
 */
export type InputInteractionThemeType = {
  focus: InteractionThemeType;
  hover: InteractionThemeType;
  active: InteractionThemeType;
};
