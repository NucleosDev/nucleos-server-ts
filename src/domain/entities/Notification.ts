import { v4 as uuidv4 } from "uuid";

export type NotificationChannel = "in_app" | "email" | "push";
export type NotificationType =
  | "achievement"
  | "reminder"
  | "system"
  | "social"
  | "gamification";

export interface NotificationProps {
  id?: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  channel?: NotificationChannel;
  read?: boolean;
  data?: Record<string, unknown>;
  createdAt?: Date;
}

export class Notification {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly body: string;
  readonly type: NotificationType;
  readonly channel: NotificationChannel;
  read: boolean;
  readonly data: Record<string, unknown>;
  readonly createdAt: Date;

  constructor(props: NotificationProps) {
    this.id = props.id ?? uuidv4();
    this.userId = props.userId;
    this.title = props.title;
    this.body = props.body;
    this.type = props.type;
    this.channel = props.channel ?? "in_app";
    this.read = props.read ?? false;
    this.data = props.data ?? {};
    this.createdAt = props.createdAt ?? new Date();
  }

  markAsRead(): void {
    this.read = true;
  }
}
