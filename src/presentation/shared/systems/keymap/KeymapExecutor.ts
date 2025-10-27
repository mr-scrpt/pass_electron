import type { KeyPressEvent, KeymapContext } from "./types";
import type { KeymapRegistry } from "./KeymapRegistry";

export class KeymapExecutor {
  constructor(private registry: KeymapRegistry) {}

  async execute(
    event: KeyPressEvent,
    context: KeymapContext,
  ): Promise<boolean> {
    const keyString = this.eventToKeyString(event);
    const action = this.registry.findAction(keyString, context);

    if (action) {
      await action();
      return true;
    }

    return false;
  }

  private eventToKeyString(event: KeyPressEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey) parts.push("Ctrl");
    if (event.shiftKey) parts.push("Shift");
    if (event.altKey) parts.push("Alt");
    if (event.metaKey) parts.push("Meta");

    const key = this.normalizeKey(event.key);
    parts.push(key);

    return parts.join("+");
  }

  private normalizeKey(key: string): string {
    if (key.length === 1) {
      return key.toUpperCase();
    }

    return key;
  }
}

