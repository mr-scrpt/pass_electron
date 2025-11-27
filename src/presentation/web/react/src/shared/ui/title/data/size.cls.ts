import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { TITLE_SIZE } from "../domain/size/size.const";
import type { TitleSizeType } from "../domain/size/size.type";

export const titleSizeCls = {
    [TITLE_SIZE.S]: ["text-l"],
    [TITLE_SIZE.M]: ["text-xl"],
    [TITLE_SIZE.L]: ["text-2xl"],
    [TITLE_SIZE.XL]: ["text-4xl"],
} satisfies EnsureAllKeys<TitleSizeType, string[]>;
