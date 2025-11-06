/**
 * Интерактивные темы - независимые от view/state
 * Переиспользуются для комбинирования разных визуальных стилей
 */
export enum INTERACTION_THEME {
  PRIMARY,
  SECONDARY,
  SUCCESS,
  ATTENTION,
  WARNING,
  NONE,
}

export type InteractionThemeType = INTERACTION_THEME;

/**
 * Набор интерактивных тем для Input
 * Input имеет три типа интерактивных состояний: focus, hover, active
 */
export type InputInteractionTheme = {
  focus: InteractionThemeType;
  hover: InteractionThemeType;
  active: InteractionThemeType;
};
