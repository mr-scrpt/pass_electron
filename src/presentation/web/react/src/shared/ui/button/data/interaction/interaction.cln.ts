import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { interactionViewOutline } from "./view-outline";
import { interactionViewPrimary } from "./view-primary";
import { interactionViewSecondary } from "./view-secondarty";
import type { ButtonCompoundIteractionType } from "../../domain/compound-interaction.type";

export const buttonInteractionCls = {
  ...interactionViewPrimary,
  ...interactionViewSecondary,
  ...interactionViewOutline,
} satisfies EnsureAllKeys<ButtonCompoundIteractionType, string[]>;
