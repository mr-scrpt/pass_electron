import {
  createBrandedDict,
  generateCompoundArray,
} from "@/shared/lib/typescript";
import {
  INPUT_COMPOUND_STATE_ARRAY,
  type InputCompoundStateType,
} from "./compound-state.type";

const INPUT_COMPOUND_INTERACTION_BRAND = "InputCompoundInteraction" as const;
export const INTERACTION_ARRAY = ["HOVER", "FOCUS", "ACTIVE"] as const;

export const INPUT_COMPOUND_INTERACTION_ARRAY = generateCompoundArray(
  INPUT_COMPOUND_STATE_ARRAY,
  INTERACTION_ARRAY,
);

export const INPUT_COMPOUND_INTERACTION = createBrandedDict(
  INPUT_COMPOUND_INTERACTION_ARRAY,
  INPUT_COMPOUND_INTERACTION_BRAND,
);

export type InputCompoundIteractionType =
  (typeof INPUT_COMPOUND_INTERACTION)[keyof typeof INPUT_COMPOUND_INTERACTION];

// export type CompoundInteractionType = {
//   compoundState: InputCompoundStateType;
//   interaction: InputCompoundIteractionType;
// };

export const getInputCompoundInteractionKeyList = ({
  compoundState,
}: {
  compoundState: InputCompoundStateType;
}): InputCompoundIteractionType[] => {
  return INPUT_COMPOUND_INTERACTION_ARRAY.filter((key) =>
    key.startsWith(compoundState),
  ) as InputCompoundIteractionType[];
};
