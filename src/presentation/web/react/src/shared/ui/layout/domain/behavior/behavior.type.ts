import type { LAYOUT_BEHAVIOR } from "./behavior.const";

export type LayoutBehaviorType = (typeof LAYOUT_BEHAVIOR)[keyof typeof LAYOUT_BEHAVIOR];
