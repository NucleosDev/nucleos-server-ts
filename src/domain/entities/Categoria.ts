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
    return new Categoria(
      props.id || uuidv4(),
      props.listaId,
      props.nome,
      props.cor || null,
      props.createdAt || new Date(),
    );
  }

  static reconstitute(
    props: Required<CategoriaProps> & { id: string },
  ): Categoria {
    return new Categoria(
      props.id,
      props.listaId,
      props.nome,
      props.cor || null,
      props.createdAt,
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
    this._nome = nome;
  }
  updateCor(cor: string | null): void {
    this._cor = cor;
  }
}
