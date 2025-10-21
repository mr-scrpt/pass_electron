/**
 * DTO для списка ресурсов
 * Простые примитивы для UI (не Value Objects!)
 */
export interface ResourceListItemDTO {
  id: string; // ResourceId → string
  namespace: string; // Namespace → string
  name: string; // ResourceName → string
  secretPreview?: string; // Первые символы + ***
  fieldsCount: number;
  updatedAt: string; // Date → ISO string
}
