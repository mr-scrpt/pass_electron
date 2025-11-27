import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { PAGE_APPEARANCE } from "../domain/appearance/appearance.const";
import type { PageAppearanceType } from "../domain/appearance/appearance.type";

export const pageAppearanceCls = {
  [PAGE_APPEARANCE.DEFAULT]: [],
  [PAGE_APPEARANCE.SURFACE]: ["bg-ctp-surface0"],
  [PAGE_APPEARANCE.TRANSPARENT]: ["bg-transparent"],
} satisfies EnsureAllKeys<PageAppearanceType, string[]>;
