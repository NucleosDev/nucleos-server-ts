// src/domain/entities/CalendarioEvento.ts
import { v4 as uuidv4 } from "uuid";
import { BaseEntity } from "./base.entity";

export interface CalendarioEventoProps {
  id?: string;
  nucleoId: string;
  titulo: string;
  descricao?: string | null;
  dataEvento: Date;
  duracaoMinutos?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CalendarioEvento extends BaseEntity {
  private constructor(
    id: string,
    private _nucleoId: string,
    private _titulo: string,
    private _descricao: string | null,
    private _dataEvento: Date,
    private _duracaoMinutos: number | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(props: CalendarioEventoProps): CalendarioEvento {
    if (!props.titulo || props.titulo.trim().length === 0) {
      throw new Error("Título é obrigatório");
    }
    if (!props.dataEvento) {
      throw new Error("Data do evento é obrigatória");
    }
    return new CalendarioEvento(
      props.id || uuidv4(),
      props.nucleoId,
      props.titulo.trim(),
      props.descricao?.trim() || null,
      props.dataEvento,
      props.duracaoMinutos ?? null,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  static reconstitute(data: any): CalendarioEvento {
    return new CalendarioEvento(
      data.id,
      data.nucleo_id,
      data.titulo,
      data.descricao,
      new Date(data.data_evento),
      data.duracao_minutos,
      new Date(data.created_at),
      new Date(data.updated_at),
    );
  }

  // Getters
  get nucleoId(): string {
    return this._nucleoId;
  }
  get titulo(): string {
    return this._titulo;
  }
  get descricao(): string | null {
    return this._descricao;
  }
  get dataEvento(): Date {
    return this._dataEvento;
  }
  get duracaoMinutos(): number | null {
    return this._duracaoMinutos;
  }

  // Métodos de domínio
  updateTitulo(titulo: string): void {
    if (!titulo || titulo.trim().length === 0) {
      throw new Error("Título é obrigatório");
    }
    this._titulo = titulo.trim();
    this.updatedAt = new Date();
  }

  updateDescricao(descricao: string | null): void {
    this._descricao = descricao?.trim() || null;
    this.updatedAt = new Date();
  }

  updateDataEvento(data: Date): void {
    if (!data) throw new Error("Data do evento é obrigatória");
    this._dataEvento = data;
    this.updatedAt = new Date();
  }

  updateDuracao(minutos: number | null): void {
    this._duracaoMinutos = minutos;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      nucleoId: this._nucleoId,
      titulo: this._titulo,
      descricao: this._descricao,
      dataEvento: this._dataEvento.toISOString(),
      duracaoMinutos: this._duracaoMinutos,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
