/**
 * Нативные HTML состояния
 * ВАЖНО: Эти стили ДОЛЖНЫ перебивать все интерактивные темы через CSS специфичность
 */

/**
 * Стили для disabled состояния
 * Перебивают все интерактивные стили (focus, hover, active)
 */
export const inputDisabledCln = [
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',

  // Сброс интерактивных состояний
  'disabled:hover:border-input',
  'disabled:hover:bg-transparent',
  'disabled:focus-visible:ring-0',
  'disabled:active:scale-100',
  'disabled:active:bg-transparent',
];

/**
 * Стили для readonly состояния
 * Перебивают все интерактивные стили (focus, hover, active)
 */
export const inputReadonlyCln = [
  'read-only:cursor-default',
  'read-only:bg-muted/30',

  // Сброс интерактивных состояний
  'read-only:hover:border-input',
  'read-only:hover:bg-transparent',
  'read-only:focus-visible:ring-0',
  'read-only:active:scale-100',
  'read-only:active:bg-transparent',
];

/**
 * Объединенные native state стили
 */
export const inputNativeStateCln = [...inputDisabledCln, ...inputReadonlyCln];
