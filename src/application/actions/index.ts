/**
 * Action Bus - Public API
 * 
 * Actions - системные действия для коммуникации между
 * Core Systems (Keymap, Modal, etc.) и Presentation Layer
 * 
 * Отличия от CQRS Commands:
 * - Actions: навигация, UI взаимодействия, системные операции
 * - Commands: бизнес-операции (создать/обновить ресурс)
 */

// Interfaces
export type { IAction } from './IAction'
export type { IActionHandler } from './IActionHandler'
export type { IActionBus } from './IActionBus'

// Actions
export { ShowRandomResourceAction } from './actions/ShowRandomResourceAction'
export { NavigateToAction } from './actions/NavigateToAction'
export { CopyToClipboardAction } from './actions/CopyToClipboardAction'
