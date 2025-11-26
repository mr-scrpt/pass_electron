import { BUTTON_COMPOSITE_INTERACTION } from "../../domain/composite-interaction/composite-interaction.const";

export const interactionViewOutline = {
  [BUTTON_COMPOSITE_INTERACTION.OUTLINE_IDLE_HOVER]: [
    "hover:not-disabled:border-ring",
    "hover:not-disabled:bg-muted/5",
  ],
  [BUTTON_COMPOSITE_INTERACTION.OUTLINE_IDLE_ACTIVE]: [
    "active:not-disabled:scale-[0.99]",
    "active:not-disabled:bg-muted/10",
  ],

  [BUTTON_COMPOSITE_INTERACTION.OUTLINE_ERROR_FOCUS]: [
    "focus-visible:not-disabled:outline-none",
    "focus-visible:not-disabled:ring-2",
    "focus-visible:not-disabled:ring-input",
  ],
  [BUTTON_COMPOSITE_INTERACTION.OUTLINE_ERROR_HOVER]: [
    "hover:not-disabled:border-ring",
    "hover:not-disabled:bg-muted/5",
  ],
  [BUTTON_COMPOSITE_INTERACTION.OUTLINE_ERROR_ACTIVE]: [
    "active:not-disabled:scale-[0.99]",
    "active:not-disabled:bg-muted/10",
  ],

  [BUTTON_COMPOSITE_INTERACTION.OUTLINE_SUCCESS_FOCUS]: [
    "focus-visible:not-disabled:outline-none",
    "focus-visible:not-disabled:ring-2",
    "focus-visible:not-disabled:ring-input",
  ],
  [BUTTON_COMPOSITE_INTERACTION.OUTLINE_SUCCESS_HOVER]: [
    "hover:not-disabled:border-ring",
    "hover:not-disabled:bg-muted/5",
  ],
  [BUTTON_COMPOSITE_INTERACTION.OUTLINE_SUCCESS_ACTIVE]: [
    "active:not-disabled:scale-[0.99]",
    "active:not-disabled:bg-muted/10",
  ],

  [BUTTON_COMPOSITE_INTERACTION.OUTLINE_WARNING_FOCUS]: [
    "focus-visible:not-disabled:outline-none",
    "focus-visible:not-disabled:ring-2",
    "focus-visible:not-disabled:ring-input",
  ],
  [BUTTON_COMPOSITE_INTERACTION.OUTLINE_WARNING_HOVER]: [
    "hover:not-disabled:border-ring",
    "hover:not-disabled:bg-muted/5",
  ],
  [BUTTON_COMPOSITE_INTERACTION.OUTLINE_WARNING_ACTIVE]: [
    "active:not-disabled:scale-[0.99]",
    "active:not-disabled:bg-muted/10",
  ],
};
