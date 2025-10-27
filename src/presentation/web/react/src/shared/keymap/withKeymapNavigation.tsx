// src/presentation/web/react/src/shared/keymap/withKeymapNavigation.tsx
import { useState, type ComponentType } from "react";
import { useKeymapListener } from "../../hooks/useKeymap";
import { useKeymaps } from "./useKeymaps";
import type { FeatureKeymapConfig } from "./types";
import type { ListProps } from "../ui/NavigationList";

/**
 * HOC для добавления навигации по клавишам к списку
 * 
 * ✅ Принимает чистый компонент списка
 * ✅ Добавляет состояние фокуса
 * ✅ Биндит кеймапы
 * ✅ Оборачивает items и добавляет highlight стили
 * 
 * @layer Presentation/Shared
 */

/**
 * Конфигурация для withKeymapNavigation
 */
export type NavigationKeymapConfig<TDeps = any> = {
  // Конфиг кеймапов
  keymapConfig: FeatureKeymapConfig<TDeps>;
  
  // Фабрика зависимостей - получает focusNext/focusPrev + custom deps
  getDeps: (navigation: {
    focusNext: () => void;
    focusPrevious: () => void;
    focusedIndex: number;
  }) => TDeps;
};

/**
 * HOC - добавляет кеймап навигацию к компоненту списка
 * 
 * ✅ Оборачивает каждый item в wrapper с highlight стилями
 * ✅ Чистый компонент НЕ знает про highlight
 * 
 * @example
 * const KeymapList = withKeymapNavigation(List, {
 *   keymapConfig: testKeymapConfig,
 *   getDeps: ({ focusNext, focusPrevious }) => ({
 *     focusNext,
 *     focusPrevious,
 *   })
 * });
 */
export function withKeymapNavigation<TItem, TDeps = any>(
  Component: ComponentType<ListProps<TItem>>,
  config: NavigationKeymapConfig<TDeps>
) {
  return function WithKeymapNavigationComponent(props: ListProps<TItem>) {
    const [focusedIndex, setFocusedIndex] = useState(0);

    // ✅ Навигация по индексам
    const navigation = {
      focusNext: () => {
        setFocusedIndex((i) => (i + 1) % props.items.length);
      },
      focusPrevious: () => {
        setFocusedIndex((i) => (i - 1 + props.items.length) % props.items.length);
      },
      focusedIndex,
    };

    // ✅ Получаем зависимости через фабрику
    const deps = config.getDeps(navigation);

    // ✅ Активируем слушатели для всех режимов
    Object.values(config.keymapConfig).forEach((mode) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useKeymapListener({
        route: mode.route,
        mode: mode.mode,
      });
    });

    // ✅ Биндим кеймапы к зависимостям
    useKeymaps(config.keymapConfig, deps);

    // ✅ Проверяем какой item сфокусирован
    const isItemFocused = (item: TItem) => {
      const itemId = props.getItemId(item);
      const currentItem = props.items[focusedIndex];
      return currentItem && props.getItemId(currentItem) === itemId;
    };

    // ✅ Оборачиваем renderItem - добавляем wrapper с highlight стилями
    const enhancedRenderItem = (item: TItem) => {
      const isFocused = isItemFocused(item);
      return (
        <div
          className={`transition-colors ${
            isFocused
              ? "bg-ctp-mauve text-ctp-base font-semibold"
              : "bg-ctp-surface1 text-ctp-text"
          }`}
        >
          {props.renderItem(item)}
        </div>
      );
    };

    // ✅ Передаем все пропсы, но с enhanced renderItem
    return <Component {...props} renderItem={enhancedRenderItem} />;
  };
}
