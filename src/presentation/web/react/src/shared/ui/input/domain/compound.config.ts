// src/presentation/web/react/src/shared/ui/input/domain/compound.config.ts

import { INPUT_VIEW } from './view.type';
import { INPUT_STATE } from './state.type';
import { INPUT_COMPOUND_STATE } from './compound-state.type';

/**
 * ДЕКЛАРАТИВНЫЙ mapping: view + state → compound state
 * Это единственное место где определяется какая комбинация что означает
 * 
 * VIEW-First: VIEW определяет как интерпретировать STATE
 */
export const inputCompoundStateMapping = {
  [INPUT_VIEW.PIMARY]: {
    [INPUT_STATE.IDLE]: INPUT_COMPOUND_STATE.PRIMARY_IDLE,
    [INPUT_STATE.ERROR]: INPUT_COMPOUND_STATE.PRIMARY_ERROR,
    [INPUT_STATE.SUCCESS]: INPUT_COMPOUND_STATE.PRIMARY_SUCCESS,
    [INPUT_STATE.WARNING]: INPUT_COMPOUND_STATE.PRIMARY_WARNING,
  },
  
  [INPUT_VIEW.SECONDARY]: {
    [INPUT_STATE.IDLE]: INPUT_COMPOUND_STATE.SECONDARY_IDLE,
    [INPUT_STATE.ERROR]: INPUT_COMPOUND_STATE.SECONDARY_ERROR,
    [INPUT_STATE.SUCCESS]: INPUT_COMPOUND_STATE.SECONDARY_SUCCESS,
    [INPUT_STATE.WARNING]: INPUT_COMPOUND_STATE.SECONDARY_WARNING,
  },
} satisfies Record<INPUT_VIEW, Record<INPUT_STATE, INPUT_COMPOUND_STATE>>;
