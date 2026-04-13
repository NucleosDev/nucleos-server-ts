// src/domain/entities/Subscription.ts
import { v4 as uuidv4 } from 'uuid';
import { Plan, PlanType } from './Plan';

export interface SubscriptionProps {
  id?: string;
  userId: string;
  planId: string;
  startedAt?: Date;
  expiresAt?: Date | null;
  isActive?: boolean;
  stripeSubscriptionId?: string | null;
  cancelAtPeriodEnd?: boolean;
}

export class Subscription {
  private _plan?: Plan;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _planId: string,
    private _startedAt: Date,
    private _expiresAt: Date | null,
    private _isActive: boolean,
    private _stripeSubscriptionId: string | null,
    private _cancelAtPeriodEnd: boolean
  ) {}

  static create(props: SubscriptionProps): Subscription {
    return new Subscription(
      props.id || uuidv4(),
      props.userId,
      props.planId,
      props.startedAt || new Date(),
      props.expiresAt || null,
      props.isActive !== undefined ? props.isActive : true,
      props.stripeSubscriptionId || null,
      props.cancelAtPeriodEnd || false
    );
  }

  static reconstitute(props: Required<SubscriptionProps> & { stripeSubscriptionId: string | null; cancelAtPeriodEnd: boolean }): Subscription {
    return new Subscription(
      props.id!,
      props.userId,
      props.planId,
      props.startedAt!,
      props.expiresAt || null,
      props.isActive!,
      props.stripeSubscriptionId || null,
      props.cancelAtPeriodEnd
    );
  }

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get planId(): string { return this._planId; }
  get startedAt(): Date { return this._startedAt; }
  get expiresAt(): Date | null { return this._expiresAt; }
  get isActive(): boolean { return this._isActive; }
  get stripeSubscriptionId(): string | null { return this._stripeSubscriptionId; }
  get cancelAtPeriodEnd(): boolean { return this._cancelAtPeriodEnd; }
  get plan(): Plan | undefined { return this._plan; }

  set plan(value: Plan | undefined) { this._plan = value; }

  get isExpired(): boolean {
    if (!this._expiresAt) return false;
    return this._expiresAt < new Date();
  }

  get isValid(): boolean {
    return this._isActive && !this.isExpired;
  }

  cancel(): void {
    this._isActive = false;
    this._cancelAtPeriodEnd = true;
  }

  cancelImmediately(): void {
    this._isActive = false;
    this._expiresAt = new Date();
  }

  renew(expiresAt?: Date): void {
    this._isActive = true;
    this._expiresAt = expiresAt || null;
    this._cancelAtPeriodEnd = false;
  }

  toJSON() {
    return {
      id: this._id,
      userId: this._userId,
      planId: this._planId,
      plan: this._plan?.toJSON(),
      startedAt: this._startedAt.toISOString(),
      expiresAt: this._expiresAt?.toISOString() || null,
      isActive: this._isActive,
      isValid: this.isValid,
      stripeSubscriptionId: this._stripeSubscriptionId,
      cancelAtPeriodEnd: this._cancelAtPeriodEnd
    };
  }
}