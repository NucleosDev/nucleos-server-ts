export class GetColecaoByIdQuery {
  constructor(
    public readonly colecaoId: string,
    public readonly userId: string,
  ) {}
}
