export class ItemListaCheckedEvent {
  constructor(
    public readonly userId: string,
    public readonly itemId: string,
    public readonly itemNome: string,
    public readonly listaId: string,
    public readonly nucleoId?: string,
    public readonly ocorridoEm: Date = new Date(),
  ) {}
}
