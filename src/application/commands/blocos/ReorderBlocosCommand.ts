export interface OrderItem {
  id: string;
  posicao: number;
}

export class ReorderBlocosCommand {
  constructor(
    public readonly nucleoId: string,
    public readonly orders: OrderItem[],
  ) {}
}
