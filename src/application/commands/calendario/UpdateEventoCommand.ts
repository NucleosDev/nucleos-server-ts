export class UpdateEventoCommand {
  constructor(
    public readonly id: string,
    public readonly titulo?: string,
    public readonly descricao?: string,
    public readonly dataEvento?: Date,
    public readonly duracaoMinutos?: number | null,
  ) {}
}
