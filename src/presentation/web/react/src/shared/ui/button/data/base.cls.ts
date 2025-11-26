export const buttonBaseCls = [
  "flex",
  "gap-2",
  "whitespace-nowrap",
  "text-sm",
  "font-medium",
  "cursor-pointer",
  "[&_svg]:pointer-events-none",
  "[&_svg]:size-4",
  "[&_svg]:shrink-0",
];

const buttonDisabledCls = [
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
  "disabled:pointer-events-none",

  "disabled:hover:border-input",
  "disabled:focus-visible:ring-0",
  "disabled:active:scale-100",
];

export const buttonNativeStateCls = [...buttonDisabledCls];
