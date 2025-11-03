import { TITLE_SIZE } from "./size.type";

export const titleSizeCln = {
  [TITLE_SIZE.S]: "text-l",
  [TITLE_SIZE.M]: "text-xl",
  [TITLE_SIZE.L]: "text-2xl",
  [TITLE_SIZE.XL]: "text-4xl",
} satisfies Record<TITLE_SIZE, string>;
