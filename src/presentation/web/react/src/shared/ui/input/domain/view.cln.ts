// domain/view.cln.ts
import { INPUT_VIEW, type InputViewType } from "./view.type";

// Общие стили для всех "view" (чтобы не дублировать)
const commonViewStyles =
  "rounded-md border-2 bg-transparent shadow-sm transition-colors";

export const inputViewCln = {
  [INPUT_VIEW.PIMARY]: [
    commonViewStyles,
    "border-input", // Цвет рамки из shadcn
    "text-ctp-mauve", // Ваш кастомный цвет текста
    "placeholder:text-muted-foreground", // Цвет плейсхолдера из shadcn
    "focus-visible:ring-2", // Размер кольца фокуса
    "focus-visible:ring-ring", // Цвет кольца фокуса из shadcn
  ].join(" "),

  [INPUT_VIEW.SECONDARY]: [
    commonViewStyles,
    "border-ctp-green", // Кастомный цвет рамки
    "text-ctp-green", // Ваш кастомный цвет текста
    "placeholder:text-ctp-green/60", // Кастомный плейсхолдер
    "focus-visible:ring-2", // Размер кольца фокуса
    "focus-visible:ring-ctp-green", // Кастомный цвет кольца фокуса
  ].join(" "),
} satisfies Record<InputViewType, string>;
