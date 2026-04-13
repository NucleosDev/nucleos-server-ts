export class GetCamposByColecaoQuery {
  constructor(
    public readonly colecaoId: string,
    public readonly userId: string,
  ) {}
}
