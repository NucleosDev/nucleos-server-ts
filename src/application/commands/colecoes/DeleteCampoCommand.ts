export class DeleteCampoCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}