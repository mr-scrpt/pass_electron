// src/presentation/web/react/src/shared/ui/input/domain/state.type.ts
import { getEnumKeys } from '@/shared/lib/typescript';

/**
 * Семантические состояния Input
 * Не определяют стили напрямую - стили зависят от VIEW
 */
export enum INPUT_STATE {
  IDLE,      // Нейтральное состояние (без изменений)
  ERROR,     // Ошибка валидации
  SUCCESS,   // Успешная валидация
  WARNING,   // Предупреждение
}

export type InputStateType = INPUT_STATE;
export const INPUT_STATE_KEY = getEnumKeys(INPUT_STATE);
