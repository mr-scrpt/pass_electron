import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { BUTTON_VIEW, type ButtonViewType } from "../domain/view.type";

const commonViewStyleList = [
  "items-center",
  "justify-center",
  "rounded-md",
  "border-2",
  "bg-transparent",
  "shadow-sm",
  "transition-all",
];

export const buttonViewCls = {
  [BUTTON_VIEW.PRIMARY]: [
    ...commonViewStyleList,
    "text-ctp-mauve",
    "border-input",
  ],
  [BUTTON_VIEW.SECONDARY]: [
    ...commonViewStyleList,
    "text-ctp-green",
    "border-ctp-green",
  ],
  [BUTTON_VIEW.OUTLINE]: [
    ...commonViewStyleList,
    "text-foreground",
    "border-input",
  ],
} satisfies EnsureAllKeys<ButtonViewType, string[]>;
