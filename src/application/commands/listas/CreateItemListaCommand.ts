export class CreateItemListaCommand {
  constructor(
    public readonly userId: string,
    public readonly listaId: string,
    public readonly nome: string,
    public readonly quantidade?: number,
    public readonly valorUnitario?: number,
    public readonly categoriaId?: string,
  ) {}
}
