export class GetItemsByColecaoQuery {
  constructor(
    public readonly userId: string,
    public readonly colecaoId: string,
  ) {}
}
