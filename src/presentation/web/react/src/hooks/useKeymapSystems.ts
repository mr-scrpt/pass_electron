// presentation/web/react/hooks/useKeymapSystems.ts

import { useMemo } from 'react'
import { KeymapRegistry, KeymapExecutor } from '@/systems/keymap'
import { ModalStateMachine } from '@/systems/modal'

// Singleton instances
let keymapRegistry: KeymapRegistry | null = null
let keymapExecutor: KeymapExecutor | null = null
let modalStateMachine: ModalStateMachine | null = null

/**
 * Hook для доступа к KeymapRegistry (singleton)
 */
export function useKeymapRegistry(): KeymapRegistry {
  return useMemo(() => {
    if (!keymapRegistry) {
      keymapRegistry = new KeymapRegistry()
    }
    return keymapRegistry
  }, [])
}

/**
 * Hook для доступа к KeymapExecutor (singleton)
 */
export function useKeymapExecutor(): KeymapExecutor {
  return useMemo(() => {
    if (!keymapExecutor) {
      const registry = keymapRegistry || new KeymapRegistry()
      if (!keymapRegistry) {
        keymapRegistry = registry
      }
      keymapExecutor = new KeymapExecutor(registry)
    }
    return keymapExecutor
  }, [])
}

/**
 * Hook для доступа к ModalStateMachine (singleton)
 */
export function useModalStateMachine(): ModalStateMachine {
  return useMemo(() => {
    if (!modalStateMachine) {
      modalStateMachine = new ModalStateMachine()
    }
    return modalStateMachine
  }, [])
}
