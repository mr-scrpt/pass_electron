const inputDisabledCln = [
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
  "disabled:pointer-events-none",

  "disabled:hover:border-input",
  "disabled:hover:bg-transparent",
  "disabled:focus-visible:ring-0",
  "disabled:active:scale-100",
  "disabled:active:bg-transparent",
];

const inputReadonlyCln = [
  "read-only:cursor-default",
  "read-only:bg-muted/30",
  "read-only:transition-none",
  "read-only:focus-visible:ring-0",
];

export const inputNativeStateCln = [...inputDisabledCln, ...inputReadonlyCln];
