import { createBrandedDict } from "@/shared/lib/typescript";

const LAYOUT_ORIENTATION_BRAND = "LAYOUT_ORIENTATION_BRAND" as const;

export const LAYOUT_ORIENTATION_VALUE_LIST = ["VERTICAL", "HORIZONTAL"] as const;

export const LAYOUT_ORIENTATION = createBrandedDict(
  LAYOUT_ORIENTATION_VALUE_LIST,
  LAYOUT_ORIENTATION_BRAND,
);
