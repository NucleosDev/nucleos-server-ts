// src/domain/entities/NucleoAchievement.ts
import { v4 as uuidv4 } from "uuid";
import { Nucleo } from "./Nucleo";

export interface NucleoAchievementProps {
  id?: string;
  nucleoId: string;
  achievementType: string;
  currentValue?: number;
  targetValue: number;
  unlockedAt?: Date | null;
  createdAt?: Date;
}

export class NucleoAchievement {
  private constructor(
    private readonly _id: string,
    private readonly _nucleoId: string,
    private _achievementType: string,
    private _currentValue: number,
    private _targetValue: number,
    private _unlockedAt: Date | null,
    private readonly _createdAt: Date,
  ) {}

  static create(props: NucleoAchievementProps): NucleoAchievement {
    return new NucleoAchievement(
      props.id || uuidv4(),
      props.nucleoId,
      props.achievementType,
      props.currentValue ?? 0,
      props.targetValue,
      props.unlockedAt || null,
      props.createdAt || new Date(),
    );
  }

  static reconstitute(
    props: Required<NucleoAchievementProps>,
  ): NucleoAchievement {
    return new NucleoAchievement(
      props.id!,
      props.nucleoId,
      props.achievementType,
      props.currentValue!,
      props.targetValue,
      props.unlockedAt || null,
      props.createdAt!,
    );
  }

  get id(): string {
    return this._id;
  }
  get nucleoId(): string {
    return this._nucleoId;
  }
  get achievementType(): string {
    return this._achievementType;
  }
  get currentValue(): number {
    return this._currentValue;
  }
  get targetValue(): number {
    return this._targetValue;
  }
  get unlockedAt(): Date | null {
    return this._unlockedAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get isUnlocked(): boolean {
    return this._unlockedAt !== null;
  }
  get progress(): number {
    return Math.min(
      Math.round((this._currentValue / this._targetValue) * 100),
      100,
    );
  }

  incrementValue(amount: number = 1): void {
    this._currentValue += amount;
    if (this._currentValue >= this._targetValue && !this._unlockedAt) {
      this._unlockedAt = new Date();
    }
  }

  setValue(value: number): void {
    this._currentValue = Math.min(value, this._targetValue);
    if (this._currentValue >= this._targetValue && !this._unlockedAt) {
      this._unlockedAt = new Date();
    }
  }

  toJSON() {
    return {
      id: this._id,
      nucleoId: this._nucleoId,
      achievementType: this._achievementType,
      currentValue: this._currentValue,
      targetValue: this._targetValue,
      unlockedAt: this._unlockedAt?.toISOString() || null,
      createdAt: this._createdAt.toISOString(),
      progress: this.progress,
      isUnlocked: this.isUnlocked,
    };
  }
}
