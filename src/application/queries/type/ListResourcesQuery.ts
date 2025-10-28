import type { IQuery } from "./IQuery";

export class ResourceListQuery implements IQuery {
  readonly type = "ListResourcesQuery";
}
