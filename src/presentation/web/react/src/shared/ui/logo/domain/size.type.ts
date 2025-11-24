import { createBrandedDict } from "@/shared/lib/typescript";

const LOGO_SIZE_BRAND = "LOGO_SIZE_BRAND" as const;

export const LOGO_SIZE_VALUE_LIST = ["S", "M", "L", "XL"] as const;

export const LOGO_SIZE = createBrandedDict(
  LOGO_SIZE_VALUE_LIST,
  LOGO_SIZE_BRAND,
);

export type LogoSizeType = (typeof LOGO_SIZE)[keyof typeof LOGO_SIZE];
