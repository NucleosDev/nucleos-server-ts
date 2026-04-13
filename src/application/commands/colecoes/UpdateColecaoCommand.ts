export class UpdateColecaoCommand {
  constructor(
    public readonly id: string,
    public readonly nome?: string,
  ) {}
}
