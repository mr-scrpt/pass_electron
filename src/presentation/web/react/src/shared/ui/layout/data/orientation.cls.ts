import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { LAYOUT_ORIENTATION } from "../domain/orientation/orientation.const";
import type { LayoutOrientationType } from "../domain/orientation/orientation.type";

export const layoutOrientationCls = {
  [LAYOUT_ORIENTATION.VERTICAL]: ["flex-col"],
  [LAYOUT_ORIENTATION.HORIZONTAL]: ["flex-row"],
} satisfies EnsureAllKeys<LayoutOrientationType, string[]>;
