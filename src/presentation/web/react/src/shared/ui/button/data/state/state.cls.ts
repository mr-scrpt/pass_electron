import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { stateViewOutline } from "./view-outline";
import { stateViewPrimary } from "./view-primary";
import { stateViewSecondary } from "./view-secondary";
import type { ButtonCompoundStateType } from "../../domain/compound-state";

export const buttonStateCls = {
  ...stateViewPrimary,
  ...stateViewSecondary,
  ...stateViewOutline,
} satisfies EnsureAllKeys<ButtonCompoundStateType, string[]>;
