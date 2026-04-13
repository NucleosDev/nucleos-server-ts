export class GetTarefasByBlocoQuery {
  constructor(
    public readonly blocoId: string,
    public readonly userId: string,
  ) {}
}
