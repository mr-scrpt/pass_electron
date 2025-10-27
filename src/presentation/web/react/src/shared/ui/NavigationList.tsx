// src/presentation/web/react/src/shared/ui/NavigationList.tsx

/**
 * Чистые компоненты для списков
 * 
 * ✅ Переиспользуемые
 * ✅ БЕЗ логики highlight/focus
 * ✅ БЕЗ стилей состояний
 * ✅ Только базовый рендеринг
 * 
 * @layer Presentation/Shared/UI
 */

/**
 * Пропсы для элемента списка
 */
export type ListItemProps<T> = {
  item: T;
  children: (item: T) => React.ReactNode;
  className?: string;
};

/**
 * Чистый компонент элемента списка
 * 
 * ✅ НЕ знает про фокус/highlight
 * ✅ Базовые стили
 */
export function ListItem<T>({
  item,
  children,
  className = "",
}: ListItemProps<T>) {
  return (
    <li className={`p-3 rounded bg-ctp-surface1 text-ctp-text ${className}`}>
      {children(item)}
    </li>
  );
}

/**
 * Пропсы для контейнера списка
 */
export type ListProps<T> = {
  items: T[];
  getItemId: (item: T) => string | number;
  renderItem: (item: T) => React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
};

/**
 * Чистый компонент контейнера списка
 * 
 * ✅ НЕ знает про фокус/highlight
 * ✅ Только рендеринг структуры
 */
export function List<T>({
  items,
  getItemId,
  renderItem,
  className = "",
  title,
  description,
}: ListProps<T>) {
  return (
    <div className={`bg-ctp-surface0 p-6 rounded-lg ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold text-ctp-text mb-4">{title}</h2>
      )}
      {description && (
        <p className="text-ctp-subtext0 text-sm mb-4">{description}</p>
      )}
      <ul className="space-y-2">
        {items.map((item) => (
          <ListItem key={getItemId(item)} item={item}>
            {renderItem}
          </ListItem>
        ))}
      </ul>
    </div>
  );
}
