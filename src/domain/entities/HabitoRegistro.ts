// src/domain/entities/HabitoRegistro.ts
import { v4 as uuidv4 } from "uuid";

export interface HabitoRegistroProps {
  id?: string;
  habitoId: string;
  data: Date;
  vezesCompletadas: number;
  createdAt?: Date;
}

export class HabitoRegistro {
  private constructor(
    private readonly _id: string,
    private readonly _habitoId: string,
    private _data: Date,
    private _vezesCompletadas: number,
    private readonly _createdAt: Date,
  ) {}

  static create(props: HabitoRegistroProps): HabitoRegistro {
    return new HabitoRegistro(
      props.id || uuidv4(),
      props.habitoId,
      props.data,
      props.vezesCompletadas,
      props.createdAt || new Date(),
    );
  }

  static reconstitute(props: Required<HabitoRegistroProps>): HabitoRegistro {
    return new HabitoRegistro(
      props.id!,
      props.habitoId,
      props.data,
      props.vezesCompletadas,
      props.createdAt!,
    );
  }

  get id(): string {
    return this._id;
  }
  get habitoId(): string {
    return this._habitoId;
  }
  get data(): Date {
    return this._data;
  }
  get vezesCompletadas(): number {
    return this._vezesCompletadas;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  incrementar(vezes: number = 1): void {
    this._vezesCompletadas += vezes;
  }

  toJSON() {
    return {
      id: this._id,
      habitoId: this._habitoId,
      data: this._data.toISOString(),
      vezesCompletadas: this._vezesCompletadas,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
