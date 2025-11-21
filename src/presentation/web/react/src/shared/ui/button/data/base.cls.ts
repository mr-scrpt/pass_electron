export const buttonBaseCls = [
  "inline-flex",
  // "items-center",
  // "justify-center",
  "gap-2",
  "whitespace-nowrap",
  // "rounded-md",
  "text-sm",
  "font-medium",
  // "transition-colors",
  // "focus-visible:outline-none",
  // "focus-visible:ring-1",
  // "focus-visible:ring-ring",
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

export const buttonNativeStateCls = [
  ...buttonDisabledCls,
  // ...buttonReadonlyCln,
];
