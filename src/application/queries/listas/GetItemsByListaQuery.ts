export class GetItemsByListaQuery {
  constructor(
    public readonly listaId: string,
    public readonly userId: string,
  ) {}
}
