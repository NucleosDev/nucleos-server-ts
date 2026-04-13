// src/domain/entities/Plan.ts
import { v4 as uuidv4 } from "uuid";

export type PlanType = "free" | "pro" | "enterprise";

export interface PlanProps {
  id?: string;
  name: PlanType;
  maxNucleos: number;
  maxBlocosPorNucleo?: number;
  maxMembrosPorNucleo?: number;
  price: number;
  priceId?: string; // ID do Stripe/Pagarme
  features?: Record<string, any>;
  createdAt?: Date;
}

export class Plan {
  private constructor(
    private readonly _id: string,
    private _name: PlanType,
    private _maxNucleos: number,
    private _maxBlocosPorNucleo: number,
    private _maxMembrosPorNucleo: number,
    private _price: number,
    private _priceId: string | null,
    private _features: Record<string, any>,
    private readonly _createdAt: Date,
  ) {}

  static create(props: PlanProps): Plan {
    return new Plan(
      props.id || uuidv4(),
      props.name,
      props.maxNucleos,
      props.maxBlocosPorNucleo || 10,
      props.maxMembrosPorNucleo || 5,
      props.price,
      props.priceId || null,
      props.features || {},
      props.createdAt || new Date(),
    );
  }

  static reconstitute(
    props: Required<PlanProps> & {
      maxBlocosPorNucleo: number;
      maxMembrosPorNucleo: number;
      priceId: string | null;
      features: Record<string, any>;
    },
  ): Plan {
    return new Plan(
      props.id!,
      props.name,
      props.maxNucleos,
      props.maxBlocosPorNucleo,
      props.maxMembrosPorNucleo,
      props.price,
      props.priceId || null,
      props.features || {},
      props.createdAt!,
    );
  }

  get id(): string {
    return this._id;
  }
  get name(): PlanType {
    return this._name;
  }
  get maxNucleos(): number {
    return this._maxNucleos;
  }
  get maxBlocosPorNucleo(): number {
    return this._maxBlocosPorNucleo;
  }
  get maxMembrosPorNucleo(): number {
    return this._maxMembrosPorNucleo;
  }
  get price(): number {
    return this._price;
  }
  get priceId(): string | null {
    return this._priceId;
  }
  get features(): Record<string, any> {
    return this._features;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get isFree(): boolean {
    return this._name === "free";
  }
  get isPro(): boolean {
    return this._name === "pro";
  }
  get isEnterprise(): boolean {
    return this._name === "enterprise";
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      maxNucleos: this._maxNucleos,
      maxBlocosPorNucleo: this._maxBlocosPorNucleo,
      maxMembrosPorNucleo: this._maxMembrosPorNucleo,
      price: this._price,
      priceId: this._priceId,
      features: this._features,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
