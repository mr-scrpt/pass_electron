// src/presentation/web/react/src/shared/ui/input/domain/compound-state.type.ts

/**
 * Compound States - семантические комбинации VIEW + STATE
 * Каждая комбинация имеет уникальное имя и определяет полный набор стилей
 * 
 * Формат: {VIEW}_{STATE}
 * Пример: PRIMARY_ERROR означает "PRIMARY view в состоянии ERROR"
 */
export enum INPUT_COMPOUND_STATE {
  // ========================================
  // PRIMARY комбинации
  // ========================================
  PRIMARY_IDLE,
  PRIMARY_ERROR,
  PRIMARY_SUCCESS,
  PRIMARY_WARNING,

  // ========================================
  // SECONDARY комбинации
  // ========================================
  SECONDARY_IDLE,
  SECONDARY_ERROR,
  SECONDARY_SUCCESS,
  SECONDARY_WARNING,
}

export type InputCompoundStateType = INPUT_COMPOUND_STATE;
