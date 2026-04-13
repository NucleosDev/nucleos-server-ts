export class CreateItemListaCommand {
  constructor(
    public readonly listaId: string,
    public readonly nome: string,
    public readonly quantidade?: number,
    public readonly valorUnitario?: number,
    public readonly categoriaId?: string,
  ) {}
}
