import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { interactionViewOutline } from "./view-outline";
import { interactionViewPrimary } from "./view-primary";
import { interactionViewSecondary } from "./view-secondary";
import type { ButtonCompositeInteractionType } from "../../domain/composite-interaction/composite-interaction.type";

export const buttonInteractionCls = {
  ...interactionViewPrimary,
  ...interactionViewSecondary,
  ...interactionViewOutline,
} satisfies EnsureAllKeys<ButtonCompositeInteractionType, string[]>;
