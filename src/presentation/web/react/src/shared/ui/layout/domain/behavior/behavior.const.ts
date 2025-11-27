import { createBrandedDict } from "@/shared/lib/typescript";

const LAYOUT_BEHAVIOR_BRAND = "LAYOUT_BEHAVIOR_BRAND" as const;

export const LAYOUT_BEHAVIOR_VALUE_LIST = ["FIXED", "FLUID"] as const;

export const LAYOUT_BEHAVIOR = createBrandedDict(
  LAYOUT_BEHAVIOR_VALUE_LIST,
  LAYOUT_BEHAVIOR_BRAND,
);
