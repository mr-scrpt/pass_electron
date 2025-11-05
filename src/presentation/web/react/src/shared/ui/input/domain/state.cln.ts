// src/presentation/web/react/src/shared/ui/input/domain/state.cln.ts
import { INPUT_STATE } from "./state.type";

export const inputStateCln = {
  [INPUT_STATE.DEFAULT]: [],

  [INPUT_STATE.ERROR]: [
    "border-destructive",
    "text-destructive",
    "focus-visible:ring-destructive",
  ],

  [INPUT_STATE.SUCCESS]: [
    "border-ctp-green",
    "text-foreground",
    "focus-visible:ring-ctp-green",
  ],

  [INPUT_STATE.DISABLED]: ["cursor-not-allowed", "opacity-50"],

  [INPUT_STATE.READONLY]: ["cursor-default", "bg-muted/30"],
} satisfies Record<INPUT_STATE, Array<string>>;
