import { Layout as LayoutRoot } from "./ui/layout";
import { Area } from "./ui/area";

type LayoutCompound = typeof LayoutRoot & {
  Area: typeof Area;
};

const Layout = LayoutRoot as LayoutCompound;
Layout.Area = Area;

export { Layout };

export { LAYOUT_ORIENTATION } from "./domain/orientation/orientation.const";
export type { LayoutOrientationType } from "./domain/orientation/orientation.type";
export { LAYOUT_BEHAVIOR } from "./domain/behavior/behavior.const";
export type { LayoutBehaviorType } from "./domain/behavior/behavior.type";
