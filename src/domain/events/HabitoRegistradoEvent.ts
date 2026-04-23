export class HabitoRegistradoEvent {
  constructor(
    public readonly userId: string,
    public readonly habitoId: string,
    public readonly habitoNome: string,
    public readonly nucleoId?: string,
    public readonly blocoId?: string,
    public readonly ocorridoEm: Date = new Date(),
  ) {}
}
