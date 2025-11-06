import { resolveCompoundState } from '@/shared/lib/compound-state-resolver';
import { inputCompoundStateMapping } from '../domain/compound.config';
import { inputCompoundStateCln } from '../domain/compound-state.cln';
import { inputCompoundStateBehaviorCln } from '../domain/compound-state-behavior.cln';
import { focusThemeCln, hoverThemeCln, activeThemeCln } from '../domain/theme-interaction.cln';
import type { INPUT_VIEW } from '../domain/view.type';
import type { INPUT_STATE } from '../domain/state.type';

type ResolveInputThemeParams = {
  view: INPUT_VIEW;
  state: INPUT_STATE;
};

type ResolvedInputTheme = {
  static: string[];
  focus: string[];
  hover: string[];
  active: string[];
};

/**
 * Резолвит ВСЕ стили для Input (статические + интерактивные)
 * 
 * Алгоритм:
 * 1. view + state → compound state (через универсальный resolver)
 * 2. compound state → статические стили
 * 3. compound state → интерактивное поведение
 * 4. интерактивное поведение → классы
 * 
 * НЕТ if'ов - только lookup через compound state
 */
export function resolveInputTheme(params: ResolveInputThemeParams): ResolvedInputTheme {
  // 1. Резолвим compound state
  const compoundState = resolveCompoundState(inputCompoundStateMapping, params);
  
  // 2. Получаем статические стили
  const staticStyles = inputCompoundStateCln[compoundState];
  
  // 3. Получаем интерактивное поведение
  const behavior = inputCompoundStateBehaviorCln[compoundState];
  
  // 4. Получаем классы для интерактивных тем
  const focusClasses = focusThemeCln[behavior.focus];
  const hoverClasses = hoverThemeCln[behavior.hover];
  const activeClasses = activeThemeCln[behavior.active];
  
  return {
    static: staticStyles,
    focus: focusClasses,
    hover: hoverClasses,
    active: activeClasses,
  };
}

/**
 * Получает все классы одним массивом
 */
export function getInputThemeClasses(theme: ResolvedInputTheme): string[] {
  return [
    ...theme.static,
    ...theme.focus,
    ...theme.hover,
    ...theme.active,
  ];
}
