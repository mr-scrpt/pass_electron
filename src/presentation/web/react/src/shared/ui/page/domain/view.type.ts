import { createBrandedDict } from "@/shared/lib/typescript";

const PAGE_VIEW_BRAND = "PAGE_VIEW_BRAND" as const;

export const PAGE_VIEW_VALUE_LIST = ["PRIMARY", "SCONDARY"] as const;

export const PAGE_VIEW = createBrandedDict(
  PAGE_VIEW_VALUE_LIST,
  PAGE_VIEW_BRAND,
);

export type PageViewType = (typeof PAGE_VIEW)[keyof typeof PAGE_VIEW];
