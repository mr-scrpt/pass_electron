// presentation/shared/systems/modal/ModalStateMachine.ts

import type { Mode, ModeState, ModeChangeEvent, ModeChangeListener } from './types'

/**
 * Конечный автомат для управления режимами
 * 
 * Управляет переходами между режимами navigation и editing.
 */
export class ModalStateMachine {
  private state: ModeState = {
    mode: 'navigation',
  }

  private listeners: ModeChangeListener[] = []

  /**
   * Получить текущий режим
   */
  getCurrentMode(): Mode {
    return this.state.mode
  }

  /**
   * Получить полное состояние
   */
  getState(): ModeState {
    return { ...this.state }
  }

  /**
   * Войти в режим редактирования
   */
  enterEditingMode(fieldId?: string): void {
    if (this.state.mode === 'editing') return

    const from = this.state.mode
    this.state = {
      mode: 'editing',
      data: {
        editingFieldId: fieldId,
      },
    }

    this.notifyListeners({ from, to: 'editing', state: this.state })
  }

  /**
   * Выйти из режима редактирования (вернуться в navigation)
   */
  exitEditingMode(): void {
    if (this.state.mode === 'navigation') return

    const from = this.state.mode
    this.state = {
      mode: 'navigation',
      data: {
        selectedItemId: this.state.data?.editingFieldId,
      },
    }

    this.notifyListeners({ from, to: 'navigation', state: this.state })
  }

  /**
   * Установить выбранный элемент (в navigation режиме)
   */
  setSelectedItem(itemId: string): void {
    if (this.state.mode !== 'navigation') return

    this.state = {
      ...this.state,
      data: {
        ...this.state.data,
        selectedItemId: itemId,
      },
    }
  }

  /**
   * Подписаться на изменения режима
   */
  subscribe(listener: ModeChangeListener): () => void {
    this.listeners.push(listener)

    // Возвращаем функцию отписки
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Уведомить слушателей о смене режима
   */
  private notifyListeners(event: ModeChangeEvent): void {
    for (const listener of this.listeners) {
      listener(event)
    }
  }

  /**
   * Сбросить состояние
   */
  reset(): void {
    const from = this.state.mode
    this.state = {
      mode: 'navigation',
    }

    if (from !== 'navigation') {
      this.notifyListeners({ from, to: 'navigation', state: this.state })
    }
  }
}