// src/presentation/web/react/src/shared/ui/input/domain/state.cln.ts
import { INPUT_STATE } from './state.type';

/**
 * Статичные (не интерактивные) стили для каждого state варианта
 * Используются через CVA в class builder
 * 
 * ВАЖНО: Это только базовые стили (border, text color)
 * Интерактивные стили (focus, hover, active) управляются compound матрицей
 */
export const inputStateCln = {
  [INPUT_STATE.DEFAULT]: [],

  [INPUT_STATE.ERROR]: [
    'border-destructive',
    'text-destructive',
  ],

  [INPUT_STATE.SUCCESS]: [
    'border-ctp-green',
    'text-foreground',
  ],
} satisfies Record<INPUT_STATE, Array<string>>;
