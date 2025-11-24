import { createBrandedDict } from "@/shared/lib/typescript";

const PAGE_ITEM_VIEW_BRAND = "PAGE_VIEW_BRAND" as const;

export const PAGE_ITEM_VIEW_VALUE_LIST = ["PRIMARY", "SCONDARY"] as const;

export const PAGE_ITEM_VIEW = createBrandedDict(
  PAGE_ITEM_VIEW_VALUE_LIST,
  PAGE_ITEM_VIEW_BRAND,
);

export type PageItemViewType =
  (typeof PAGE_ITEM_VIEW)[keyof typeof PAGE_ITEM_VIEW];
