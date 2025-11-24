import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { SECTION_AREA, type SectionAreaType } from "../domain/area.type";

export const sectionAreaCls = {
  [SECTION_AREA.FULL]: ["w-full"],

  [SECTION_AREA.CONTAINER]: ["container", "w-full"],
} satisfies EnsureAllKeys<SectionAreaType, string[]>;
