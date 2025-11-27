import type { INPUT_SIZE } from "./size.const";

export type InputSizeType = (typeof INPUT_SIZE)[keyof typeof INPUT_SIZE];
