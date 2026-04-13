export class UpdateEventoCommand {
  constructor(
    public readonly userId: string,
    public readonly eventoId: string,
    public readonly nucleoId: string,
    public readonly titulo?: string,
    public readonly descricao?: string,
    public readonly dataEvento?: Date,
    public readonly duracaoMinutos?: number,
  ) {}
}
