import { cva } from "class-variance-authority";
import { inputBaseCln } from "../domain/base";
import { inputViewCln } from "../domain/view.cln";
import { inputSizeCln } from "../domain/size.cln";
import { inputNativeStateCln } from "../domain/native-state.cln";
import type { InputViewType } from "../domain/view.type";
import type { InputSizeType } from "../domain/size.type";
import type { InputStateType } from "../domain/state.type";
import {
  resolveInputTheme,
  getInputThemeClasses,
} from "../lib/resolveInputTheme";
import { cn } from "@/shared/lib/shadcn";

type UseInputClassBuilderParams = {
  view: InputViewType;
  size: InputSizeType;
  state: InputStateType;
  className?: string;
};

export function useInputClassBuilder(
  params: UseInputClassBuilderParams,
): string {
  const { view, size, state, className } = params;

  const staticClasses = cva([...inputBaseCln, ...inputNativeStateCln], {
    variants: {
      view: { ...inputViewCln },
      size: { ...inputSizeCln },
    },
  })({ view, size });

  const theme = resolveInputTheme({ view, state });
  const themeClasses = getInputThemeClasses(theme);

  return cn(staticClasses, themeClasses, className);
}
