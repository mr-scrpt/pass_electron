// src/presentation/web/react/src/shared/ui/input/domain/compound-state-behavior.cln.ts

import { INPUT_COMPOUND_STATE } from './compound-state.type';
import { INTERACTION_THEME } from './theme-interaction.type';

/**
 * Интерактивное поведение для каждого compound state
 * Только темы, никакой логики
 * 
 * VIEW определяет как интерпретировать STATE для интерактивных состояний
 */
export const inputCompoundStateBehaviorCln = {
  // ========================================
  // PRIMARY комбинации
  // ========================================
  [INPUT_COMPOUND_STATE.PRIMARY_IDLE]: {
    focus: INTERACTION_THEME.PRIMARY,
    hover: INTERACTION_THEME.PRIMARY,
    active: INTERACTION_THEME.PRIMARY,
  },
  
  [INPUT_COMPOUND_STATE.PRIMARY_ERROR]: {
    focus: INTERACTION_THEME.ATTENTION,    // Красный
    hover: INTERACTION_THEME.ATTENTION,
    active: INTERACTION_THEME.ATTENTION,
  },
  
  [INPUT_COMPOUND_STATE.PRIMARY_SUCCESS]: {
    focus: INTERACTION_THEME.SUCCESS,      // Зеленый
    hover: INTERACTION_THEME.SUCCESS,
    active: INTERACTION_THEME.SUCCESS,
  },
  
  [INPUT_COMPOUND_STATE.PRIMARY_WARNING]: {
    focus: INTERACTION_THEME.WARNING,      // Оранжевый
    hover: INTERACTION_THEME.WARNING,
    active: INTERACTION_THEME.WARNING,
  },

  // ========================================
  // SECONDARY комбинации (отличаются от PRIMARY!)
  // ========================================
  [INPUT_COMPOUND_STATE.SECONDARY_IDLE]: {
    focus: INTERACTION_THEME.SECONDARY,
    hover: INTERACTION_THEME.SECONDARY,
    active: INTERACTION_THEME.SECONDARY,
  },
  
  [INPUT_COMPOUND_STATE.SECONDARY_ERROR]: {
    focus: INTERACTION_THEME.WARNING,      // ← Оранжевый (отличается от PRIMARY!)
    hover: INTERACTION_THEME.WARNING,
    active: INTERACTION_THEME.WARNING,
  },
  
  [INPUT_COMPOUND_STATE.SECONDARY_SUCCESS]: {
    focus: INTERACTION_THEME.SUCCESS,
    hover: INTERACTION_THEME.SUCCESS,
    active: INTERACTION_THEME.SUCCESS,
  },
  
  [INPUT_COMPOUND_STATE.SECONDARY_WARNING]: {
    focus: INTERACTION_THEME.WARNING,
    hover: INTERACTION_THEME.WARNING,
    active: INTERACTION_THEME.WARNING,
  },
} satisfies Record<INPUT_COMPOUND_STATE, { focus: INTERACTION_THEME; hover: INTERACTION_THEME; active: INTERACTION_THEME }>;
