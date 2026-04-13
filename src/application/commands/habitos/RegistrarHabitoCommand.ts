export class RegistrarHabitoCommand {
  constructor(
    public readonly habitoId: string,
    public readonly data: Date,
    public readonly vezesCompletadas?: number,
  ) {}
}
