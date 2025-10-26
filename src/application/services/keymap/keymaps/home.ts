import type { Keymap } from '../types'
import { ShowRandomResourceAction } from '@/application/actions'

/**
 * Home Page Keymaps
 * 
 * Горячие клавиши для главной страницы (/)
 */
export const homeKeymaps: Keymap[] = [
  {
    id: 'show-random-resource',
    name: 'Show Random Resource',
    binding: { key: 'i', ctrl: true },
    action: async (ctx) => {
      // ✅ Отправляем Action через Action Bus
      // Keymap система НЕ ЗНАЕТ о React, DOM, setState
      // Handler реализован в Presentation Layer
      await ctx.actionBus?.dispatch(
        new ShowRandomResourceAction()
      )
    },
    description: 'Show random resource from list and log to console',
    modes: ['navigation'],
    routes: ['/']
  }
]
