export class CreateColecaoCommand {
  constructor(
    public readonly blocoId: string,
    public readonly nome: string
  ) {}
}