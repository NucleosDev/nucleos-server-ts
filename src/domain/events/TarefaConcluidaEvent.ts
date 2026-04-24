// src/domain/events/TarefaConcluidaEvent.ts
export class TarefaConcluidaEvent {
  constructor(
    public readonly userId: string,
    public readonly tarefaId: string,
    public readonly tarefaTitulo: string,
    public readonly nucleoId?: string,
    public readonly blocoId?: string,
    public readonly ocorridoEm: Date = new Date(),
  ) {}
}
