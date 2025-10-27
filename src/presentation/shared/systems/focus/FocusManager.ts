export class FocusManager<T = string> {
  private items: T[] = [];
  private focusedIndex: number = 0;
  private onChangeCallback?: (item: T, index: number) => void;

  setItems(items: T[]): void {
    this.items = items;

    if (this.focusedIndex >= items.length) {
      this.focusedIndex = Math.max(0, items.length - 1);
    }

    this.notifyChange();
  }

  getItems(): T[] {
    return [...this.items];
  }

  moveNext(): void {
    if (this.items.length === 0) return;

    this.focusedIndex = Math.min(this.focusedIndex + 1, this.items.length - 1);
    this.notifyChange();
  }

  movePrevious(): void {
    if (this.items.length === 0) return;

    this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
    this.notifyChange();
  }

  moveFirst(): void {
    if (this.items.length === 0) return;

    this.focusedIndex = 0;
    this.notifyChange();
  }

  moveLast(): void {
    if (this.items.length === 0) return;

    this.focusedIndex = this.items.length - 1;
    this.notifyChange();
  }

  getFocusedItem(): T | null {
    return this.items[this.focusedIndex] ?? null;
  }

  getFocusedIndex(): number {
    return this.focusedIndex;
  }

  setFocusedIndex(index: number): void {
    if (index < 0 || index >= this.items.length) return;

    this.focusedIndex = index;
    this.notifyChange();
  }

  onChange(callback: (item: T, index: number) => void): void {
    this.onChangeCallback = callback;
  }

  private notifyChange(): void {
    const item = this.getFocusedItem();
    if (item !== null && this.onChangeCallback) {
      this.onChangeCallback(item, this.focusedIndex);
    }
  }

  reset(): void {
    this.items = [];
    this.focusedIndex = 0;
    this.onChangeCallback = undefined;
  }
}

