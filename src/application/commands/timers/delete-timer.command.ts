export class DeleteTimerCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
