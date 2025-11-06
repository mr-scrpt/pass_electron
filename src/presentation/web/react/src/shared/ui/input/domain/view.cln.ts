//  src/presentation/web/react/src/shared/ui/input/domain/view.cln.ts
import { INPUT_VIEW, type InputViewType } from './view.type';

/**
 * Общие стили для всех view вариантов
 * НЕ включают интерактивные стили (focus, hover, active) - они управляются compound матрицей
 */
const commonViewStyles = [
  'rounded-md border-2',
  'bg-transparent',
  'shadow-sm',
  'transition-colors',
];

/**
 * Статичные стили для каждого view варианта
 * Используются через CVA в class builder
 */
export const inputViewCln = {
  [INPUT_VIEW.PIMARY]: [
    ...commonViewStyles,
    'border-input',
    'text-ctp-mauve',
    'placeholder:text-muted-foreground',
  ],

  [INPUT_VIEW.SECONDARY]: [
    ...commonViewStyles,
    'border-ctp-green',
    'text-ctp-green',
    'placeholder:text-ctp-green/60',
  ],
} satisfies Record<InputViewType, Array<string>>;
