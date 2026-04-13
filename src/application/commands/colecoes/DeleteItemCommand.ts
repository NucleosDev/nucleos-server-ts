export class DeleteItemCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
