import { v4 as uuidv4 } from "uuid";
import { InsightType } from "../enums/InsightType.js";

export interface AIInsightProps {
  id?: string;
  userId: string;
  nucleoId?: string | null;
  type: InsightType;
  title: string;
  content: string;
  score?: number;
  read?: boolean;
  expiresAt?: Date | null;
  createdAt?: Date;
}

export class AIInsight {
  readonly id: string;
  readonly userId: string;
  readonly nucleoId: string | null;
  readonly type: InsightType;
  readonly title: string;
  readonly content: string;
  readonly score: number;
  read: boolean;
  readonly expiresAt: Date | null;
  readonly createdAt: Date;

  constructor(props: AIInsightProps) {
    this.id = props.id ?? uuidv4();
    this.userId = props.userId;
    this.nucleoId = props.nucleoId ?? null;
    this.type = props.type;
    this.title = props.title;
    this.content = props.content;
    this.score = props.score ?? 0;
    this.read = props.read ?? false;
    this.expiresAt = props.expiresAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }

  markAsRead(): void {
    this.read = true;
  }

  isExpired(): boolean {
    return this.expiresAt !== null && this.expiresAt < new Date();
  }
}
