export class CreateListaCommand {
  constructor(
    public readonly userId: string,
    public readonly blocoId: string,
    public readonly nome: string,
    public readonly tipoLista?: string,
  ) {}
}
