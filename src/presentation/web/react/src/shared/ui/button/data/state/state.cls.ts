import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { stateViewOutline } from "./view-outline";
import { stateViewPrimary } from "./view-primary";
import { stateViewSecondary } from "./view-secondary";
import type { ButtonCompositeStateType } from "../../domain/composite-state/composite-state.type";

export const buttonStateCls = {
  ...stateViewPrimary,
  ...stateViewSecondary,
  ...stateViewOutline,
} satisfies EnsureAllKeys<ButtonCompositeStateType, string[]>;
