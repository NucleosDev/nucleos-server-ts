export class UpdateItemCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly valores: Record<string, any>,
  ) {}
}
