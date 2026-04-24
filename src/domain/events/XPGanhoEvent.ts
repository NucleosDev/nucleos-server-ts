export class XPGanhoEvent {
  constructor(
    public readonly userId: string,
    public readonly xpAmount: number,
    public readonly source: string,
    public readonly nucleoId?: string,
    public readonly ocorridoEm: Date = new Date(),
  ) {}
}
