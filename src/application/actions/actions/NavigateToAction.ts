import type { IAction } from '../IAction'

/**
 * NavigateToAction - навигация на страницу
 * 
 * Используется в Keymaps для навигации между страницами
 * без прямой зависимости от React Router
 * 
 * Handler реализован в Presentation Layer и использует
 * useNavigate() hook из React Router
 */
export class NavigateToAction implements IAction {
  readonly type = 'NavigateToAction'
  
  constructor(public readonly path: string) {}
}
