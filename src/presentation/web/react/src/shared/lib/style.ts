export const inlineClassBuilder = (arr: Array<string>) => arr.join(" ");
// src/shared/lib/ui/resolveState.ts
type StateResolver<TState> = {
  condition: boolean;
  state: TState;
};

type ResolveStateParams<TState> = {
  resolvers: Array<StateResolver<TState>>;
  defaultState: TState;
};

export const resolveState = <TState>({
  resolvers,
  defaultState,
}: ResolveStateParams<TState>): TState => {
  return resolvers.find(({ condition }) => condition)?.state ?? defaultState;
};
