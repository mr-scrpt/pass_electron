// src/presentation/web/react/src/shared/ui/input/model/useInputClassBuilder.model.ts
import { cva } from 'class-variance-authority';
import { inputBaseCln } from '../domain/base';
import { inputViewCln } from '../domain/view.cln';
import { inputSizeCln } from '../domain/size.cln';
import { inputStateCln } from '../domain/state.cln';
import { inputNativeStateCln } from '../domain/native-state.cln';
import { INPUT_VIEW } from '../domain/view.type';
import { INPUT_SIZE } from '../domain/size.type';
import { INPUT_STATE } from '../domain/state.type';
import { resolveInputTheme, getThemeClasses } from '../lib/resolveInputTheme';
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
 * 1. Собираем статичные стили через CVA (base + view + size + state + native)
 * 2. Резолвим интерактивные темы через универсальный resolver (НЕТ if'ов)
 * 3. Получаем классы для интерактивных тем
 * 4. Объединяем всё через cn()
 */
export function useInputClassBuilder(params: UseInputClassBuilderParams): string {
  const { view, size, state, className } = params;

  // Базовые + view + size + state стили через CVA
  const staticClasses = cva(
    [
      ...inputBaseCln,
      ...inputNativeStateCln, // ❗ ВАЖНО: в конце, чтобы перебивать интерактивные стили
    ],
    {
      variants: {
        view: { ...inputViewCln },
        size: { ...inputSizeCln },
        state: { ...inputStateCln },
      },
    }
  )({ view, size, state });

  // Резолвим интерактивные темы ДЕКЛАРАТИВНО (через универсальный resolver)
  const theme = resolveInputTheme({ view, state });
  const themeClasses = getThemeClasses(theme);

  // Собираем всё вместе
  // Порядок ВАЖЕН: static → theme → className
  // native-state стили перебивают theme через CSS специфичность
  return cn(staticClasses, themeClasses, className);
}
