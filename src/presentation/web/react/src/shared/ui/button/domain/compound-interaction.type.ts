import {
  createBrandedDict,
  generateCompoundArray,
} from "@/shared/lib/typescript";
import type { INPUT_COMPOUND_INTERACTION } from "../../input/domain/compound-interaction.type";
import { BUTTON_COMPOUND_STATE_ARRAY } from "./compound-state";

const BUTTON_COMPOUND_INTERACTION_BRAND = "ButtonCompoundInteraction" as const;
export const INTERACTION_ARRAY = ["HOVER", "FOCUS", "ACTIVE"] as const;

export const BUTTON_COMPOUND_INTERACTION_ARRAY = generateCompoundArray(
  BUTTON_COMPOUND_STATE_ARRAY,
  INTERACTION_ARRAY,
);

export const BUTTON_COMPOUND_INTERACTION = createBrandedDict(
  BUTTON_COMPOUND_INTERACTION_ARRAY,
  BUTTON_COMPOUND_INTERACTION_BRAND,
);

export type ButtonCompoundIteractionType =
  (typeof BUTTON_COMPOUND_INTERACTION)[keyof typeof INPUT_COMPOUND_INTERACTION];

export const getButtonCompoundInteractionKeyList = ({
  compoundState,
}: {
  compoundState: ButtonCompoundStateType;
}): ButtonCompoundIteractionType[] => {
  return BUTTON_COMPOUND_INTERACTION_ARRAY.filter((key) =>
    key.startsWith(compoundState),
  ) as ButtonCompoundIteractionType[];
};
