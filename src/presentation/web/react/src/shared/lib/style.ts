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

export const mergeNativeProps = <T extends Record<string, unknown>>(
  props: T,
  defaults: Required<T>,
): Required<T> => {
  return Object.keys(defaults).reduce((acc, key) => {
    const k = key as keyof T;
    acc[k] = props[k] ?? defaults[k];
    return acc;
  }, {} as Required<T>);
};
