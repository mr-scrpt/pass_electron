# Password Manager UI Design Concepts

Дизайн-концепции для менеджера паролей с использованием цветовой схемы **Catppuccin Mocha**.

## Требования

- **Цветовая схема**: Catppuccin Mocha
- **Ширина контейнера**: 800 пикселей
- **Стилизация компонентов**: Использование существующего UI kit (кнопки и инпуты)

## Структура интерфейса

### Header
- Логотип приложения
- Название "Password Manager"

### Search Section
- Поле для поиска
- Кнопка обновления данных с бэкэнда
- Статус обновления (индикатор)
- Кнопка добавления нового ресурса

### Resource List
Список ресурсов в формате: `[namespace] resource-name`

Примеры:
- `[social] twitter`
- `[ai] chatgpt`
- `[test] bank-details`

**Особенности**:
- Каждый namespace имеет свой цвет
- Выделение активного элемента
- Hover эффекты на элементах

### Hotkeys Section
Подсказки по горячим клавишам приложения

### Footer
- Текущий режим работы: `search mode` или `navigation mode`
- Подсказка вызова помощи

---

## Варианты дизайна

### Вариант 1: Современный с Glassmorphism

![Вариант 1](/home/mr/Hellkitchen/solution/pass/electron/project/docs/concepts/password_manager_variant_1.png)

**Характеристики**:
- Чистый, воздушный интерфейс
- Мягкие тени и glassmorphism эффекты
- Закругленные углы (8px)
- Акцент на читаемости
- Подходит для основного use case

---

### Вариант 2: Минималистичный/Плоский

![Вариант 2](/home/mr/Hellkitchen/solution/pass/electron/project/docs/concepts/password_manager_variant_2.png)

**Характеристики**:
- Максимально чистый дизайн без теней
- Фокус на типографике и цветовом кодировании
- Цветные namespace теги
- Активный элемент выделен левым акцентным бордером (4px)
- Квадратные кнопки
- Flat design подход

---

### Вариант 3: Премиум с богатыми эффектами

![Вариант 3](/home/mr/Hellkitchen/solution/pass/electron/project/docs/concepts/password_manager_variant_3.png)

**Характеристики**:
- Градиенты и свечения
- Pill-образные namespace badges
- Карточный стиль для элементов списка
- Клавиши хоткеев стилизованы под механическую клавиатуру
- Hover эффекты с масштабированием
- Самый визуально насыщенный вариант

---

## Старая версия (для сравнения)

![Старая версия](/home/mr/Hellkitchen/solution/pass/electron/project/docs/concepts/password_manager_old_version.png)

---

## Catppuccin Mocha - Цветовая палитра

| Назначение | Цвет | Hex |
|------------|------|-----|
| Background | Base | `#1e1e2e` |
| Primary Text | Text | `#cdd6f4` |
| Mauve (Accent) | Mauve | `#cba6f7` |
| Blue (Social) | Blue | `#89b4fa` |
| Pink (AI) | Pink | `#f5c2e7` |
| Yellow/Peach (Test) | Peach | `#fab387` |
| Green (Actions) | Green | `#a6e3a1` |
| Teal (Refresh) | Teal | `#94e2d5` |
| Surface | Surface0 | `#313244` |
| Border | Surface1 | `#45475a` |

---

## Общие элементы всех вариантов

✅ Catppuccin Mocha цветовая схема  
✅ 800px ширина контейнера  
✅ Цветовое кодирование namespace  
✅ Стиль кнопок из UI kit (`border-2`, `rounded-md`, `transition-all`)  
✅ Выделение активного элемента и hover состояний  
✅ Соответствие существующим компонентам Button и Input
