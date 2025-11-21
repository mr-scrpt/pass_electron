import { createBrandedDict } from "@/shared/lib/typescript";

const BUTTON_VIEW_BRAND = "BUTTON_VIEW_BRAND" as const;

export const BUTTON_VIEW_ARRAY = ["PRIMARY", "SECONDARY", "OUTLINE"] as const;

export const BUTTON_VIEW = createBrandedDict(
  BUTTON_VIEW_ARRAY,
  BUTTON_VIEW_BRAND,
);

export type ButtonViewType = (typeof BUTTON_VIEW)[keyof typeof BUTTON_VIEW];
