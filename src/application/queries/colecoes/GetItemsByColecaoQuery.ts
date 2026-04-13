export class GetItemsByColecaoQuery {
  constructor(
    public readonly colecaoId: string,
    public readonly userId: string, //
  ) {}
}
