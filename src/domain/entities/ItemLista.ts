import { v4 as uuidv4 } from "uuid";

export interface ItemListaProps {
  id?: string;
  listaId: string;
  categoriaId?: string | null;
  nome: string;
  quantidade: number;
  valorUnitario?: number | null;
  checked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class ItemLista {
  private constructor(
    private readonly _id: string,
    private readonly _listaId: string,
    private _categoriaId: string | null,
    private _nome: string,
    private _quantidade: number,
    private _valorUnitario: number | null,
    private _checked: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
  ) {}

  static create(props: ItemListaProps): ItemLista {
    return new ItemLista(
      props.id || uuidv4(),
      props.listaId,
      props.categoriaId || null,
      props.nome,
      props.quantidade || 1,
      props.valorUnitario || null,
      props.checked || false,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
      props.deletedAt || null,
    );
  }

  static reconstitute(
    props: Required<ItemListaProps> & { id: string },
  ): ItemLista {
    return new ItemLista(
      props.id,
      props.listaId,
      props.categoriaId || null,
      props.nome,
      props.quantidade,
      props.valorUnitario || null,
      props.checked || false,
      props.createdAt,
      props.updatedAt,
      props.deletedAt || null,
    );
  }

  get id(): string {
    return this._id;
  }
  get listaId(): string {
    return this._listaId;
  }
  get categoriaId(): string | null {
    return this._categoriaId;
  }
  get nome(): string {
    return this._nome;
  }
  get quantidade(): number {
    return this._quantidade;
  }
  get valorUnitario(): number | null {
    return this._valorUnitario;
  }
  get valorTotal(): number | null {
    return this._valorUnitario ? this._quantidade * this._valorUnitario : null;
  }
  get checked(): boolean {
    return this._checked;
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

  updateNome(nome: string): void {
    this._nome = nome;
    this.touch();
  }
  updateQuantidade(quantidade: number): void {
    this._quantidade = quantidade;
    this.touch();
  }
  updateValorUnitario(valor: number | null): void {
    this._valorUnitario = valor;
    this.touch();
  }
  updateCategoria(categoriaId: string | null): void {
    this._categoriaId = categoriaId;
    this.touch();
  }
  toggleCheck(): void {
    this._checked = !this._checked;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
