const inputDisabledCln = [
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
  "disabled:pointer-events-none",

  "disabled:hover:border-input",
  "disabled:focus-visible:ring-0",
  "disabled:active:scale-100",
];

const inputReadonlyCln = [
  "read-only:cursor-default",
  "read-only:opacity-70", // Простое решение: 70% для всего (текст вполне читаем)
  "read-only:transition-none",
  "read-only:focus-visible:ring-0",
];

export const inputNativeStateCln = [...inputDisabledCln, ...inputReadonlyCln];
