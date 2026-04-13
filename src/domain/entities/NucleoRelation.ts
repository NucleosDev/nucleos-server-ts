// src/domain/entities/NucleoRelation.ts
import { v4 as uuidv4 } from "uuid";
import { Nucleo } from "./Nucleo";

export type RelationType =
  | "parent"
  | "child"
  | "related"
  | "depends_on"
  | "blocks";

export interface NucleoRelationProps {
  id?: string;
  sourceNucleoId: string;
  targetNucleoId: string;
  relationType: string;
  createdAt?: Date;
}

export class NucleoRelation {
  private _source?: Nucleo;
  private _target?: Nucleo;

  private constructor(
    private readonly _id: string,
    private readonly _sourceNucleoId: string,
    private readonly _targetNucleoId: string,
    private _relationType: string,
    private readonly _createdAt: Date,
  ) {}

  static create(props: NucleoRelationProps): NucleoRelation {
    if (!props.relationType || props.relationType.trim().length === 0) {
      throw new Error("RelationType é obrigatório");
    }

    return new NucleoRelation(
      props.id || uuidv4(),
      props.sourceNucleoId,
      props.targetNucleoId,
      props.relationType,
      props.createdAt || new Date(),
    );
  }

  static reconstitute(props: Required<NucleoRelationProps>): NucleoRelation {
    return new NucleoRelation(
      props.id!,
      props.sourceNucleoId,
      props.targetNucleoId,
      props.relationType,
      props.createdAt!,
    );
  }

  get id(): string {
    return this._id;
  }
  get sourceNucleoId(): string {
    return this._sourceNucleoId;
  }
  get targetNucleoId(): string {
    return this._targetNucleoId;
  }
  get relationType(): string {
    return this._relationType;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get source(): Nucleo | undefined {
    return this._source;
  }
  get target(): Nucleo | undefined {
    return this._target;
  }

  set source(value: Nucleo | undefined) {
    this._source = value;
  }
  set target(value: Nucleo | undefined) {
    this._target = value;
  }

  updateRelationType(type: string): void {
    if (!type || type.trim().length === 0) {
      throw new Error("RelationType é obrigatório");
    }
    this._relationType = type;
  }

  toJSON() {
    return {
      id: this._id,
      sourceNucleoId: this._sourceNucleoId,
      targetNucleoId: this._targetNucleoId,
      relationType: this._relationType,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
