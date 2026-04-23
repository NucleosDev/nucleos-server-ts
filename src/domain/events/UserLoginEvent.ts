export class UserLoginEvent {
  constructor(
    public readonly userId: string,
    public readonly ocorridoEm: Date = new Date(),
  ) {}
}
