export class RegistrarHabitoCommand {
  constructor(
    public readonly habitoId: string,
    public readonly userId: string,
    public readonly data: Date,
    public readonly vezesCompletadas?: number,
  ) {}
}
