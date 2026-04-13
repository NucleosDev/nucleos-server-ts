export class ToggleItemCheckedCommand {
  constructor(
    public readonly id: string,
    public readonly checked?: boolean,
  ) {}
}
