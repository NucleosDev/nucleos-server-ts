// src/domain/entities/NucleoIcon.ts
import { v4 as uuidv4 } from "uuid";
import { Nucleo } from "./Nucleo";

export interface NucleoIconProps {
  id?: string;
  name?: string;
  iconUrl: string;
  createdAt?: Date;
}

export class NucleoIcon {
  private _nucleos: Nucleo[] = [];

  private constructor(
    private readonly _id: string,
    private _name: string | null,
    private _iconUrl: string,
    private readonly _createdAt: Date,
  ) {}

  static create(props: NucleoIconProps): NucleoIcon {
    if (!props.iconUrl || props.iconUrl.trim().length === 0) {
      throw new Error("IconUrl é obrigatório");
    }

    return new NucleoIcon(
      props.id || uuidv4(),
      props.name || null,
      props.iconUrl,
      props.createdAt || new Date(),
    );
  }

  static reconstitute(props: Required<NucleoIconProps>): NucleoIcon {
    return new NucleoIcon(
      props.id!,
      props.name || null,
      props.iconUrl,
      props.createdAt!,
    );
  }

  get id(): string {
    return this._id;
  }
  get name(): string | null {
    return this._name;
  }
  get iconUrl(): string {
    return this._iconUrl;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get nucleos(): readonly Nucleo[] {
    return this._nucleos;
  }

  updateName(name: string | null): void {
    this._name = name;
  }

  updateIconUrl(url: string): void {
    if (!url || url.trim().length === 0) {
      throw new Error("IconUrl é obrigatório");
    }
    this._iconUrl = url;
  }

  addNucleo(nucleo: Nucleo): void {
    this._nucleos.push(nucleo);
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      iconUrl: this._iconUrl,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
