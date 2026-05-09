export type FrequenciaHabitoValue = "diaria" | "semanal" | "personalizada";

export class FrequenciaHabito {
  private constructor(private readonly value: FrequenciaHabitoValue) {}

  static DIARIA = new FrequenciaHabito("diaria");
  static SEMANAL = new FrequenciaHabito("semanal");
  static PERSONALIZADA = new FrequenciaHabito("personalizada");

  static from(value: string): FrequenciaHabito {
    const valid: FrequenciaHabitoValue[] = [
      "diaria",
      "semanal",
      "personalizada",
    ];
    if (!valid.includes(value as FrequenciaHabitoValue)) {
      throw new Error(`Invalid frequency: "${value}"`);
    }
    return new FrequenciaHabito(value as FrequenciaHabitoValue);
  }

  toString(): FrequenciaHabitoValue {
    return this.value;
  }

  equals(other: FrequenciaHabito): boolean {
    return this.value === other.value;
  }

  requiresDiasSemana(): boolean {
    return this.value === "semanal" || this.value === "personalizada";
  }
}
