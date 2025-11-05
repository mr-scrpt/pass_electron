//  src/presentation/web/react/src/shared/ui/input/ui/input.tsx
import { InputLib } from "@/shared/ui/shadcn/input";
import type { ComponentProps } from "react";
import { INPUT_SIZE, type InputSizeType } from "../domain/size.type";
import { INPUT_VIEW, type InputViewType } from "../domain/view.type";
import { useInputClassBuilder } from "../model/useInputClassBuilder.model";
import { resolveState } from "@/shared/lib/style";
import { INPUT_STATE, type InputStateType } from "../domain/state.type";

type InputProps = ComponentProps<"input"> & {
  size?: InputSizeType;
  view?: InputViewType;
  state?: InputStateType;
};

export const Input = (props: InputProps) => {
  const {
    className,
    size = INPUT_SIZE.L,
    view = INPUT_VIEW.PIMARY,
    state = INPUT_STATE.DEFAULT,
    disabled,
    readOnly,
    ...rest // Собираем все остальные пропсы (type, placeholder, value, onChange...)
  } = props;

  const resolvedState = resolveState({
    resolvers: [
      { condition: !!disabled, state: INPUT_STATE.DISABLED },
      { condition: !!readOnly, state: INPUT_STATE.READONLY },
    ],
    defaultState: state,
  });

  const clsInput = useInputClassBuilder({
    size,
    view,
    className,
    state: resolvedState,
  });

  return (
    <InputLib
      className={clsInput}
      disabled={disabled}
      readOnly={readOnly}
      {...rest}
    />
  );
};
