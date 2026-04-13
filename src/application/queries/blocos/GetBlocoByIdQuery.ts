export class GetBlocoByIdQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly nucleoId: string,
  ) {}
}
