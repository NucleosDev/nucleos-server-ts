// src/domain/entities/Habito.ts
import { v4 as uuidv4 } from "uuid";

export type FrequenciaHabito = "diaria" | "semanal" | "personalizada";

export interface HabitoProps {
  id?: string;
  blocoId: string;
  nome: string;
  frequencia: FrequenciaHabito;
  diasSemana?: number[] | null;
  metaVezes?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Habito {
  private constructor(
    private readonly _id: string,
    private readonly _blocoId: string,
    private _nome: string,
    private _frequencia: FrequenciaHabito,
    private _diasSemana: number[] | null,
    private _metaVezes: number | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: HabitoProps): Habito {
    if (!props.nome || props.nome.trim().length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }

    return new Habito(
      props.id || uuidv4(),
      props.blocoId,
      props.nome.trim(),
      props.frequencia || "diaria",
      props.diasSemana || null,
      props.metaVezes || 1,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  static reconstitute(props: Required<HabitoProps>): Habito {
    return new Habito(
      props.id!,
      props.blocoId,
      props.nome,
      props.frequencia,
      props.diasSemana || null,
      props.metaVezes || null,
      props.createdAt!,
      props.updatedAt!,
    );
  }

  get id(): string {
    return this._id;
  }
  get blocoId(): string {
    return this._blocoId;
  }
  get nome(): string {
    return this._nome;
  }
  get frequencia(): FrequenciaHabito {
    return this._frequencia;
  }
  get diasSemana(): number[] | null {
    return this._diasSemana;
  }
  get metaVezes(): number | null {
    return this._metaVezes;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateNome(nome: string): void {
    if (!nome || nome.trim().length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }
    this._nome = nome.trim();
    this.touch();
  }

  updateFrequencia(frequencia: FrequenciaHabito): void {
    this._frequencia = frequencia;
    this.touch();
  }

  updateDiasSemana(dias: number[] | null): void {
    this._diasSemana = dias;
    this.touch();
  }

  updateMetaVezes(meta: number | null): void {
    this._metaVezes = meta;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      blocoId: this._blocoId,
      nome: this._nome,
      frequencia: this._frequencia,
      diasSemana: this._diasSemana,
      metaVezes: this._metaVezes,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
