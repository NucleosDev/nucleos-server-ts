export class UpdateTimerCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly titulo: string,
  ) {}
}
