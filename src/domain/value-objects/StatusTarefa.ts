export type StatusTarefaValue = "pendente" | "concluida" | "atrasada";

export class StatusTarefa {
  private constructor(private readonly value: StatusTarefaValue) {}

  static PENDENTE = new StatusTarefa("pendente");
  static CONCLUIDA = new StatusTarefa("concluida");
  static ATRASADA = new StatusTarefa("atrasada");

  static from(value: string): StatusTarefa {
    const valid: StatusTarefaValue[] = ["pendente", "concluida", "atrasada"];
    if (!valid.includes(value as StatusTarefaValue)) {
      throw new Error(`Invalid status: "${value}"`);
    }
    return new StatusTarefa(value as StatusTarefaValue);
  }

  toString(): StatusTarefaValue {
    return this.value;
  }

  equals(other: StatusTarefa): boolean {
    return this.value === other.value;
  }

  isConcluida(): boolean {
    return this.value === "concluida";
  }
}
