import { LOGO_SIZE, type LogoSizeType } from "../domain/size.type";

export const logoSizeCln = {
  [LOGO_SIZE.S]: "w-6 h-6", // 24px
  [LOGO_SIZE.M]: "w-8 h-8", // 32px
  [LOGO_SIZE.L]: "w-12 h-12", // 48px
  [LOGO_SIZE.XL]: "w-16 h-16", // 64px
} satisfies Record<LogoSizeType, string>;
