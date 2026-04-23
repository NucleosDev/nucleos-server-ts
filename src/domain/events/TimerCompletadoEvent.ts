export class TimerCompletadoEvent {
  constructor(
    public readonly userId: string,
    public readonly timerId: string,
    public readonly duracaoSegundos: number,
    public readonly nucleoId?: string,
    public readonly ocorridoEm: Date = new Date(),
  ) {}
}
