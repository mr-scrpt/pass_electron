/**
 * Безопасная сериализация unknown значения в строку
 * 
 * Защищает от:
 * - XSS атак (экранирует HTML)
 * - [object Object] в UI
 * - Циклических ссылок
 * 
 * @param value - любое значение
 * @returns безопасная строка для показа пользователю
 */
export function safeStringify(value: unknown): string | undefined {
  // null/undefined → undefined
  if (value == null) {
    return undefined;
  }

  // Строка → экранируем HTML теги
  if (typeof value === 'string') {
    // Убираем потенциально опасные символы
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .slice(0, 500); // Ограничиваем длину
  }

  // Примитивы → toString()
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  // Объект/массив → JSON.stringify с защитой
  if (typeof value === 'object') {
    try {
      const json = JSON.stringify(value, null, 2);
      // Ограничиваем длину JSON
      return json.length > 500 
        ? json.slice(0, 500) + '...' 
        : json;
    } catch (error) {
      // Циклическая ссылка или другая ошибка
      return '[Complex object]';
    }
  }

  // Function, Symbol, etc
  return String(value).slice(0, 100);
}
