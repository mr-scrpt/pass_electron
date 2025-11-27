import type { SECTION_AREA } from "./area.const";

export type SectionAreaType = (typeof SECTION_AREA)[keyof typeof SECTION_AREA];
