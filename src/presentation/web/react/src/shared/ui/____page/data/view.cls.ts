import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { PAGE_VIEW } from "../domain/view/view.const";
import type { PageViewType } from "../domain/view/view.type";

export const pageViewCls = {
  [PAGE_VIEW.PRIMARY]: ["bg-ctp-base"],
  [PAGE_VIEW.SECONDARY]: ["bg-ctp-mantle"],
} satisfies EnsureAllKeys<PageViewType, string[]>;