import { LOGO_SIZE } from "./size.type";

export const logoSize = {
  [LOGO_SIZE.S]: 20,
  [LOGO_SIZE.M]: 40,
  [LOGO_SIZE.L]: 80,
  [LOGO_SIZE.XL]: 140,
} satisfies Record<LOGO_SIZE, number>;
