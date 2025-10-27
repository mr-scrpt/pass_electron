// presentation/shared/systems/modal/types.ts

/**
 * Режимы приложения (Vim-style)
 */
export type Mode = 'navigation' | 'editing'

/**
 * Состояние режима
 */
export type ModeState = {
  /** Текущий режим */
  mode: Mode
  /** Дополнительные данные режима */
  data?: {
    /** ID редактируемого поля (для editing режима) */
    editingFieldId?: string
    /** ID выбранного элемента (для navigation режима) */
    selectedItemId?: string
  }
}

/**
 * Событие смены режима
 */
export type ModeChangeEvent = {
  from: Mode
  to: Mode
  state: ModeState
}

/**
 * Слушатель смены режима
 */
export type ModeChangeListener = (event: ModeChangeEvent) => void