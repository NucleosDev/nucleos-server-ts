import { v4 as uuidv4 } from "uuid";

export type TipoMeta = "quantidade" | "tempo" | "habito" | "tarefa";

export interface MetaProps {
  id?: string;
  nucleoId: string;
  titulo: string;
  descricao?: string | null;
  tipo: TipoMeta;
  valorMeta: number;
  valorAtual?: number;
  dataInicio?: Date | null;
  dataFim?: Date | null;
  concluida?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Meta {
  private constructor(
    private readonly _id: string,
    private readonly _nucleoId: string,
    private _titulo: string,
    private _descricao: string | null,
    private _tipo: TipoMeta,
    private _valorMeta: number,
    private _valorAtual: number,
    private _dataInicio: Date | null,
    private _dataFim: Date | null,
    private _concluida: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: MetaProps): Meta {
    if (!props.titulo || props.titulo.trim().length < 3) {
      throw new Error("Título deve ter pelo menos 3 caracteres");
    }
    if (props.valorMeta <= 0) {
      throw new Error("Valor da meta deve ser maior que zero");
    }

    return new Meta(
      props.id || uuidv4(),
      props.nucleoId,
      props.titulo.trim(),
      props.descricao || null,
      props.tipo,
      props.valorMeta,
      props.valorAtual || 0,
      props.dataInicio || null,
      props.dataFim || null,
      props.concluida || false,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  static reconstitute(props: Required<MetaProps>): Meta {
    return new Meta(
      props.id!,
      props.nucleoId,
      props.titulo,
      props.descricao || null,
      props.tipo,
      props.valorMeta,
      props.valorAtual!,
      props.dataInicio || null,
      props.dataFim || null,
      props.concluida!,
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
  get tipo(): TipoMeta {
    return this._tipo;
  }
  get valorMeta(): number {
    return this._valorMeta;
  }
  get valorAtual(): number {
    return this._valorAtual;
  }
  get dataInicio(): Date | null {
    return this._dataInicio;
  }
  get dataFim(): Date | null {
    return this._dataFim;
  }
  get concluida(): boolean {
    return this._concluida;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get progresso(): number {
    return Math.min(
      Math.round((this._valorAtual / this._valorMeta) * 100),
      100,
    );
  }
  get estaAtrasada(): boolean {
    if (this._concluida) return false;
    if (!this._dataFim) return false;
    return this._dataFim < new Date();
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

  updateValorMeta(valor: number): void {
    if (valor <= 0) {
      throw new Error("Valor da meta deve ser maior que zero");
    }
    this._valorMeta = valor;
    this.touch();
  }

  adicionarProgresso(valor: number): void {
    if (this._concluida) {
      throw new Error("Meta já está concluída");
    }
    this._valorAtual = Math.min(this._valorAtual + valor, this._valorMeta);
    if (this._valorAtual >= this._valorMeta) {
      this._concluida = true;
    }
    this.touch();
  }

  setProgresso(valor: number): void {
    if (this._concluida) {
      throw new Error("Meta já está concluída");
    }
    this._valorAtual = Math.min(Math.max(valor, 0), this._valorMeta);
    if (this._valorAtual >= this._valorMeta) {
      this._concluida = true;
    }
    this.touch();
  }

  concluir(): void {
    if (this._concluida) {
      throw new Error("Meta já está concluída");
    }
    this._concluida = true;
    this._valorAtual = this._valorMeta;
    this.touch();
  }

  reabrir(): void {
    if (!this._concluida) {
      throw new Error("Meta não está concluída");
    }
    this._concluida = false;
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
      tipo: this._tipo,
      valorMeta: this._valorMeta,
      valorAtual: this._valorAtual,
      progresso: this.progresso,
      dataInicio: this._dataInicio?.toISOString() || null,
      dataFim: this._dataFim?.toISOString() || null,
      estaAtrasada: this.estaAtrasada,
      concluida: this._concluida,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
