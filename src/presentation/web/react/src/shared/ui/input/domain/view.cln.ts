//  src/presentation/web/react/src/shared/ui/input/domain/view.cln.ts
import { INPUT_VIEW, type InputViewType } from "./view.type";

const commonViewStyles = [
  "rounded-md border-2",
  "bg-transparent",
  "shadow-sm",
  "transition-colors",
];

export const inputViewCln = {
  [INPUT_VIEW.PIMARY]: [
    ...commonViewStyles,
    "border-input",
    "text-ctp-mauve",
    "placeholder:text-muted-foreground",
    "focus-visible:ring-2",
    "focus-visible:ring-ring",
  ],

  [INPUT_VIEW.SECONDARY]: [
    ...commonViewStyles,
    "border-ctp-green",
    "text-ctp-green",
    "placeholder:text-ctp-green/60",
    "focus-visible:ring-2",
    "focus-visible:ring-ctp-green",
  ],
} satisfies Record<InputViewType, Array<string>>;
