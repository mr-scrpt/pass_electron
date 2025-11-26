import {
    generateCompositeArray,
    createBrandedDict,
} from "@/shared/lib/typescript";
import { INPUT_COMPOSITE_STATE_VALUE_LIST } from "../composite-state/composite-state.const";

const INPUT_COMPOSITE_INTERACTION_BRAND =
    "INPUT_COMPOSITE_INTERACTION" as const;

export const INTERACTION_VALUE_LIST = ["HOVER", "FOCUS", "ACTIVE"] as const;

export const INPUT_COMPOSITE_INTERACTION_VALUE_LIST = generateCompositeArray(
    INPUT_COMPOSITE_STATE_VALUE_LIST,
    INTERACTION_VALUE_LIST,
);

export const INPUT_COMPOSITE_INTERACTION = createBrandedDict(
    INPUT_COMPOSITE_INTERACTION_VALUE_LIST,
    INPUT_COMPOSITE_INTERACTION_BRAND,
);
