export class UpdateListaCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly nome?: string,
    public readonly tipoLista?: string,
  ) {}
}
