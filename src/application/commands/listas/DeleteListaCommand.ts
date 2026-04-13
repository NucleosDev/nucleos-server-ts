export class DeleteListaCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
