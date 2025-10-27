// presentation/web/react/hooks/useModal.ts

import { useState, useEffect } from 'react'
import { useModalStateMachine } from './useKeymapSystems'
import type { ModeState } from '@/presentation/shared/systems/modal'

/**
 * React hook для работы с модальными режимами
 * 
 * @example
 * function ResourceDetail() {
 *   const { mode, enterEditingMode, exitEditingMode } = useModal()
 *   
 *   return (
 *     <div>
 *       <ModeIndicator mode={mode} />
 *       {mode === 'navigation' && <NavigationView />}
 *       {mode === 'editing' && <EditingView />}
 *     </div>
 *   )
 * }
 */
export function useModal() {
  const stateMachine = useModalStateMachine()
  const [state, setState] = useState<ModeState>(stateMachine.getState())

  useEffect(() => {
    // Подписываемся на изменения
    const unsubscribe = stateMachine.subscribe((event) => {
      setState(event.state)
    })

    return unsubscribe
  }, [])

  return {
    mode: state.mode,
    state,
    enterEditingMode: (fieldId?: string) => stateMachine.enterEditingMode(fieldId),
    exitEditingMode: () => stateMachine.exitEditingMode(),
    setSelectedItem: (itemId: string) => stateMachine.setSelectedItem(itemId),
  }
}
