import { createBrandedDict } from "@/shared/lib/typescript";

const TITLE_SIZE_BRAND = "TitleSize" as const;

export const TITLE_SIZE_VALUE_LIST = ["S", "M", "L", "XL"] as const;

export const TITLE_SIZE = createBrandedDict(
    TITLE_SIZE_VALUE_LIST,
    TITLE_SIZE_BRAND,
);
