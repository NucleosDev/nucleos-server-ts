export class CreateItemCommand {
  constructor(
    public readonly colecaoId: string,
    public readonly valores: Record<string, any>,
  ) {}
}
