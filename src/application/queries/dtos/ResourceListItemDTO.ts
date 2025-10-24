export interface ResourceListItemDTO {
  id: string; // ResourceId → string
  namespace: string; // Namespace → string
  name: string; // ResourceName → string
  secretPreview: string; // Secret → замаскированная строка ('****')
  fieldsCount: number; // Количество CustomField (0 в Step 1, будет в Step 2)
  updatedAt: string; // Date → ISO string
}
