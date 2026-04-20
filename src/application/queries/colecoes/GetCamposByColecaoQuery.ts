export class GetCamposByColecaoQuery {
  constructor(
    public readonly userId: string,
    public readonly colecaoId: string,
  ) {}
}
