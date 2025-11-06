/**
 * УНИВЕРСАЛЬНАЯ функция резолвинга compound state
 * Работает для ЛЮБОГО компонента (Input, Button, Select, и т.д.)
 * 
 * @param mapping - конфиг mapping (view/variant + state → compound state)
 * @param params - параметры для резолвинга
 * @returns compound state
 */
export function resolveCompoundState<
  TView extends string | number,
  TState extends string | number,
  TCompoundState
>(
  mapping: Record<TView, Record<TState, TCompoundState>>,
  params: { view: TView; state: TState }
): TCompoundState {
  return mapping[params.view][params.state];
}
