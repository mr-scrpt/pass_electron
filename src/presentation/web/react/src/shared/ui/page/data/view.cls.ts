import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { PAGE_VIEW, type PageViewType } from "../domain/view.type";

export const pageViewCls = {
  [PAGE_VIEW.PRIMARY]: ["bg-ctp-surface0"],
  [PAGE_VIEW.SCONDARY]: ["bg-ctp-base"],
} satisfies EnsureAllKeys<PageViewType, string[]>;
