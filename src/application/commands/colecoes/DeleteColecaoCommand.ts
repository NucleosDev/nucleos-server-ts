export class DeleteColecaoCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
