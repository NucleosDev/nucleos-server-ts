// src/domain/entities/Tarefa.ts
import { v4 as uuidv4 } from "uuid";

export type PrioridadeTarefa = "baixa" | "media" | "alta";
export type StatusTarefa = "pendente" | "concluida" | "atrasada";

export interface TarefaProps {
  id?: string;
  blocoId: string;
  titulo: string;
  descricao?: string | null;
  prioridade: PrioridadeTarefa;
  status?: StatusTarefa; // ← TORNAR OPCIONAL
  dataVencimento?: Date | null;
  concluidaEm?: Date | null;
  posicao: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Tarefa {
  private constructor(
    private readonly _id: string,
    private readonly _blocoId: string,
    private _titulo: string,
    private _descricao: string | null,
    private _prioridade: PrioridadeTarefa,
    private _status: StatusTarefa,
    private _dataVencimento: Date | null,
    private _concluidaEm: Date | null,
    private _posicao: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
  ) {}

  static create(props: TarefaProps): Tarefa {
    if (!props.titulo || props.titulo.trim().length < 3) {
      throw new Error("Título deve ter pelo menos 3 caracteres");
    }

    return new Tarefa(
      props.id || uuidv4(),
      props.blocoId,
      props.titulo.trim(),
      props.descricao || null,
      props.prioridade,
      props.status || "pendente", // ← VALOR PADRÃO
      props.dataVencimento || null,
      props.concluidaEm || null,
      props.posicao,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
      props.deletedAt || null,
    );
  }

  static reconstitute(props: Required<TarefaProps>): Tarefa {
    return new Tarefa(
      props.id!,
      props.blocoId,
      props.titulo,
      props.descricao || null,
      props.prioridade,
      props.status!,
      props.dataVencimento || null,
      props.concluidaEm || null,
      props.posicao,
      props.createdAt!,
      props.updatedAt!,
      props.deletedAt || null,
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get blocoId(): string {
    return this._blocoId;
  }
  get titulo(): string {
    return this._titulo;
  }
  get descricao(): string | null {
    return this._descricao;
  }
  get prioridade(): PrioridadeTarefa {
    return this._prioridade;
  }
  get status(): StatusTarefa {
    return this._status;
  }
  get dataVencimento(): Date | null {
    return this._dataVencimento;
  }
  get concluidaEm(): Date | null {
    return this._concluidaEm;
  }
  get posicao(): number {
    return this._posicao;
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
  get isConcluida(): boolean {
    return this._status === "concluida";
  }
  get isAtrasada(): boolean {
    return (
      this._status !== "concluida" &&
      this._dataVencimento !== null &&
      this._dataVencimento < new Date()
    );
  }

  // Métodos de domínio
  updateTitulo(titulo: string): void {
    if (!titulo || titulo.trim().length < 3) {
      throw new Error("Título deve ter pelo menos 3 caracteres");
    }
    this._titulo = titulo.trim();
    this.touch();
  }

  updateDescricao(descricao: string | null): void {
    this._descricao = descricao;
    this.touch();
  }

  updatePrioridade(prioridade: PrioridadeTarefa): void {
    this._prioridade = prioridade;
    this.touch();
  }

  updateDataVencimento(data: Date | null): void {
    this._dataVencimento = data;
    this.touch();
  }

  updatePosicao(posicao: number): void {
    this._posicao = posicao;
    this.touch();
  }

  concluir(): void {
    if (this._status === "concluida") {
      throw new Error("Tarefa já está concluída");
    }
    this._status = "concluida";
    this._concluidaEm = new Date();
    this.touch();
  }

  reabrir(): void {
    if (this._status !== "concluida") {
      throw new Error("Apenas tarefas concluídas podem ser reabertas");
    }
    this._status = "pendente";
    this._concluidaEm = null;
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
      titulo: this._titulo,
      descricao: this._descricao,
      prioridade: this._prioridade,
      status: this._status,
      dataVencimento: this._dataVencimento?.toISOString() || null,
      concluidaEm: this._concluidaEm?.toISOString() || null,
      posicao: this._posicao,
      isAtrasada: this.isAtrasada,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      deletedAt: this._deletedAt?.toISOString() || null,
    };
  }
}
