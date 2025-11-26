import { INPUT_STATE } from "./state.const";

export type InputStateType = (typeof INPUT_STATE)[keyof typeof INPUT_STATE];
