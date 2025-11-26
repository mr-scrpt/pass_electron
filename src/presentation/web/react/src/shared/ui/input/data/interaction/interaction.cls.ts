import type { EnsureAllKeys } from "@/shared/lib/typescript";
import type { InputCompositeInteractionType } from "../../domain/composite-interaction/composite-interaction.type";
import { interactionViewOutline } from "./view-outline";
import { interactionViewPrimary } from "./view-primary";
import { interactionViewSecondary } from "./view-secondary";

export const inputInteractionCln = {
  ...interactionViewPrimary,
  ...interactionViewSecondary,
  ...interactionViewOutline,
} satisfies EnsureAllKeys<InputCompositeInteractionType, string[]>;
