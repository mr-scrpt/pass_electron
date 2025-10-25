import type { PipelineContext } from "@/shared/pipeline";

export interface CreateContext<TCommand, TEntity> extends PipelineContext {
  command: TCommand;
  entity?: TEntity;
}

export interface UpdateContext<TCommand, TEntity> extends PipelineContext {
  command: TCommand;
  existingEntity?: TEntity;
  updatedEntity?: TEntity;
}

export interface DeleteContext<TCommand, TEntity> extends PipelineContext {
  command: TCommand;
  entityToDelete?: TEntity;
}
