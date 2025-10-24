// src/domain/shared/specification/index.ts

// ✅ Экспорт ТОЛЬКО бизнес-спецификаций (Domain Logic)
// ⚠️ Технические типы (ISpecification, BaseError) импортируются ЯВНО из @/shared/
export { CommonLengthSpec } from './common/CommonLengthSpec'
export { CommonPatternSpec } from './common/CommonPatternSpec'
export { CommonNotEmptySpec } from './common/CommonNotEmptySpec'
