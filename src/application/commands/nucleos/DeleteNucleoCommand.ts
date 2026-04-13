export class DeleteNucleoCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
