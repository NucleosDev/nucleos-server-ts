export class DeleteBlocoCommand {
  constructor(
    public readonly id: string,
    public readonly nucleoId: string
  ) {}
}