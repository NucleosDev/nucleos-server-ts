import { v4 as uuidv4 } from "uuid";

export type ActivityAction =
  | "task_created"
  | "task_completed"
  | "habit_registered"
  | "nucleo_created"
  | "login"
  | "level_up"
  | "achievement_earned";

export interface ActivityLogProps {
  id?: string;
  userId: string;
  action: ActivityAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export class ActivityLog {
  readonly id: string;
  readonly userId: string;
  readonly action: ActivityAction;
  readonly entityType: string | null;
  readonly entityId: string | null;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: Date;

  constructor(props: ActivityLogProps) {
    this.id = props.id ?? uuidv4();
    this.userId = props.userId;
    this.action = props.action;
    this.entityType = props.entityType ?? null;
    this.entityId = props.entityId ?? null;
    this.metadata = props.metadata ?? {};
    this.createdAt = props.createdAt ?? new Date();
  }
}
