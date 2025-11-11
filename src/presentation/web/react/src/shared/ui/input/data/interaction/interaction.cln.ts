import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { type InputCompoundIteractionType } from "../../domain/compound-interaction.type";
import { interactionViewOutline } from "./view-outline";
import { interactionViewPrimary } from "./view-primary";
import { interactionViewSecondary } from "./view-secondarty";

export const inputInteractionCln = {
  ...interactionViewPrimary,
  ...interactionViewSecondary,
  ...interactionViewOutline,
} satisfies EnsureAllKeys<InputCompoundIteractionType, string[]>;
