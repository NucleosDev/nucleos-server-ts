export class BlocoCriadoEvent {
  constructor(
    public readonly userId: string,
    public readonly blocoId: string,
    public readonly blocoNome: string,
    public readonly nucleoId: string,
    public readonly tipoBloco: string,
    public readonly ocorridoEm: Date = new Date(),
  ) {}
}
