export const testKeymapConfig = {
  navigation: {
    route: "/test-keymaps",
    keymaps: [
      {
        key: "Ctrl+1",
        description: "Success notification",
        action: (deps) => deps.incrementCounter(),
      },
      {
        key: "J",
        description: "Focus next",
        action: (deps) => deps.focusNext(),
      },
    ],
  },
  edit: {
    route: "/test-keymaps",
    keymaps: [
      {
        key: "esc",
        description: "Exit from edite mode",
        action: (deps) => deps.exite(),
      },
      {
        key: "Tab",
        description: "Next field",
        action: (deps) => deps.focusNext(),
      },
    ],
  },
} as const;
