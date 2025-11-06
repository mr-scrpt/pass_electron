//  src/presentation/web/react/src/shared/ui/input/ui/input.tsx
import { InputLib } from '@/shared/ui/shadcn/input';
import type { ComponentProps } from 'react';
import { INPUT_SIZE, type InputSizeType } from '../domain/size.type';
import { INPUT_VIEW, type InputViewType } from '../domain/view.type';
import { INPUT_STATE, type InputStateType } from '../domain/state.type';
import { useInputClassBuilder } from '../model/useInputClassBuilder.model';

type InputProps = ComponentProps<'input'> & {
  size?: InputSizeType;
  view?: InputViewType;
  state?: InputStateType;
};

/**
 * Input компонент с поддержкой декларативной системы стилей
 * 
 * Особенности:
 * - Статичные стили (view, size, state) через CVA
 * - Интерактивные стили (focus, hover, active) через compound матрицу
 * - Native состояния (disabled, readonly) автоматически перебивают интерактивные стили через CSS
 */
export const Input = (props: InputProps) => {
  const {
    className,
    size = INPUT_SIZE.L,
    view = INPUT_VIEW.PIMARY,
    state = INPUT_STATE.DEFAULT,
    disabled,
    readOnly,
    ...rest // Все остальные нативные пропсы (type, placeholder, value, onChange, onBlur...)
  } = props;

  const clsInput = useInputClassBuilder({
    size,
    view,
    state,
    className,
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
