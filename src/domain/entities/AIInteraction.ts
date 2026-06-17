import { v4 as uuidv4 } from "uuid";

export type AIRole = "user" | "assistant";

export interface AIInteractionProps {
  id?: string;
  userId: string;
  sessionId: string;
  role: AIRole;
  content: string;
  tokens?: number;
  createdAt?: Date;
}

export class AIInteraction {
  readonly id: string;
  readonly userId: string;
  readonly sessionId: string;
  readonly role: AIRole;
  readonly content: string;
  readonly tokens: number;
  readonly createdAt: Date;

  constructor(props: AIInteractionProps) {
    this.id = props.id ?? uuidv4();
    this.userId = props.userId;
    this.sessionId = props.sessionId;
    this.role = props.role;
    this.content = props.content;
    this.tokens = props.tokens ?? 0;
    this.createdAt = props.createdAt ?? new Date();
  }
}
