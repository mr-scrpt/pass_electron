import { BUTTON_COMPOSITE_INTERACTION } from "../../domain/composite-interaction/composite-interaction.const";

export const interactionViewSecondary = {
  [BUTTON_COMPOSITE_INTERACTION.SECONDARY_IDLE_FOCUS]: [
    "focus-visible:not-disabled:outline-none",
    "focus-visible:not-disabled:ring-2",
    "focus-visible:not-disabled:ring-ctp-green",
  ],
  [BUTTON_COMPOSITE_INTERACTION.SECONDARY_IDLE_HOVER]: [
    "hover:not-disabled:brightness-110",
  ],
  [BUTTON_COMPOSITE_INTERACTION.SECONDARY_IDLE_ACTIVE]: [
    "active:not-disabled:scale-[0.99]",
    "active:not-disabled:brightness-95",
  ],

  [BUTTON_COMPOSITE_INTERACTION.SECONDARY_ERROR_FOCUS]: [
    "focus-visible:not-disabled:outline-none",
    "focus-visible:not-disabled:ring-2",
    "focus-visible:not-disabled:ring-ctp-green",
  ],
  [BUTTON_COMPOSITE_INTERACTION.SECONDARY_ERROR_HOVER]: [
    "hover:not-disabled:brightness-110",
  ],
  [BUTTON_COMPOSITE_INTERACTION.SECONDARY_ERROR_ACTIVE]: [
    "active:not-disabled:scale-[0.99]",
    "active:not-disabled:brightness-95",
  ],

  [BUTTON_COMPOSITE_INTERACTION.SECONDARY_SUCCESS_FOCUS]: [
    "focus-visible:not-disabled:outline-none",
    "focus-visible:not-disabled:ring-2",
    "focus-visible:not-disabled:ring-ctp-green",
  ],
  [BUTTON_COMPOSITE_INTERACTION.SECONDARY_SUCCESS_HOVER]: [
    "hover:not-disabled:brightness-110",
  ],
  [BUTTON_COMPOSITE_INTERACTION.SECONDARY_SUCCESS_ACTIVE]: [
    "active:not-disabled:scale-[0.99]",
    "active:not-disabled:brightness-95",
  ],

  [BUTTON_COMPOSITE_INTERACTION.SECONDARY_WARNING_FOCUS]: [
    "focus-visible:not-disabled:outline-none",
    "focus-visible:not-disabled:ring-2",
    "focus-visible:not-disabled:ring-ctp-green",
  ],
  [BUTTON_COMPOSITE_INTERACTION.SECONDARY_WARNING_HOVER]: [
    "hover:not-disabled:brightness-110",
  ],
  [BUTTON_COMPOSITE_INTERACTION.SECONDARY_WARNING_ACTIVE]: [
    "active:not-disabled:scale-[0.99]",
    "active:not-disabled:brightness-95",
  ],

  [BUTTON_COMPOSITE_INTERACTION.OUTLINE_IDLE_FOCUS]: [
    "focus-visible:not-disabled:outline-none",
    "focus-visible:not-disabled:ring-2",
    "focus-visible:not-disabled:ring-input",
  ],
};
