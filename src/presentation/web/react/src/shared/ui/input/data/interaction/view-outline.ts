import { INPUT_COMPOUND_INTERACTION } from "../../domain/compound-interaction.type";

export const interactionViewOutline = {
  [INPUT_COMPOUND_INTERACTION.OUTLINE_IDLE_HOVER]: [
    "hover:interactive:border-ring",
    "hover:interactive:bg-muted/5",
  ],
  [INPUT_COMPOUND_INTERACTION.OUTLINE_IDLE_ACTIVE]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-muted/10",
  ],

  [INPUT_COMPOUND_INTERACTION.OUTLINE_ERROR_FOCUS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-input",
  ],
  [INPUT_COMPOUND_INTERACTION.OUTLINE_ERROR_HOVER]: [
    "hover:interactive:border-ring",
    "hover:interactive:bg-muted/5",
  ],
  [INPUT_COMPOUND_INTERACTION.OUTLINE_ERROR_ACTIVE]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-muted/10",
  ],

  [INPUT_COMPOUND_INTERACTION.OUTLINE_SUCCESS_FOCUS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-input",
  ],
  [INPUT_COMPOUND_INTERACTION.OUTLINE_SUCCESS_HOVER]: [
    "hover:interactive:border-ring",
    "hover:interactive:bg-muted/5",
  ],
  [INPUT_COMPOUND_INTERACTION.OUTLINE_SUCCESS_ACTIVE]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-muted/10",
  ],

  [INPUT_COMPOUND_INTERACTION.OUTLINE_WARNING_FOCUS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-input",
  ],
  [INPUT_COMPOUND_INTERACTION.OUTLINE_WARNING_HOVER]: [
    "hover:interactive:border-ring",
    "hover:interactive:bg-muted/5",
  ],
  [INPUT_COMPOUND_INTERACTION.OUTLINE_WARNING_ACTIVE]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-muted/10",
  ],
};
