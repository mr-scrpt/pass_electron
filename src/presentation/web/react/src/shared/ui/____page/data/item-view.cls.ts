import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { PAGE_ITEM_VIEW } from "../domain/item-view.type";
import { type PageViewType } from "../domain/view.type";

export const pageItemViewCls = {
  [PAGE_ITEM_VIEW.PRIMARY]: ["bg-ctp-surface0"],
  [PAGE_ITEM_VIEW.SCONDARY]: ["bg-ctp-base"],
} satisfies EnsureAllKeys<PageViewType, string[]>;
