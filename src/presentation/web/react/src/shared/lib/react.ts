"use client";
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Context,
} from "react";

export function useStrictContext<T>(context: Context<T | null>) {
  const value = useContext(context);
  if (value === null) throw new Error("Strict context not passed");
  return value as T;
}

export function createStrictContext<T>() {
  return createContext<T | null>(null);
}

export function useAppearanceDelay(
  show?: boolean,
  options = {} as {
    defaultValue?: boolean;
    appearenceDelay?: number;
    minDisplay?: number;
  },
) {
  const {
    minDisplay = 500,
    defaultValue = false,
    appearenceDelay = 200,
  } = options;

  const [delayedShow, setDelayedShow] = useState(defaultValue);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        startTransition(() => setDelayedShow(true));
      }, appearenceDelay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        startTransition(() => setDelayedShow(false));
      }, minDisplay);
      return () => clearTimeout(timer);
    }
  }, [appearenceDelay, show, minDisplay]);

  return delayedShow;
}

type Fn<ARGS extends any[], R> = (...args: ARGS) => R;

export function useEventCallback<A extends any[], R>(fn: Fn<A, R>): Fn<A, R> {
  const ref = useRef<Fn<A, R>>(fn);
  useEffect(() => {
    ref.current = fn;
  });
  return useMemo(
    () =>
      (...args: A): R => {
        const { current } = ref;
        return current(...args);
      },
    [],
  );
}

export const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return {
    isHovered,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
};

export function useWindowWidth(): number {
  // Инициализируем состояние шириной window.innerWidth или 0, если код выполняется на сервере
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    // Обработчик изменения размера окна
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Добавляем слушатель события
    window.addEventListener("resize", handleResize);

    // Вызываем обработчик сразу после монтирования, чтобы получить актуальную ширину
    handleResize();

    // Удаляем слушатель при размонтировании компонента
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Пустой массив зависимостей гарантирует, что эффект запустится один раз

  return width;
}
