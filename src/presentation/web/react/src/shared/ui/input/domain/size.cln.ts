//  src/presentation/web/react/src/shared/ui/input/domain/size.cln.ts
import { INPUT_SIZE } from "./size.type";

// Теперь каждый размер контролирует высоту, паддинги и размер шрифта
export const inputSizeCln = {
  [INPUT_SIZE.S]: ["h-6", "px-2", "py-1", "text-xs"],
  [INPUT_SIZE.M]: ["h-8 px-3 py-1 text-sm"],
  [INPUT_SIZE.L]: ["h-9 px-3 py-1 text-base md:text-sm"], // Это ваш оригинальный размер
  [INPUT_SIZE.XL]: ["h-10 px-4 py-2 text-base"],
} satisfies Record<INPUT_SIZE, Array<string>>;
