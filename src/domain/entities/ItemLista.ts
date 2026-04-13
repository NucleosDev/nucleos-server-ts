import { v4 as uuidv4 } from "uuid";

export interface ItemListaProps {
  id?: string;
  listaId: string;
  categoriaId?: string | null;
  nome: string;
  quantidade?: number;
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
    if (!props.nome || props.nome.trim().length < 1) {
      throw new Error("Nome do item é obrigatório");
    }

    return new ItemLista(
      props.id || uuidv4(),
      props.listaId,
      props.categoriaId || null,
      props.nome.trim(),
      props.quantidade ?? 1,
      props.valorUnitario ?? null,
      props.checked ?? false,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
      props.deletedAt || null,
    );
  }

  static reconstitute(props: Required<ItemListaProps>): ItemLista {
    return new ItemLista(
      props.id!,
      props.listaId,
      props.categoriaId || null,
      props.nome,
      props.quantidade!,
      props.valorUnitario ?? null,
      props.checked!,
      props.createdAt!,
      props.updatedAt!,
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
  get valorTotal(): number | null {
    if (this._valorUnitario === null) return null;
    return this._quantidade * this._valorUnitario;
  }
  get isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  updateNome(nome: string): void {
    if (!nome || nome.trim().length < 1) {
      throw new Error("Nome do item é obrigatório");
    }
    this._nome = nome.trim();
    this.touch();
  }

  updateQuantidade(quantidade: number): void {
    if (quantidade < 0) {
      throw new Error("Quantidade não pode ser negativa");
    }
    this._quantidade = quantidade;
    this.touch();
  }

  updateValorUnitario(valor: number | null): void {
    this._valorUnitario = valor;
    this.touch();
  }

  toggleChecked(): void {
    this._checked = !this._checked;
    this.touch();
  }

  setChecked(checked: boolean): void {
    this._checked = checked;
    this.touch();
  }

  updateCategoria(categoriaId: string | null): void {
    this._categoriaId = categoriaId;
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
      listaId: this._listaId,
      categoriaId: this._categoriaId,
      nome: this._nome,
      quantidade: this._quantidade,
      valorUnitario: this._valorUnitario,
      valorTotal: this.valorTotal,
      checked: this._checked,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      deletedAt: this._deletedAt?.toISOString() || null,
    };
  }
}
