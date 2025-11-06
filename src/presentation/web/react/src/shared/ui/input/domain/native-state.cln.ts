export const inputDisabledCln = [
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
  "disabled:pointer-events-none",

  "disabled:hover:border-input",
  "disabled:hover:bg-transparent",
  "disabled:focus-visible:ring-0",
  "disabled:active:scale-100",
  "disabled:active:bg-transparent",
];

export const inputReadonlyCln = [
  "read-only:cursor-default",
  "read-only:bg-muted/30",
  "disabled:pointer-events-none",

  "read-only:hover:border-input",
  "read-only:hover:bg-transparent",
  "read-only:focus-visible:ring-0",
  "read-only:active:scale-100",
  "read-only:active:bg-transparent",
];

export const inputNativeStateCln = [...inputDisabledCln, ...inputReadonlyCln];
