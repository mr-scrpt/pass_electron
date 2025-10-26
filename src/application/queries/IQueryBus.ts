import type { Validation } from '@/shared/validation'
import type { IError } from '@/shared/errors'
import type { IQuery } from './IQuery'

/**
 * Query Bus - dispatcher для Query Handlers
 * 
 * Позволяет регистрировать handlers динамически
 * и выполнять queries через единый интерфейс
 */
export interface IQueryBus {
  /**
   * Регистрация handler для типа query
   */
  register<TQuery extends IQuery, TResult>(
    queryType: string,
    handler: (query: TQuery) => Promise<Validation<IError[], TResult>>
  ): void

  /**
   * Выполнение query через зарегистрированный handler
   */
  execute<TResult>(
    query: IQuery
  ): Promise<Validation<IError[], TResult>>
}
