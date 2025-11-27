import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { SECTION_DECO } from "../domain/deco/deco.const";
import type { SectionViewType } from "../domain/view/view.type";

const commonDecoBorderStyleList = ["border-3", "border-ctp-surface0"];

export const sectionDecoCls = {
  [SECTION_DECO.BDR_FULL]: [...commonDecoBorderStyleList],
  [SECTION_DECO.BDR_CUP]: [...commonDecoBorderStyleList, "border-t-0"],
} satisfies EnsureAllKeys<SectionViewType, string[]>;
