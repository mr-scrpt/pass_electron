import { cva } from "class-variance-authority";
import { inputBaseCln } from "../domain/base";
import { inputViewCln } from "../domain/view.cln";
import { inputSizeCln } from "../domain/size.cln";
import { INPUT_VIEW } from "../domain/view.type";
import { INPUT_SIZE } from "../domain/size.type";

export const inputClassBuilder = () =>
  cva(inputBaseCln, {
    variants: {
      view: { ...inputViewCln },
      size: { ...inputSizeCln },
    },
    defaultVariants: {
      view: INPUT_VIEW.PIMARY,
      size: INPUT_SIZE.S,
    },
  });

export const useInputClassBuilder = inputClassBuilder();
