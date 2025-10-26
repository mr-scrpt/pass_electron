import type { IAction } from '../IAction'

/**
 * CopyToClipboardAction - копировать текст в буфер обмена
 * 
 * Используется в Keymaps для копирования паролей, полей и т.д.
 * без прямой зависимости от Clipboard API
 * 
 * Handler реализован в Presentation Layer и использует
 * navigator.clipboard API или Electron IPC
 */
export class CopyToClipboardAction implements IAction {
  readonly type = 'CopyToClipboardAction'
  
  constructor(public readonly text: string) {}
}
