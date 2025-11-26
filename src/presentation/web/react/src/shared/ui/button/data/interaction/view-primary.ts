import { BUTTON_COMPOSITE_INTERACTION } from "../../domain/composite-interaction/composite-interaction.const";

export const interactionViewPrimary = {
  [BUTTON_COMPOSITE_INTERACTION.PRIMARY_IDLE_FOCUS]: [
    "focus-visible:not-disabled:outline-none",
    "focus-visible:not-disabled:ring-2",
    "focus-visible:not-disabled:ring-ctp-mauve",
  ],
  [BUTTON_COMPOSITE_INTERACTION.PRIMARY_IDLE_HOVER]: [
    "hover:not-disabled:border-ctp-mauve",
    "hover:not-disabled:bg-ctp-mauve/5",
  ],
  [BUTTON_COMPOSITE_INTERACTION.PRIMARY_IDLE_ACTIVE]: [
    "active:not-disabled:scale-[0.99]",
    "active:not-disabled:bg-ctp-mauve/10",
  ],

  [BUTTON_COMPOSITE_INTERACTION.PRIMARY_ERROR_FOCUS]: [
    "focus-visible:not-disabled:outline-none",
    "focus-visible:not-disabled:ring-2",
    "focus-visible:not-disabled:ring-destructive",
  ],
  [BUTTON_COMPOSITE_INTERACTION.PRIMARY_ERROR_HOVER]: [
    "hover:not-disabled:border-destructive",
    "hover:not-disabled:bg-destructive/5",
  ],
  [BUTTON_COMPOSITE_INTERACTION.PRIMARY_ERROR_ACTIVE]: [
    "active:not-disabled:scale-[0.99]",
    "active:not-disabled:bg-destructive/10",
  ],

  [BUTTON_COMPOSITE_INTERACTION.PRIMARY_SUCCESS_FOCUS]: [
    "focus-visible:not-disabled:outline-none",
    "focus-visible:not-disabled:ring-2",
    "focus-visible:not-disabled:ring-ctp-teal",
  ],
  [BUTTON_COMPOSITE_INTERACTION.PRIMARY_SUCCESS_HOVER]: [
    "hover:not-disabled:border-ctp-teal",
    "hover:not-disabled:bg-ctp-teal/5",
  ],
  [BUTTON_COMPOSITE_INTERACTION.PRIMARY_SUCCESS_ACTIVE]: [
    "active:not-disabled:scale-[0.99]",
    "active:not-disabled:bg-ctp-teal/10",
  ],

  [BUTTON_COMPOSITE_INTERACTION.PRIMARY_WARNING_FOCUS]: [
    "focus-visible:not-disabled:outline-none",
    "focus-visible:not-disabled:ring-2",
    "focus-visible:not-disabled:ring-ctp-peach",
  ],
  [BUTTON_COMPOSITE_INTERACTION.PRIMARY_WARNING_HOVER]: [
    "hover:not-disabled:border-ctp-peach",
    "hover:not-disabled:bg-ctp-peach/5",
  ],
  [BUTTON_COMPOSITE_INTERACTION.PRIMARY_WARNING_ACTIVE]: [
    "active:not-disabled:scale-[0.99]",
    "active:not-disabled:bg-ctp-peach/10",
  ],
};
