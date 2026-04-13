export class CreateEventoCommand {
  constructor(
    public readonly nucleoId: string,
    public readonly titulo: string,
    public readonly dataEvento: Date,
    public readonly descricao?: string,
    public readonly duracaoMinutos?: number,
  ) {}
}
