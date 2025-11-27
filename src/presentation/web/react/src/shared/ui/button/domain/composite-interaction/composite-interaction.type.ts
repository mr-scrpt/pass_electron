import type { BUTTON_COMPOSITE_INTERACTION } from "./composite-interaction.const";

export type ButtonCompositeInteractionType =
  (typeof BUTTON_COMPOSITE_INTERACTION)[keyof typeof BUTTON_COMPOSITE_INTERACTION];
