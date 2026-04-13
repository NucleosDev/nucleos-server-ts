// src/domain/entities/NucleoCompartilhamento.ts
import { v4 as uuidv4 } from "uuid";
import { User } from "./User";
import { Nucleo } from "./Nucleo";

export type PermissionLevel = "view" | "edit" | "admin";

export interface NucleoCompartilhamentoProps {
  id?: string;
  nucleoId: string;
  ownerUserId: string;
  sharedWithUserId: string;
  permissionLevel?: PermissionLevel;
  createdAt?: Date;
  updatedAt?: Date;
}

export class NucleoCompartilhamento {
  private _owner?: User;
  private _sharedWith?: User;
  private _nucleo?: Nucleo;

  private constructor(
    private readonly _id: string,
    private readonly _nucleoId: string,
    private readonly _ownerUserId: string,
    private readonly _sharedWithUserId: string,
    private _permissionLevel: PermissionLevel,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: NucleoCompartilhamentoProps): NucleoCompartilhamento {
    return new NucleoCompartilhamento(
      props.id || uuidv4(),
      props.nucleoId,
      props.ownerUserId,
      props.sharedWithUserId,
      props.permissionLevel || "view",
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  static reconstitute(
    props: Required<NucleoCompartilhamentoProps>,
  ): NucleoCompartilhamento {
    return new NucleoCompartilhamento(
      props.id!,
      props.nucleoId,
      props.ownerUserId,
      props.sharedWithUserId,
      props.permissionLevel!,
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
  get ownerUserId(): string {
    return this._ownerUserId;
  }
  get sharedWithUserId(): string {
    return this._sharedWithUserId;
  }
  get permissionLevel(): PermissionLevel {
    return this._permissionLevel;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get owner(): User | undefined {
    return this._owner;
  }
  get sharedWith(): User | undefined {
    return this._sharedWith;
  }
  get nucleo(): Nucleo | undefined {
    return this._nucleo;
  }

  set owner(value: User | undefined) {
    this._owner = value;
  }
  set sharedWith(value: User | undefined) {
    this._sharedWith = value;
  }
  set nucleo(value: Nucleo | undefined) {
    this._nucleo = value;
  }

  updatePermission(level: PermissionLevel): void {
    this._permissionLevel = level;
    this._updatedAt = new Date();
  }

  canEdit(): boolean {
    return (
      this._permissionLevel === "edit" || this._permissionLevel === "admin"
    );
  }

  canAdmin(): boolean {
    return this._permissionLevel === "admin";
  }

  toJSON() {
    return {
      id: this._id,
      nucleoId: this._nucleoId,
      ownerUserId: this._ownerUserId,
      sharedWithUserId: this._sharedWithUserId,
      permissionLevel: this._permissionLevel,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
