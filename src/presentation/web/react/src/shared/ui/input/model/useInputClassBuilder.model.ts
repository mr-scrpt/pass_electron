// src/presentation/web/react/src/shared/ui/input/model/useInputClassBuilder.model.ts
import { cva } from 'class-variance-authority';
import { inputBaseCln } from '../domain/base';
import { inputViewCln } from '../domain/view.cln';
import { inputSizeCln } from '../domain/size.cln';
import { inputNativeStateCln } from '../domain/native-state.cln';
import { INPUT_VIEW } from '../domain/view.type';
import { INPUT_SIZE } from '../domain/size.type';
import { INPUT_STATE } from '../domain/state.type';
import { resolveInputTheme, getInputThemeClasses } from '../lib/resolveInputTheme';
import { cn } from '@/shared/lib/utils';

type UseInputClassBuilderParams = {
  view: INPUT_VIEW;
  size: INPUT_SIZE;
  state: INPUT_STATE;
  className?: string;
};

/**
 * ДЕКЛАРАТИВНЫЙ билдер классов для Input
 * 
 * Алгоритм:
 * 1. Собираем базовые стили через CVA (base + view + size + native)
 * 2. Резолвим compound тему (статические + интерактивные) через view + state
 * 3. Получаем классы для compound темы
 * 4. Объединяем всё через cn()
 * 
 * STATE НЕ управляет стилями напрямую - VIEW определяет как интерпретировать STATE
 */
export function useInputClassBuilder(params: UseInputClassBuilderParams): string {
  const { view, size, state, className } = params;

  // Базовые + view + size стили через CVA (БЕЗ state!)
  const staticClasses = cva(
    [
      ...inputBaseCln,
      ...inputNativeStateCln, // ❗ ВАЖНО: в конце, чтобы перебивать интерактивные стили
    ],
    {
      variants: {
        view: { ...inputViewCln },
        size: { ...inputSizeCln },
        // ❌ НЕТ state - он теперь в compound!
      },
    }
  )({ view, size });

  // Резолвим compound тему (статические + интерактивные)
  const theme = resolveInputTheme({ view, state });
  const themeClasses = getInputThemeClasses(theme);

  // Собираем всё вместе
  // Порядок ВАЖЕН: static → theme → className
  // native-state стили перебивают theme через CSS специфичность
  return cn(staticClasses, themeClasses, className);
}
