import {
  generateCompositeArray,
  createBrandedDict,
} from "@/shared/lib/typescript";
import { BUTTON_COMPOSITE_STATE_VALUE_LIST } from "../composite-state/composite-state.const";

const BUTTON_COMPOSITE_INTERACTION_BRAND =
  "BUTTON_COMPOSITE_INTERACTION" as const;

export const INTERACTION_VALUE_LIST = ["HOVER", "FOCUS", "ACTIVE"] as const;

export const BUTTON_COMPOSITE_INTERACTION_VALUE_LIST = generateCompositeArray(
  BUTTON_COMPOSITE_STATE_VALUE_LIST,
  INTERACTION_VALUE_LIST,
);

export const BUTTON_COMPOSITE_INTERACTION = createBrandedDict(
  BUTTON_COMPOSITE_INTERACTION_VALUE_LIST,
  BUTTON_COMPOSITE_INTERACTION_BRAND,
);
