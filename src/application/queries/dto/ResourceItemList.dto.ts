//  src/application/queries/dtos/ResourceListItemDTO.ts
export interface ResourceItemListDTO {
  id: string;
  namespace: string;
  name: string;
  secretPreview: string;
  fieldsCount: number;
  updatedAt: string;
}
