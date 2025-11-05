// src/presentation/web/react/src/shared/ui/input/model/useInputClassBuilder.model.ts
import { cva } from "class-variance-authority";
import { inputBaseCln } from "../domain/base";
import { inputViewCln } from "../domain/view.cln";
import { inputSizeCln } from "../domain/size.cln";
import { inputStateCln } from "../domain/state.cln";
import { inputCompoundCln } from "../domain/compound.cln";
import { INPUT_VIEW } from "../domain/view.type";
import { INPUT_SIZE } from "../domain/size.type";
import { INPUT_STATE } from "../domain/state.type";

export const inputClassBuilder = () =>
  cva(inputBaseCln, {
    variants: {
      view: { ...inputViewCln },
      size: { ...inputSizeCln },
      state: { ...inputStateCln },
    },
    compoundVariants: inputCompoundCln,
    defaultVariants: {
      view: INPUT_VIEW.PIMARY,
      size: INPUT_SIZE.S,
      state: INPUT_STATE.DEFAULT,
    },
  });

export const useInputClassBuilder = inputClassBuilder();
