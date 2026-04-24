export class GetHabitosByBlocoQuery {
  constructor(
    public readonly blocoId: string,
    public readonly userId: string,
  ) {}
}
