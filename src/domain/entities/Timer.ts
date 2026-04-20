import { v4 as uuidv4 } from "uuid";

export type TimerModo = "crescente" | "decrescente";

export interface TimerProps {
  id?: string;
  nucleoId: string;
  titulo: string;
  inicio?: Date;
  fim?: Date | null;
  duracaoSegundos?: number | null;
  modo?: TimerModo;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Timer {
  private constructor(
    private readonly _id: string,
    private readonly _nucleoId: string,
    private readonly _titulo: string,
    private readonly _inicio: Date,
    private _fim: Date | null,
    private _duracaoSegundos: number | null,
    private readonly _modo: TimerModo,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: TimerProps): Timer {
    if (!props.titulo || props.titulo.trim().length < 1) {
      throw new Error("Título é obrigatório");
    }

    return new Timer(
      props.id || uuidv4(),
      props.nucleoId,
      props.titulo.trim(),
      props.inicio || new Date(),
      props.fim || null,
      props.duracaoSegundos || null,
      props.modo || "crescente",
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  static reconstitute(props: Required<TimerProps>): Timer {
    return new Timer(
      props.id!,
      props.nucleoId,
      props.titulo,
      props.inicio!,
      props.fim || null,
      props.duracaoSegundos || null,
      props.modo || "crescente",
      props.createdAt!,
      props.updatedAt!,
    );
  }

  get id(): string { return this._id; }
  get nucleoId(): string { return this._nucleoId; }
  get titulo(): string { return this._titulo; }
  get inicio(): Date { return this._inicio; }
  get fim(): Date | null { return this._fim; }
  get duracaoSegundos(): number | null { return this._duracaoSegundos; }
  get modo(): TimerModo { return this._modo; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get isRunning(): boolean { return this._fim === null; }

  stop(): void {
    if (this._fim !== null) {
      throw new Error("Timer já está parado");
    }
    this._fim = new Date();
    this._duracaoSegundos = Math.floor((this._fim.getTime() - this._inicio.getTime()) / 1000);
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      nucleoId: this._nucleoId,
      titulo: this._titulo,
      inicio: this._inicio.toISOString(),
      fim: this._fim?.toISOString() || null,
      duracaoSegundos: this._duracaoSegundos,
      modo: this._modo,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}