import { createBrandedDict } from "@/shared/lib/typescript";

const INPUT_STATE_BRAND = "InputState" as const;

export const INPUT_STATE_VALUE_LIST = [
    "IDLE",
    "ERROR",
    "SUCCESS",
    "WARNING",
] as const;

export const INPUT_STATE = createBrandedDict(
    INPUT_STATE_VALUE_LIST,
    INPUT_STATE_BRAND,
);
