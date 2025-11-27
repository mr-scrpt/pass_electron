import type { SECTION_GAP } from "./gap.const";

export type SectionGapType = (typeof SECTION_GAP)[keyof typeof SECTION_GAP];
