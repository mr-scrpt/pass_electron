// src/presentation/web/react/src/shared/ui/input/domain/compound-state.cln.ts

import { INPUT_COMPOUND_STATE } from './compound-state.type';

/**
 * Статические стили для каждого compound state
 * Только стили, никакой логики
 * 
 * VIEW определяет как визуализировать STATE
 */
export const inputCompoundStateCln = {
  // ========================================
  // PRIMARY комбинации
  // ========================================
  [INPUT_COMPOUND_STATE.PRIMARY_IDLE]: [],
  
  [INPUT_COMPOUND_STATE.PRIMARY_ERROR]: [
    'border-destructive',
    'text-destructive',
  ],
  
  [INPUT_COMPOUND_STATE.PRIMARY_SUCCESS]: [
    'border-ctp-green',
    'text-foreground',
  ],
  
  [INPUT_COMPOUND_STATE.PRIMARY_WARNING]: [
    'border-ctp-peach',
    'text-ctp-peach',
  ],

  // ========================================
  // SECONDARY комбинации (отличаются от PRIMARY!)
  // ========================================
  [INPUT_COMPOUND_STATE.SECONDARY_IDLE]: [],
  
  [INPUT_COMPOUND_STATE.SECONDARY_ERROR]: [
    'bg-destructive',       // ← Красный фон (отличается от PRIMARY!)
    'text-ctp-base',
    'border-destructive',
  ],
  
  [INPUT_COMPOUND_STATE.SECONDARY_SUCCESS]: [
    'bg-ctp-green',        // ← Зеленый фон
    'text-ctp-base',
    'border-ctp-green',
  ],
  
  [INPUT_COMPOUND_STATE.SECONDARY_WARNING]: [
    'bg-ctp-peach',        // ← Оранжевый фон
    'text-ctp-base',
    'border-ctp-peach',
  ],
} satisfies Record<INPUT_COMPOUND_STATE, string[]>;
