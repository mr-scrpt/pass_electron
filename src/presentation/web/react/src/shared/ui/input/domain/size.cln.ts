import { INPUT_SIZE, type InputSizeType } from "./size.type";
import type { EnsureAllKeys } from "@/shared/lib/typescript";

export const inputSizeCln = {
  [INPUT_SIZE.S]: ["h-6", "px-2", "py-1", "text-xs"],
  [INPUT_SIZE.M]: ["h-8 px-3 py-1 text-sm"],
  [INPUT_SIZE.L]: ["h-9 px-3 py-1 text-base md:text-sm"],
  [INPUT_SIZE.XL]: ["h-10 px-4 py-2 text-base"],
} satisfies EnsureAllKeys<InputSizeType, string[]>;
