import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { SECTION_GAP, type SectionGapType } from "../domain/gap.type";

export const sectionGapCls = {
  [SECTION_GAP.PRIMARY]: ["p-4", "md:p-8"],
  [SECTION_GAP.FREE]: ["p-0"],
} satisfies EnsureAllKeys<SectionGapType, string[]>;
