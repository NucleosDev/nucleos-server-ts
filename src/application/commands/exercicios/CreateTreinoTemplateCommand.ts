export class CreateTreinoTemplateCommand {
  constructor(
    public readonly userId: string,
    public readonly blocoId: string,
    public readonly nome: string,
    public readonly descricao?: string,
  ) {}
}
