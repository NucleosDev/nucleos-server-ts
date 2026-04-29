// src/domain/entities/Bloco.ts
import { v4 as uuidv4 } from "uuid";
import { TipoBloco } from "../value-objects/TipoBloco";

export interface BlocoProps {
  id?: string;
  nucleoId: string;
  tipo: TipoBloco;
  titulo?: string | null;
  posicao: number;
  configuracoes?: Record<string, any>;
  // NOVOS CAMPOS
  parentId?: string | null;
  path?: string | null;
  depth?: number;
  isCanvas?: boolean;
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
    // NOVOS CAMPOS
    private _parentId: string | null,
    private _path: string | null,
    private _depth: number,
    private _isCanvas: boolean,
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
      props.parentId || null,
      props.path || null,
      props.depth ?? 0,
      props.isCanvas ?? false,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
      props.deletedAt || null,
    );
  }

  static reconstitute(
    props: Required<BlocoProps> & {
      parentId?: string | null;
      path?: string | null;
      depth?: number;
      isCanvas?: boolean;
    },
  ): Bloco {
    return new Bloco(
      props.id!,
      props.nucleoId,
      props.tipo,
      props.titulo || null,
      props.posicao,
      props.configuracoes || {},
      props.parentId || null,
      props.path || null,
      props.depth ?? 0,
      props.isCanvas ?? false,
      props.createdAt!,
      props.updatedAt!,
      props.deletedAt || null,
    );
  }

  // Getters existentes
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

  // NOVOS GETTERS
  get parentId(): string | null {
    return this._parentId;
  }
  get path(): string | null {
    return this._path;
  }
  get depth(): number {
    return this._depth;
  }
  get isCanvas(): boolean {
    return this._isCanvas;
  }
  get isRoot(): boolean {
    return this._parentId === null;
  }

  // Métodos de domínio existentes
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

  // NOVOS MÉTODOS DE DOMÍNIO
  moveToParent(parentId: string | null): void {
    this._parentId = parentId;
    this.touch();
  }

  markAsCanvas(): void {
    this._isCanvas = true;
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
      parentId: this._parentId,
      path: this._path,
      depth: this._depth,
      isCanvas: this._isCanvas,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      deletedAt: this._deletedAt?.toISOString() || null,
    };
  }
}
