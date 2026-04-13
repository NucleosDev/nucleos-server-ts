import { v4 as uuidv4 } from "uuid";

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

export class CalendarioEvento {
  private constructor(
    private readonly _id: string,
    private readonly _nucleoId: string,
    private _titulo: string,
    private _descricao: string | null,
    private _dataEvento: Date,
    private _duracaoMinutos: number | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: CalendarioEventoProps): CalendarioEvento {
    if (!props.titulo || props.titulo.trim().length < 3) {
      throw new Error("Título deve ter pelo menos 3 caracteres");
    }
    if (!props.dataEvento) {
      throw new Error("Data do evento é obrigatória");
    }

    return new CalendarioEvento(
      props.id || uuidv4(),
      props.nucleoId,
      props.titulo.trim(),
      props.descricao || null,
      props.dataEvento,
      props.duracaoMinutos || null,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  static reconstitute(
    props: Required<CalendarioEventoProps>,
  ): CalendarioEvento {
    return new CalendarioEvento(
      props.id!,
      props.nucleoId,
      props.titulo,
      props.descricao || null,
      props.dataEvento,
      props.duracaoMinutos || null,
      props.createdAt!,
      props.updatedAt!,
    );
  }

  get id(): string {
    return this._id;
  }
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
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  get dataFim(): Date | null {
    if (!this._duracaoMinutos) return null;
    const fim = new Date(this._dataEvento);
    fim.setMinutes(fim.getMinutes() + this._duracaoMinutos);
    return fim;
  }

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

  updateDataEvento(data: Date): void {
    this._dataEvento = data;
    this.touch();
  }

  updateDuracao(duracao: number | null): void {
    this._duracaoMinutos = duracao;
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
      descricao: this._descricao,
      dataEvento: this._dataEvento.toISOString(),
      duracaoMinutos: this._duracaoMinutos,
      dataFim: this.dataFim?.toISOString() || null,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
