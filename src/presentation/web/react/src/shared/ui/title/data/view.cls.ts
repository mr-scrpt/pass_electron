import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { TITLE_VIEW } from "../domain/view/view.const";
import type { TitleViewType } from "../domain/view/view.type";

export const titleViewCls = {
    [TITLE_VIEW.PRIMARY]: ["text-ctp-mauve"],
    [TITLE_VIEW.SECONDARY]: ["text-ctp-green"],
} satisfies EnsureAllKeys<TitleViewType, string[]>;
