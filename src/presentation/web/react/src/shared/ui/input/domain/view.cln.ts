import { INPUT_VIEW, type InputViewType } from "./view.type";
import type { EnsureAllKeys } from "@/shared/lib/typescript";

const commonViewStyles = [
  "rounded-md border-2",
  "bg-transparent",
  "shadow-sm",
  "transition-colors",
];

export const inputViewCln = {
  [INPUT_VIEW.PRIMARY]: [
    ...commonViewStyles,
    "border-input",
    "text-ctp-mauve",
    "placeholder:text-muted-foreground",
  ],

  [INPUT_VIEW.SECONDARY]: [
    ...commonViewStyles,
    "border-ctp-green",
    "text-ctp-green",
    "placeholder:text-ctp-green/60",
  ],
} satisfies EnsureAllKeys<InputViewType, string[]>;
