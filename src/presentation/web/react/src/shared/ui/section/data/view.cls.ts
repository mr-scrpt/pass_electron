import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { SECTION_VIEW } from "../domain/view/view.const";
import type { SectionViewType } from "../domain/view/view.type";

export const sectionViewCls = {
  [SECTION_VIEW.PRIMARY]: ["bg-ctp-base"],
  [SECTION_VIEW.SECONDARY]: ["bg-ctp-surface0"],
} satisfies EnsureAllKeys<SectionViewType, string[]>;
