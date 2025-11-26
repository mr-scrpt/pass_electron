import {
  createBrandedDict,
  generateCompositeArray,
} from "@/shared/lib/typescript";
import {
  INPUT_COMPOUND_STATE_VALUE_LIST,
  type InputCompoundStateType,
} from "./compound-state.type";

const INPUT_COMPOUND_INTERACTION_BRAND = "InputCompoundInteraction" as const;
export const INTERACTION_VALUE_LIST = ["HOVER", "FOCUS", "ACTIVE"] as const;

export const INPUT_COMPOUND_INTERACTION_VALUE_LIST = generateCompositeArray(
  INPUT_COMPOUND_STATE_VALUE_LIST,
  INTERACTION_VALUE_LIST,
);

export const INPUT_COMPOUND_INTERACTION = createBrandedDict(
  INPUT_COMPOUND_INTERACTION_VALUE_LIST,
  INPUT_COMPOUND_INTERACTION_BRAND,
);

export type InputCompoundIteractionType =
  (typeof INPUT_COMPOUND_INTERACTION)[keyof typeof INPUT_COMPOUND_INTERACTION];

export const getInputCompoundInteractionKeyList = ({
  compoundState,
}: {
  compoundState: InputCompoundStateType;
}): InputCompoundIteractionType[] => {
  return INPUT_COMPOUND_INTERACTION_VALUE_LIST.filter((key) =>
    key.startsWith(compoundState),
  ) as InputCompoundIteractionType[];
};
