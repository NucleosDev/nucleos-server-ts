export class GetColecaoByIdQuery {
  constructor(
    public readonly userId: string,
    public readonly colecaoId: string,
  ) {}
}
