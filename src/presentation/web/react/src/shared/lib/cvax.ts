import { cva } from "class-variance-authority";

type CVAXVariants = Record<string, Record<string, readonly string[]>>;

type CVAXConfig = {
  variants?: CVAXVariants;
  multiVariants?: CVAXVariants;
  defaultVariants?: Record<string, string>;
  compoundVariants?: Array<
    Record<string, string> & { class?: string | string[] }
  >;
};

type VariantValues = Record<string, string | string[] | undefined>;

export function cvax(config: CVAXConfig): (values: VariantValues) => string;
export function cvax(
  base: readonly string[],
  config?: CVAXConfig,
): (values: VariantValues) => string;
export function cvax(
  baseOrConfig: readonly string[] | CVAXConfig,
  configOrUndefined?: CVAXConfig,
) {
  let base: readonly string[] = [];
  let config: CVAXConfig = {};

  if (Array.isArray(baseOrConfig)) {
    base = baseOrConfig;
    config = configOrUndefined || {};
  } else {
    config = baseOrConfig as CVAXConfig;
  }

  return (values: VariantValues): string => {
    const entries = Object.entries(values).filter(([_, v]) => v !== undefined);

    const multiKeys = new Set(Object.keys(config.multiVariants ?? {}));

    const expandedVariants: Record<string, Record<string, string[]>> = {};
    const expandedValues: Record<string, string> = {};

    entries.forEach(([key, value]) => {
      if (multiKeys.has(key) && Array.isArray(value)) {
        const variantConfig = config.multiVariants![key];
        if (!variantConfig) return;

        const expandedClasses = value.flatMap((val) => [
          ...(variantConfig[val] ?? []),
        ]);

        expandedVariants[key] = { _expanded: expandedClasses };
        expandedValues[key] = "_expanded";
      }
    });

    const allVariants: Record<string, Record<string, string[]>> = {};

    if (config.variants) {
      Object.entries(config.variants).forEach(([key, variantMap]) => {
        allVariants[key] = {};
        Object.entries(variantMap).forEach(([variantKey, classes]) => {
          allVariants[key][variantKey] = [...classes];
        });
      });
    }

    Object.entries(expandedVariants).forEach(([key, expanded]) => {
      allVariants[key] = expanded;
    });

    const cvaInstance = cva([...base], {
      variants: allVariants,
      defaultVariants: config.defaultVariants,
      compoundVariants: config.compoundVariants as unknown as undefined,
    });

    const allValues: Record<string, string> = {};
    entries.forEach(([key, value]) => {
      if (typeof value === "string") {
        allValues[key] = value;
      }
    });
    Object.assign(allValues, expandedValues);

    return cvaInstance(allValues);
  };
}
