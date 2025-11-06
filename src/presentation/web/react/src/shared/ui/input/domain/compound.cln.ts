// src/presentation/web/react/src/shared/ui/input/domain/compound.cln.ts
import { INPUT_VIEW } from './view.type';
import { INPUT_STATE } from './state.type';
import { INTERACTION_THEME, type InputInteractionTheme } from './theme-interaction.type';
import type { MatcherConfig } from '@/shared/lib/variant-matcher';

/**
 * Параметры для матчинга compound вариантов
 */
type InputCompoundParams = {
  view: INPUT_VIEW;
  state: INPUT_STATE;
};

/**
 * ДЕКЛАРАТИВНАЯ конфигурация compound вариантов
 * Каждый вариант описывает комбинацию view + state и результирующие интерактивные темы
 * 
 * Приоритет вычисляется автоматически:
 * - view + state = приоритет 2 (самый специфичный)
 * - только state = приоритет 1
 * - только view = приоритет 1
 * - fallback = приоритет 0
 */
export const inputCompoundConfig: MatcherConfig<InputCompoundParams, InputInteractionTheme> = {
  variants: [
    // ========================================
    // Специфичные комбинации (view + state) - приоритет 2
    // ========================================
    {
      match: { view: INPUT_VIEW.PIMARY, state: INPUT_STATE.ERROR },
      result: {
        focus: INTERACTION_THEME.ATTENTION,
        hover: INTERACTION_THEME.ATTENTION,
        active: INTERACTION_THEME.ATTENTION,
      },
    },
    {
      match: { view: INPUT_VIEW.SECONDARY, state: INPUT_STATE.ERROR },
      result: {
        focus: INTERACTION_THEME.WARNING,
        hover: INTERACTION_THEME.WARNING,
        active: INTERACTION_THEME.WARNING,
      },
    },
    {
      match: { view: INPUT_VIEW.PIMARY, state: INPUT_STATE.SUCCESS },
      result: {
        focus: INTERACTION_THEME.SUCCESS,
        hover: INTERACTION_THEME.SUCCESS,
        active: INTERACTION_THEME.SUCCESS,
      },
    },
    {
      match: { view: INPUT_VIEW.SECONDARY, state: INPUT_STATE.SUCCESS },
      result: {
        focus: INTERACTION_THEME.SUCCESS,
        hover: INTERACTION_THEME.SUCCESS,
        active: INTERACTION_THEME.SUCCESS,
      },
    },

    // ========================================
    // State-only комбинации - приоритет 1
    // ========================================
    // (пока нет специфичных state-only правил)

    // ========================================
    // View-only комбинации - приоритет 1
    // ========================================
    {
      match: { view: INPUT_VIEW.PIMARY },
      result: {
        focus: INTERACTION_THEME.PRIMARY,
        hover: INTERACTION_THEME.PRIMARY,
        active: INTERACTION_THEME.PRIMARY,
      },
    },
    {
      match: { view: INPUT_VIEW.SECONDARY },
      result: {
        focus: INTERACTION_THEME.SECONDARY,
        hover: INTERACTION_THEME.SECONDARY,
        active: INTERACTION_THEME.SECONDARY,
      },
    },
  ],

  // Fallback - если ничего не подошло
  fallback: {
    focus: INTERACTION_THEME.NONE,
    hover: INTERACTION_THEME.NONE,
    active: INTERACTION_THEME.NONE,
  },
};
