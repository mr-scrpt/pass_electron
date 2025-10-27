export type KeymapContext = {
  route: string;

  mode?: "navigation" | "editing";

  metadata?: Record<string, unknown>;
};

export type KeymapAction = () => void | Promise<void>;

export type Keymap = {
  key: string;

  description: string;

  context: {
    route?: string | RegExp;
    mode?: "navigation" | "editing";
  };

  action: KeymapAction;
};

export type KeyPressEvent = {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
};

