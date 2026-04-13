import { v4 as uuidv4 } from "uuid";

export interface ItemProps {
  id?: string;
  colecaoId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Item {
  private constructor(
    private readonly _id: string,
    private readonly _colecaoId: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: ItemProps): Item {
    return new Item(
      props.id || uuidv4(),
      props.colecaoId,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  static reconstitute(props: Required<ItemProps>): Item {
    return new Item(
      props.id!,
      props.colecaoId,
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
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      colecaoId: this._colecaoId,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
