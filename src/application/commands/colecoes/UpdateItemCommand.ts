export class UpdateItemCommand {
  constructor(
    public readonly id: string,
    public readonly valores: Record<string, any>,
  ) {}
}
