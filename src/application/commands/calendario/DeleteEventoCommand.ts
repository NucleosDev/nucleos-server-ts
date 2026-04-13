export class DeleteEventoCommand {
  constructor(
    public readonly userId: string,
    public readonly eventoId: string,
    public readonly nucleoId: string,
  ) {}
}
