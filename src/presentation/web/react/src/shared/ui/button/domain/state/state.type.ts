import { BUTTON_STATE } from "./state.const";

export type ButtonStateType = (typeof BUTTON_STATE)[keyof typeof BUTTON_STATE];
