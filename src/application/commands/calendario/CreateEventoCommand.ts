// src/application/commands/calendario/CreateEventoCommand.ts
export class CreateEventoCommand {
  constructor(
    // Obrigatórios primeiro
    public readonly userId: string,
    public readonly nucleoId: string,
    public readonly titulo: string,
    public readonly dataEvento: Date,
    // Opcionais depois
    public readonly descricao?: string,
    public readonly duracaoMinutos?: number,
  ) {}
}
