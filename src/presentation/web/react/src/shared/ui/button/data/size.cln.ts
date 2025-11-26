import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { BUTTON_SIZE } from "../domain/size/size.const";
import type { ButtonSizeType } from "../domain/size/size.type";

export const buttonSizeCls = {
  [BUTTON_SIZE.S]: ["h-6", "px-2", "py-1", "text-xs"],
  [BUTTON_SIZE.M]: ["h-8 px-3 py-1 text-sm"],
  [BUTTON_SIZE.L]: ["h-9 px-3 py-1 text-base md:text-sm"],
  [BUTTON_SIZE.XL]: ["h-10 px-4 py-2 text-base"],
} satisfies EnsureAllKeys<ButtonSizeType, string[]>;
