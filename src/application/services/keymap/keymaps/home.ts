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
      // 🆕 Показываем info уведомление ДО выполнения
      // NotificationManager изолирует от конкретной UI библиотеки
      ctx.notificationManager?.notify({
        level: 'info',
        message: 'Loading random resource...',
        duration: 2000
      })
      
      // ✅ Отправляем Action через Action Bus
      // Keymap система НЕ ЗНАЕТ о React, DOM, setState
      // Handler реализован в Presentation Layer
      await ctx.actionBus?.dispatch(
        new ShowRandomResourceAction()
      )
      
      // ✅ Success уведомление будет показано в Handler
    },
    description: 'Show random resource from list with notifications',
    modes: ['navigation'],
    routes: ['/']
  }
]
