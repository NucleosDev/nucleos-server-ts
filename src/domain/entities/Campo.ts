import { v4 as uuidv4 } from "uuid";

export type TipoCampo =
  | "texto"
  | "numero"
  | "data"
  | "booleano"
  | "select"
  | "arquivo"
  | "relacao";

export interface CampoProps {
  id?: string;
  colecaoId: string;
  nome: string;
  tipoCampo: TipoCampo;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Campo {
  private constructor(
    private readonly _id: string,
    private readonly _colecaoId: string,
    private _nome: string,
    private _tipoCampo: TipoCampo,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: CampoProps): Campo {
    if (!props.nome || props.nome.trim().length < 1) {
      throw new Error("Nome do campo é obrigatório");
    }
    if (!props.tipoCampo) {
      throw new Error("Tipo do campo é obrigatório");
    }

    return new Campo(
      props.id || uuidv4(),
      props.colecaoId,
      props.nome.trim(),
      props.tipoCampo,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  static reconstitute(props: Required<CampoProps>): Campo {
    return new Campo(
      props.id!,
      props.colecaoId,
      props.nome,
      props.tipoCampo,
      props.createdAt!,
      props.updatedAt!,
    );
  }

  get id(): string {
    return this._id;
  }
  get colecaoId(): string {
    return this._colecaoId;
  }
  get nome(): string {
    return this._nome;
  }
  get tipoCampo(): TipoCampo {
    return this._tipoCampo;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateNome(nome: string): void {
    if (!nome || nome.trim().length < 1) {
      throw new Error("Nome do campo é obrigatório");
    }
    this._nome = nome.trim();
    this.touch();
  }

  updateTipoCampo(tipo: TipoCampo): void {
    this._tipoCampo = tipo;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      colecaoId: this._colecaoId,
      nome: this._nome,
      tipoCampo: this._tipoCampo,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
