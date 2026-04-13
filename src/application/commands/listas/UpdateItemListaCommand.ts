export class UpdateItemListaCommand {
  constructor(
    public readonly id: string,
    public readonly nome?: string,
    public readonly quantidade?: number,
    public readonly valorUnitario?: number | null,
    public readonly categoriaId?: string | null,
  ) {}
}
