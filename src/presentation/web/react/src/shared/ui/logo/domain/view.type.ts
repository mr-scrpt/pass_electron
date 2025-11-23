import { createBrandedDict } from "@/shared/lib/typescript";

const LOGO_VIEW_BRAND = "LOGO_VIEW_BRAND" as const;

export const LOGO_VIEW_ARRAY = ["PRIMARY", "SECONDARY"] as const;

export const LOGO_VIEW = createBrandedDict(
    LOGO_VIEW_ARRAY,
    LOGO_VIEW_BRAND,
);

export type LogoViewType = (typeof LOGO_VIEW)[keyof typeof LOGO_VIEW];
