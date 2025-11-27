import { createBrandedDict } from "@/shared/lib/typescript";

const TITLE_VIEW_BRAND = "TitleView" as const;

export const TITLE_VIEW_VALUE_LIST = ["PRIMARY", "SECONDARY"] as const;

export const TITLE_VIEW = createBrandedDict(
    TITLE_VIEW_VALUE_LIST,
    TITLE_VIEW_BRAND,
);
