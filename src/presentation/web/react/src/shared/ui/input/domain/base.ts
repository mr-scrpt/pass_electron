export const inputBaseCln = [
  "flex",
  "w-full",

  // Стили для file input (их можно не менять)
  "file:border-0",
  "file:bg-transparent",
  "file:text-sm",
  "file:font-medium",
  "file:text-foreground",

  // Сброс outline при фокусе (сам фокус будет в 'view')
  "focus-visible:outline-none",

  // Состояния
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
].join(" ");
