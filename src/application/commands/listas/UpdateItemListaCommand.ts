export class UpdateItemListaCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly nome?: string,
    public readonly quantidade?: number,
    public readonly valorUnitario?: number,
    public readonly categoriaId?: string,
  ) {}
}
