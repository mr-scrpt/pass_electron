// src/presentation/web/react/src/shared/ui/input/domain/state.type.ts
import { getEnumKeys } from "@/shared/lib/typescript";

// Только визуальные/декоративные состояния
export enum INPUT_STATE {
  DEFAULT,
  ERROR,
  SUCCESS,
}

export type InputStateType = INPUT_STATE;
export const INPUT_STATE_KEY = getEnumKeys(INPUT_STATE);
