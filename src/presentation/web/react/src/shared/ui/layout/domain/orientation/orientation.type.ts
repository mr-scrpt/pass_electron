import type { LAYOUT_ORIENTATION } from "./orientation.const";

export type LayoutOrientationType = (typeof LAYOUT_ORIENTATION)[keyof typeof LAYOUT_ORIENTATION];
