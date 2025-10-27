// presentation/web/react/hooks/useFocus.ts

import { useState, useEffect, useCallback } from 'react'
import { FocusManager } from '@/presentation/shared/systems/focus'

/**
 * React hook для управления фокусом в списке
 * 
 * @example
 * function ResourceList({ resources }) {
 *   const { focusedIndex, focusedItem, moveNext, movePrevious } = useFocus(resources)
 *   
 *   // Регистрируем клавиши
 *   useKeymap({
 *     key: 'ArrowDown',
 *     description: 'Move down',
 *     context: { route: '/resources', mode: 'navigation' },
 *     action: moveNext,
 *   })
 *   
 *   return (
 *     <ul>
 *       {resources.map((resource, index) => (
 *         <li key={resource.id} data-focused={index === focusedIndex}>
 *           {resource.name}
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 */
export function useFocus<T>(items: T[]) {
  const [manager] = useState(() => new FocusManager<T>())
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [focusedItem, setFocusedItem] = useState<T | null>(null)

  // Обновляем элементы
  useEffect(() => {
    manager.setItems(items)
  }, [items])

  // Подписываемся на изменения
  useEffect(() => {
    manager.onChange((item, index) => {
      setFocusedItem(item)
      setFocusedIndex(index)
    })
  }, [])

  return {
    focusedIndex,
    focusedItem,
    moveNext: useCallback(() => manager.moveNext(), []),
    movePrevious: useCallback(() => manager.movePrevious(), []),
    moveFirst: useCallback(() => manager.moveFirst(), []),
    moveLast: useCallback(() => manager.moveLast(), []),
    setFocusedIndex: useCallback((index: number) => manager.setFocusedIndex(index), []),
  }
}