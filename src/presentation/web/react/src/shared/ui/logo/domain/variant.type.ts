import { createBrandedDict } from "@/shared/lib/typescript";

const LOGO_VARIANT_BRAND = "LOGO_VARIANT_BRAND" as const;

export const LOGO_VARIANT_ARRAY = ["LOCK", "SHIELD"] as const;

export const LOGO_VARIANT = createBrandedDict(
    LOGO_VARIANT_ARRAY,
    LOGO_VARIANT_BRAND,
);

export type LogoVariantType = (typeof LOGO_VARIANT)[keyof typeof LOGO_VARIANT];
