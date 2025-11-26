import {
  createBrandedDict,
  generateCompositeArray,
} from "@/shared/lib/typescript";
import { BUTTON_STATE, BUTTON_STATE_VALUE_LIST } from "../state/state.const";
import { BUTTON_VIEW_VALUE_LIST, BUTTON_VIEW } from "../view/view.const";

const BUTTON_COMPOSITE_STATE_BRAND = "BUTTON_COPOSITE_STATE" as const;

export const BUTTON_COMPOSITE_STATE_VALUE_LIST = generateCompositeArray(
  BUTTON_VIEW_VALUE_LIST,
  BUTTON_STATE_VALUE_LIST,
);

export const BUTTON_COMPOSITE_STATE = createBrandedDict(
  BUTTON_COMPOSITE_STATE_VALUE_LIST,
  BUTTON_COMPOSITE_STATE_BRAND,
);

export const COMPOSITE_STATE_DEFAULT_KEY = `${BUTTON_VIEW.PRIMARY}_${BUTTON_STATE.IDLE}`;
