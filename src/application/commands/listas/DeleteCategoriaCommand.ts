export class DeleteCategoriaCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
