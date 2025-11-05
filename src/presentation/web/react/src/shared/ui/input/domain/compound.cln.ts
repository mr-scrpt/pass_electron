import { INPUT_VIEW } from "./view.type";
import { INPUT_STATE } from "./state.type";

export const inputCompoundCln = [
  {
    state: INPUT_STATE.DISABLED,
    className: ["focus-visible:ring-0"],
  },

  {
    state: INPUT_STATE.READONLY,
    className: ["focus-visible:ring-0"],
  },

  {
    view: INPUT_VIEW.PIMARY,
    state: INPUT_STATE.ERROR,
    className: ["focus-visible:ring-destructive"],
  },

  {
    view: INPUT_VIEW.SECONDARY,
    state: INPUT_STATE.ERROR,
    className: [
      "border-destructive",
      "text-destructive",
      "focus-visible:ring-destructive",
    ],
  },

  {
    state: INPUT_STATE.SUCCESS,
    className: ["focus-visible:ring-ctp-green"],
  },
];
