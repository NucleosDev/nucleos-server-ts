import { v4 as uuidv4 } from "uuid";

export interface CategoriaProps {
  id?: string;
  listaId: string;
  nome: string;
  cor?: string | null;
  createdAt?: Date;
}

export class Categoria {
  private constructor(
    private readonly _id: string,
    private readonly _listaId: string,
    private _nome: string,
    private _cor: string | null,
    private readonly _createdAt: Date,
  ) {}

  static create(props: CategoriaProps): Categoria {
    if (!props.nome || props.nome.trim().length < 1) {
      throw new Error("Nome da categoria é obrigatório");
    }

    return new Categoria(
      props.id || uuidv4(),
      props.listaId,
      props.nome.trim(),
      props.cor || null,
      props.createdAt || new Date(),
    );
  }

  static reconstitute(props: Required<CategoriaProps>): Categoria {
    return new Categoria(
      props.id!,
      props.listaId,
      props.nome,
      props.cor || null,
      props.createdAt!,
    );
  }

  get id(): string {
    return this._id;
  }
  get listaId(): string {
    return this._listaId;
  }
  get nome(): string {
    return this._nome;
  }
  get cor(): string | null {
    return this._cor;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  updateNome(nome: string): void {
    if (!nome || nome.trim().length < 1) {
      throw new Error("Nome da categoria é obrigatório");
    }
    this._nome = nome.trim();
  }

  updateCor(cor: string | null): void {
    this._cor = cor;
  }

  toJSON() {
    return {
      id: this._id,
      listaId: this._listaId,
      nome: this._nome,
      cor: this._cor,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
