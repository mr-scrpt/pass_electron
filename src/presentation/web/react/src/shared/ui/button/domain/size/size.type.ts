import type { BUTTON_SIZE } from "./size.const";

export type ButtonSizeType = (typeof BUTTON_SIZE)[keyof typeof BUTTON_SIZE];
