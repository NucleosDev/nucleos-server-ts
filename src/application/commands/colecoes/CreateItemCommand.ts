export class CreateItemCommand {
  constructor(
    public readonly userId: string,
    public readonly colecaoId: string,
    public readonly valores: Record<string, any>,
  ) {}
}
