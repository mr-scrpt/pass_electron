import { BUTTON_COMPOUND_INTERACTION } from "../../domain/compound-interaction.type";

export const interactionViewSecondary = {
  [BUTTON_COMPOUND_INTERACTION.SECONDARY_IDLE_FOCUS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-ctp-green",
  ],
  [BUTTON_COMPOUND_INTERACTION.SECONDARY_IDLE_HOVER]: [
    "hover:interactive:brightness-110",
  ],
  [BUTTON_COMPOUND_INTERACTION.SECONDARY_IDLE_ACTIVE]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:brightness-95",
  ],

  [BUTTON_COMPOUND_INTERACTION.SECONDARY_ERROR_FOCUS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-ctp-green",
  ],
  [BUTTON_COMPOUND_INTERACTION.SECONDARY_ERROR_HOVER]: [
    "hover:interactive:brightness-110",
  ],
  [BUTTON_COMPOUND_INTERACTION.SECONDARY_ERROR_ACTIVE]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:brightness-95",
  ],

  [BUTTON_COMPOUND_INTERACTION.SECONDARY_SUCCESS_FOCUS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-ctp-green",
  ],
  [BUTTON_COMPOUND_INTERACTION.SECONDARY_SUCCESS_HOVER]: [
    "hover:interactive:brightness-110",
  ],
  [BUTTON_COMPOUND_INTERACTION.SECONDARY_SUCCESS_ACTIVE]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:brightness-95",
  ],

  [BUTTON_COMPOUND_INTERACTION.SECONDARY_WARNING_FOCUS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-ctp-green",
  ],
  [BUTTON_COMPOUND_INTERACTION.SECONDARY_WARNING_HOVER]: [
    "hover:interactive:brightness-110",
  ],
  [BUTTON_COMPOUND_INTERACTION.SECONDARY_WARNING_ACTIVE]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:brightness-95",
  ],

  [BUTTON_COMPOUND_INTERACTION.OUTLINE_IDLE_FOCUS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-input",
  ],
};
