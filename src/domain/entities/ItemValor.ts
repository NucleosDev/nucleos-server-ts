import { v4 as uuidv4 } from "uuid";

export interface ItemValorProps {
  id?: string;
  itemId: string;
  campoId: string;
  valorTexto?: string | null;
  valorNumerico?: number | null;
  valorData?: Date | null;
  valorBooleano?: boolean | null;
}

export class ItemValor {
  private constructor(
    private readonly _id: string,
    private readonly _itemId: string,
    private readonly _campoId: string,
    private _valorTexto: string | null,
    private _valorNumerico: number | null,
    private _valorData: Date | null,
    private _valorBooleano: boolean | null,
  ) {}

  static create(props: ItemValorProps): ItemValor {
    return new ItemValor(
      props.id || uuidv4(),
      props.itemId,
      props.campoId,
      props.valorTexto || null,
      props.valorNumerico ?? null,
      props.valorData || null,
      props.valorBooleano ?? null,
    );
  }

  static reconstitute(props: Required<ItemValorProps>): ItemValor {
    return new ItemValor(
      props.id!,
      props.itemId,
      props.campoId,
      props.valorTexto || null,
      props.valorNumerico ?? null,
      props.valorData || null,
      props.valorBooleano ?? null,
    );
  }

  get id(): string {
    return this._id;
  }
  get itemId(): string {
    return this._itemId;
  }
  get campoId(): string {
    return this._campoId;
  }
  get valorTexto(): string | null {
    return this._valorTexto;
  }
  get valorNumerico(): number | null {
    return this._valorNumerico;
  }
  get valorData(): Date | null {
    return this._valorData;
  }
  get valorBooleano(): boolean | null {
    return this._valorBooleano;
  }

  updateValorTexto(valor: string | null): void {
    this._valorTexto = valor;
  }

  updateValorNumerico(valor: number | null): void {
    this._valorNumerico = valor;
  }

  updateValorData(valor: Date | null): void {
    this._valorData = valor;
  }

  updateValorBooleano(valor: boolean | null): void {
    this._valorBooleano = valor;
  }

  toJSON() {
    return {
      id: this._id,
      itemId: this._itemId,
      campoId: this._campoId,
      valorTexto: this._valorTexto,
      valorNumerico: this._valorNumerico,
      valorData: this._valorData?.toISOString() || null,
      valorBooleano: this._valorBooleano,
    };
  }
}
