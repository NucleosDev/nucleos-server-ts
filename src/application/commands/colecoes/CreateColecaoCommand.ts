export class CreateColecaoCommand {
  constructor(
    public readonly userId: string,
    public readonly blocoId: string,
    public readonly nome: string,
  ) {}
}
