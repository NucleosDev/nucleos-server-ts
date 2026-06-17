export class UpdateTreinoTemplateCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly nome?: string,
    public readonly descricao?: string | null,
  ) {}
}
