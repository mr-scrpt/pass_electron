import { Validation } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import { NamespaceInvariant } from "../invariants";

export class Namespace {
  private static readonly ENTITY_TYPE = "Namespace";

  private constructor(private readonly _value: string) {}

  static create(value: string): Validation<ValidationError[], Namespace> {
    return NamespaceInvariant.instance
      .validate(value, Namespace.ENTITY_TYPE)
      .map((validValue: string) => new Namespace(validValue));
  }

  getValue(): string {
    return this._value;
  }

  equals(other: Namespace): boolean {
    return this._value === other._value;
  }
}
