import type { IAction } from '../IAction'

/**
 * ShowRandomResourceAction - показать случайный ресурс из списка
 * 
 * Используется в Keymap для главной страницы (Ctrl+I)
 * 
 * Handler реализован в Presentation Layer (routes/_index.tsx)
 * и выполняет:
 * 1. Выбор случайного ресурса из списка
 * 2. Отображение на странице (setState)
 * 3. Логирование в консоль (server-side)
 */
export class ShowRandomResourceAction implements IAction {
  readonly type = 'ShowRandomResourceAction'
  
  constructor() {}
}
