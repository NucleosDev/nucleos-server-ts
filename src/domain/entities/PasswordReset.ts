import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export interface PasswordResetProps {
  id?: string;
  userId: string;
  token?: string;
  expiresAt?: Date;
  usedAt?: Date | null;
  createdAt?: Date;
}

export class PasswordReset {
  readonly id: string;
  readonly userId: string;
  readonly token: string;
  readonly expiresAt: Date;
  usedAt: Date | null;
  readonly createdAt: Date;

  constructor(props: PasswordResetProps) {
    this.id = props.id ?? uuidv4();
    this.userId = props.userId;
    this.token = props.token ?? crypto.randomBytes(32).toString("hex");
    this.expiresAt = props.expiresAt ?? new Date(Date.now() + 3600 * 1000);
    this.usedAt = props.usedAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }

  isValid(): boolean {
    return this.usedAt === null && this.expiresAt > new Date();
  }

  markAsUsed(): void {
    this.usedAt = new Date();
  }
}
