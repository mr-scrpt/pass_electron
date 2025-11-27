import type { INPUT_COMPOSITE_INTERACTION } from "./composite-interaction.const";

export type InputCompositeInteractionType =
    (typeof INPUT_COMPOSITE_INTERACTION)[keyof typeof INPUT_COMPOSITE_INTERACTION];
