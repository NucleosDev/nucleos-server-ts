export class GetTreinosByBlocoQuery {
  constructor(
    public readonly blocoId: string,
    public readonly userId: string,
  ) {}
}
