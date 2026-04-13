import { v4 as uuidv4 } from "uuid";

export interface ColecaoProps {
  id?: string;
  blocoId: string;
  nome: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Colecao {
  private constructor(
    private readonly _id: string,
    private readonly _blocoId: string,
    private _nome: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: ColecaoProps): Colecao {
    if (!props.nome || props.nome.trim().length < 1) {
      throw new Error("Nome da coleção é obrigatório");
    }

    return new Colecao(
      props.id || uuidv4(),
      props.blocoId,
      props.nome.trim(),
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  static reconstitute(props: Required<ColecaoProps>): Colecao {
    return new Colecao(
      props.id!,
      props.blocoId,
      props.nome,
      props.createdAt!,
      props.updatedAt!,
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
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateNome(nome: string): void {
    if (!nome || nome.trim().length < 1) {
      throw new Error("Nome da coleção é obrigatório");
    }
    this._nome = nome.trim();
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
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
