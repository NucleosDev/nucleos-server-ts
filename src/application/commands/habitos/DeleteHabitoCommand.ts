// application/commands/habitos/DeleteHabitoCommand.ts

export class DeleteHabitoCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
