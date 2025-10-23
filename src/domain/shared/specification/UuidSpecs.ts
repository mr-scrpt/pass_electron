import {
  CommonNotEmptySpec,
  CommonPatternSpec,
} from "@/domain/shared/specification";

export const UUID_NOT_EMPTY_SPEC = new CommonNotEmptySpec("UUID");

export const UUID_FORMAT_SPEC = new CommonPatternSpec(
  "UUID",
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  "must be a valid UUID v4",
);
