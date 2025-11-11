import { INPUT_COMPOUND_INTERACTION } from "../../domain/compound-interaction.type";

export const interactionViewPrimary = {
  [INPUT_COMPOUND_INTERACTION.PRIMARY_IDLE_FOCUS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-ctp-mauve",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_IDLE_HOVER]: [
    "hover:interactive:border-ctp-mauve",
    "hover:interactive:bg-ctp-mauve/5",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_IDLE_ACTIVE]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-ctp-mauve/10",
  ],

  [INPUT_COMPOUND_INTERACTION.PRIMARY_ERROR_FOCUS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-destructive",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_ERROR_HOVER]: [
    "hover:interactive:border-destructive",
    "hover:interactive:bg-destructive/5",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_ERROR_ACTIVE]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-destructive/10",
  ],

  [INPUT_COMPOUND_INTERACTION.PRIMARY_SUCCESS_FOCUS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-ctp-teal",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_SUCCESS_HOVER]: [
    "hover:interactive:border-ctp-teal",
    "hover:interactive:bg-ctp-teal/5",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_SUCCESS_ACTIVE]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-ctp-teal/10",
  ],

  [INPUT_COMPOUND_INTERACTION.PRIMARY_WARNING_FOCUS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-ctp-peach",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_WARNING_HOVER]: [
    "hover:interactive:border-ctp-peach",
    "hover:interactive:bg-ctp-peach/5",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_WARNING_ACTIVE]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-ctp-peach/10",
  ],
};
