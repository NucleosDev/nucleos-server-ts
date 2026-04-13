export class CreateCategoriaCommand {
  constructor(
    public readonly listaId: string,
    public readonly nome: string,
    public readonly cor?: string,
  ) {}
}
