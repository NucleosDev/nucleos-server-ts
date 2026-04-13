import { v4 as uuidv4 } from "uuid";
import { TipoBloco } from "../value-objects/TipoBloco";

export interface BlocoProps {
  id?: string;
  nucleoId: string;
  tipo: TipoBloco;
  titulo?: string | null;
  posicao: number;
  configuracoes?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Bloco {
  private constructor(
    private readonly _id: string,
    private readonly _nucleoId: string,
    private _tipo: TipoBloco,
    private _titulo: string | null,
    private _posicao: number,
    private _configuracoes: Record<string, any>,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
  ) {}

  static create(props: BlocoProps): Bloco {
    if (!props.nucleoId) {
      throw new Error("NucleoId é obrigatório");
    }

    return new Bloco(
      props.id || uuidv4(),
      props.nucleoId,
      props.tipo,
      props.titulo || null,
      props.posicao ?? 0,
      props.configuracoes || {},
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
      props.deletedAt || null,
    );
  }

  static reconstitute(props: Required<BlocoProps>): Bloco {
    return new Bloco(
      props.id!,
      props.nucleoId,
      props.tipo,
      props.titulo || null,
      props.posicao,
      props.configuracoes || {},
      props.createdAt!,
      props.updatedAt!,
      props.deletedAt || null,
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get nucleoId(): string {
    return this._nucleoId;
  }
  get tipo(): TipoBloco {
    return this._tipo;
  }
  get titulo(): string | null {
    return this._titulo;
  }
  get posicao(): number {
    return this._posicao;
  }
  get configuracoes(): Record<string, any> {
    return this._configuracoes;
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

  // Métodos de domínio
  updateTitulo(titulo: string | null): void {
    this._titulo = titulo;
    this.touch();
  }

  updateTipo(tipo: TipoBloco): void {
    this._tipo = tipo;
    this.touch();
  }

  updatePosicao(posicao: number): void {
    this._posicao = posicao;
    this.touch();
  }

  updateConfiguracoes(configuracoes: Record<string, any>): void {
    this._configuracoes = { ...this._configuracoes, ...configuracoes };
    this.touch();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.touch();
  }

  restore(): void {
    this._deletedAt = null;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      nucleoId: this._nucleoId,
      tipo: this._tipo,
      titulo: this._titulo,
      posicao: this._posicao,
      configuracoes: this._configuracoes,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      deletedAt: this._deletedAt?.toISOString() || null,
    };
  }
}
