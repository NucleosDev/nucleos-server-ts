export class DeleteTarefaCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
