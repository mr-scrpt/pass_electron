import type { Keymap, KeymapContext, KeymapAction } from "./types";

export class KeymapRegistry {
  private keymaps: Map<string, Keymap[]> = new Map();

  register(keymap: Keymap): void {
    const existing = this.keymaps.get(keymap.key) ?? [];
    existing.push(keymap);
    this.keymaps.set(keymap.key, existing);
  }

  unregister(key: string, context: KeymapContext): void {
    const existing = this.keymaps.get(key);
    if (!existing) return;

    const filtered = existing.filter((k) => !this.matchesContext(k, context));

    if (filtered.length === 0) {
      this.keymaps.delete(key);
    } else {
      this.keymaps.set(key, filtered);
    }
  }

  findForContext(context: KeymapContext): Keymap[] {
    const result: Keymap[] = [];

    for (const [key, keymaps] of this.keymaps.entries()) {
      const matching = keymaps.filter((k) => this.matchesContext(k, context));
      result.push(...matching);
    }

    return result;
  }

  findAction(key: string, context: KeymapContext): KeymapAction | null {
    const keymaps = this.keymaps.get(key);
    if (!keymaps) return null;

    const matching = keymaps.find((k) => this.matchesContext(k, context));
    return matching?.action ?? null;
  }

  private matchesContext(keymap: Keymap, context: KeymapContext): boolean {
    if (keymap.context.route) {
      if (keymap.context.route instanceof RegExp) {
        if (!keymap.context.route.test(context.route)) {
          return false;
        }
      } else {
        if (keymap.context.route !== context.route) {
          return false;
        }
      }
    }

    if (keymap.context.mode && keymap.context.mode !== context.mode) {
      return false;
    }

    return true;
  }

  clear(): void {
    this.keymaps.clear();
  }
}

