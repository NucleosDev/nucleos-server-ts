export class ReorderBlocosCommand {
  constructor(
    public readonly nucleoId: string,
    public readonly userId: string,
    public readonly orders: { id: string; posicao: number }[],
  ) {}
}
