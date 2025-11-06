import { resolveVariant } from '@/shared/lib/variant-matcher';
import { inputCompoundConfig } from '../domain/compound.cln';
import { focusThemeCln, hoverThemeCln, activeThemeCln } from '../domain/theme-interaction.cln';
import type { INPUT_VIEW } from '../domain/view.type';
import type { INPUT_STATE } from '../domain/state.type';
import type { InputInteractionTheme } from '../domain/theme-interaction.type';

type ResolveInputThemeParams = {
  view: INPUT_VIEW;
  state: INPUT_STATE;
};

/**
 * Резолвит интерактивные темы на основе комбинации view + state
 * Использует универсальный resolveVariant - НЕТ if'ов
 */
export function resolveInputTheme(params: ResolveInputThemeParams): InputInteractionTheme {
  return resolveVariant(inputCompoundConfig, params);
}

/**
 * Получает массив классов для интерактивных тем
 */
export function getThemeClasses(theme: InputInteractionTheme): string[] {
  return [
    ...focusThemeCln[theme.focus],
    ...hoverThemeCln[theme.hover],
    ...activeThemeCln[theme.active],
  ];
}
