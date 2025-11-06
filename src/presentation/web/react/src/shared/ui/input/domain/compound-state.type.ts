// src/presentation/web/react/src/shared/ui/input/domain/compound-state.type.ts

import { INPUT_VIEW } from './view.type';
import { INPUT_STATE } from './state.type';

/**
 * АВТОМАТИЧЕСКАЯ генерация compound state enum
 * 
 * Принимает исходные enum'ы и создает декартово произведение (VIEW × STATE)
 * Генерирует enum с ключами вида: "PIMARY_IDLE", "PIMARY_ERROR", и т.д.
 */
function generateCompoundStateEnum<
  TView extends Record<string, string | number>,
  TState extends Record<string, string | number>
>(views: TView, states: TState) {
  const result: Record<string, number> = {};
  let counter = 0;
  
  // Получаем только строковые ключи (имена enum'ов)
  // TypeScript enum имеет обратный маппинг: { NAME: 0, 0: "NAME" }
  const viewKeys = Object.keys(views).filter(k => isNaN(Number(k)));
  const stateKeys = Object.keys(states).filter(k => isNaN(Number(k)));
  
  // Генерируем все комбинации VIEW × STATE
  viewKeys.forEach(viewKey => {
    stateKeys.forEach(stateKey => {
      const compoundKey = `${viewKey}_${stateKey}`;
      result[compoundKey] = counter++;
    });
  });
  
  return result as {
    [VK in keyof TView as VK extends string 
      ? `${VK}_${Extract<keyof TState, string>}` 
      : never
    ]: number
  };
}

/**
 * АВТОМАТИЧЕСКИ сгенерированный enum
 * Покрывает ВСЕ комбинации INPUT_VIEW × INPUT_STATE
 * 
 * Если добавить новый VIEW или STATE - автоматически появятся новые комбинации
 * 
 * Пример:
 * - INPUT_VIEW.PIMARY (0) + INPUT_STATE.IDLE (0) → INPUT_COMPOUND_STATE.PIMARY_IDLE (0)
 * - INPUT_VIEW.PIMARY (0) + INPUT_STATE.ERROR (1) → INPUT_COMPOUND_STATE.PIMARY_ERROR (1)
 * - и т.д.
 */
export const INPUT_COMPOUND_STATE = generateCompoundStateEnum(INPUT_VIEW, INPUT_STATE);

/**
 * Тип извлекается автоматически из сгенерированного enum
 */
export type InputCompoundStateType = typeof INPUT_COMPOUND_STATE[keyof typeof INPUT_COMPOUND_STATE];

/**
 * Type guard для проверки в runtime
 */
export function isValidCompoundState(value: number): value is InputCompoundStateType {
  return Object.values(INPUT_COMPOUND_STATE).includes(value);
}

/**
 * Утилита для получения compound state из view + state
 * Используется для отладки и логирования
 */
export function getCompoundStateName(view: INPUT_VIEW, state: INPUT_STATE): string {
  const viewKey = Object.keys(INPUT_VIEW).find(k => INPUT_VIEW[k as keyof typeof INPUT_VIEW] === view);
  const stateKey = Object.keys(INPUT_STATE).find(k => INPUT_STATE[k as keyof typeof INPUT_STATE] === state);
  return `${viewKey}_${stateKey}`;
}
