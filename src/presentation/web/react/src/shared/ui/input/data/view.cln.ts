import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { INPUT_VIEW, type InputViewType } from "../domain/view.type";

const commonViewStyleList = [
  "rounded-md",
  "border-2",
  "bg-transparent",
  "shadow-sm",
  "transition-all",
];

export const inputViewCls = {
  [INPUT_VIEW.PRIMARY]: [
    ...commonViewStyleList,
    "border-input",
    "text-ctp-mauve",
    "placeholder:text-muted-foreground",
  ],

  [INPUT_VIEW.SECONDARY]: [
    ...commonViewStyleList,
    "border-ctp-green",
    "text-ctp-green",
    "placeholder:text-ctp-green/60",
  ],

  [INPUT_VIEW.OUTLINE]: [
    ...commonViewStyleList,
    "border-input",
    "text-foreground",
    "placeholder:text-muted-foreground",
  ],
} satisfies EnsureAllKeys<InputViewType, string[]>;
