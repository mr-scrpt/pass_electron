import type { EnsureAllKeys } from "@/shared/lib/typescript";
import type { InputCompositeStateType } from "../../domain/composite-state/composite-state.type";
import { stateViewOutline } from "./view-outline";
import { stateViewPrimary } from "./view-primary";
import { stateViewSecondary } from "./view-secondary";

export const inputStateCln = {
  ...stateViewPrimary,
  ...stateViewSecondary,
  ...stateViewOutline,
} satisfies EnsureAllKeys<InputCompositeStateType, string[]>;
