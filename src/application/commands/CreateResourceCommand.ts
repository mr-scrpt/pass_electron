import type { ICommand } from "./ICommand";

/**
 * Command: Создать новый Resource
 */
export class CreateResourceCommand implements ICommand {
  readonly type = "CreateResourceCommand";

  constructor(
    public readonly namespace: string,
    public readonly name: string,
    public readonly secret: string,
  ) {}
}
