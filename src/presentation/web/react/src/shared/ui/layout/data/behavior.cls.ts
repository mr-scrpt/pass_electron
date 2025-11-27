import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { LAYOUT_BEHAVIOR } from "../domain/behavior/behavior.const";
import type { LayoutBehaviorType } from "../domain/behavior/behavior.type";

export const layoutBehaviorCls = {
  [LAYOUT_BEHAVIOR.FIXED]: ["flex-grow-0", "flex-shrink-0"],
  [LAYOUT_BEHAVIOR.FLUID]: ["flex-grow"],
} satisfies EnsureAllKeys<LayoutBehaviorType, string[]>;
