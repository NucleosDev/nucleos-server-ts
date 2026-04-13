// src/domain/entities/Lista.ts
import { v4 as uuidv4 } from "uuid";

export type TipoLista = "generica" | "compras" | "financeiro";

export interface ListaProps {
  id?: string;
  blocoId: string;
  nome: string;
  tipoLista?: TipoLista;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Lista {
  private constructor(
    private readonly _id: string,
    private readonly _blocoId: string,
    private _nome: string,
    private _tipoLista: TipoLista,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
  ) {}

  static create(props: ListaProps): Lista {
    if (!props.nome || props.nome.trim().length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }

    return new Lista(
      props.id || uuidv4(),
      props.blocoId,
      props.nome.trim(),
      props.tipoLista || "generica",
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
      props.deletedAt || null,
    );
  }

  static reconstitute(props: Required<ListaProps> & { id: string }): Lista {
    return new Lista(
      props.id,
      props.blocoId,
      props.nome,
      props.tipoLista || "generica",
      props.createdAt,
      props.updatedAt,
      props.deletedAt || null,
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
  get tipoLista(): TipoLista {
    return this._tipoLista;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }
  get isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  updateNome(nome: string): void {
    if (!nome || nome.trim().length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }
    this._nome = nome.trim();
    this.touch();
  }

  updateTipoLista(tipo: TipoLista): void {
    this._tipoLista = tipo;
    this.touch();
  }

  softDelete(): void {
    this._deletedAt = new Date();
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
      tipoLista: this._tipoLista,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      deletedAt: this._deletedAt?.toISOString() || null,
    };
  }
}
