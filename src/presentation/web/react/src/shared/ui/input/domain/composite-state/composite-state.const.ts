import {
  createBrandedDict,
  generateCompositeArray,
} from "@/shared/lib/typescript";
import { INPUT_STATE_VALUE_LIST, INPUT_STATE } from "../state/state.const";
import { INPUT_VIEW_VALUE_LIST, INPUT_VIEW } from "../view/view.const";

const INPUT_COMPOSITE_STATE_BRAND = "INPUT_COMPOSITE_STATE" as const;

export const INPUT_COMPOSITE_STATE_VALUE_LIST = generateCompositeArray(
  INPUT_VIEW_VALUE_LIST,
  INPUT_STATE_VALUE_LIST,
);

export const INPUT_COMPOSITE_STATE = createBrandedDict(
  INPUT_COMPOSITE_STATE_VALUE_LIST,
  INPUT_COMPOSITE_STATE_BRAND,
);

export const COMPOSITE_STATE_DEFAULT_KEY = `${INPUT_VIEW.PRIMARY}_${INPUT_STATE.IDLE}`;
