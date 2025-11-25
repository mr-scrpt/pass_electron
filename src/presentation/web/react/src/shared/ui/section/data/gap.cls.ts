import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { SECTION_GAP, type SectionGapType } from "../domain/gap.type";

export const sectionGapCls = {
  [SECTION_GAP.PRIMARY]: ["px-4", "py-1", "md:px-8", "md:py-2"],
  [SECTION_GAP.FREE]: ["p-0"],
} satisfies EnsureAllKeys<SectionGapType, string[]>;
