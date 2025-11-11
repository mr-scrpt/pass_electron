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

/**
 * УНИВЕРСАЛЬНАЯ функция резолвинга compound interaction states
 * Формирует массив ключей для всех интеракций (FOCUS, HOVER, ACTIVE, и т.д.)
 * 
 * @param mapping - конфиг mapping (view/variant + state → compound state)
 * @param params - параметры для резолвинга (view, state)
 * @param interactions - массив интеракций (например, ["FOCUS", "HOVER", "ACTIVE"])
 * @returns массив compound interaction ключей
 * 
 * @example
 * resolveCompoundInteractionStates(
 *   inputCompoundStateMapping,
 *   { view: "PRIMARY", state: "ERROR" },
 *   ["FOCUS", "HOVER", "ACTIVE"]
 * )
 * // → ["PRIMARY_ERROR_FOCUS", "PRIMARY_ERROR_HOVER", "PRIMARY_ERROR_ACTIVE"]
 */
export function resolveCompoundInteractionStates<
  TView extends string | number,
  TState extends string | number,
  TCompoundState extends string,
  TInteraction extends string
>(
  mapping: Record<TView, Record<TState, TCompoundState>>,
  params: { view: TView; state: TState },
  interactions: readonly TInteraction[]
): `${TCompoundState}_${TInteraction}`[] {
  const compoundState = resolveCompoundState(mapping, params);
  
  return interactions.map(
    (interaction) => `${compoundState}_${interaction}` as `${TCompoundState}_${TInteraction}`
  );
}
