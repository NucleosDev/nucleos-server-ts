export class NucleoCriadoEvent {
  constructor(
    public readonly userId: string,
    public readonly nucleoId: string,
    public readonly nucleoNome: string,
    public readonly ocorridoEm: Date = new Date(),
  ) {}
}
