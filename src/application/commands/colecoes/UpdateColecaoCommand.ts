export class UpdateColecaoCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly nome?: string,
  ) {}
}
