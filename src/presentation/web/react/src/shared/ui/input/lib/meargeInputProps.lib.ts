import { mergeNativeProps } from "@/shared/lib/style";

// Специализированная версия для input
type NativeInputProps = {
  disabled?: boolean;
  readOnly?: boolean;
};

const INPUT_NATIVE_DEFAULTS: Required<NativeInputProps> = {
  disabled: false,
  readOnly: false,
};

export const mergeNativeInputProps = (
  props: NativeInputProps,
): Required<NativeInputProps> => mergeNativeProps(props, INPUT_NATIVE_DEFAULTS);
