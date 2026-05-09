export type PermissionLevelValue = "view" | "edit" | "admin";

export class PermissionLevel {
  private constructor(private readonly value: PermissionLevelValue) {}

  static VIEW = new PermissionLevel("view");
  static EDIT = new PermissionLevel("edit");
  static ADMIN = new PermissionLevel("admin");

  static from(value: string): PermissionLevel {
    const valid: PermissionLevelValue[] = ["view", "edit", "admin"];
    if (!valid.includes(value as PermissionLevelValue)) {
      throw new Error(`Invalid permission level: "${value}"`);
    }
    return new PermissionLevel(value as PermissionLevelValue);
  }

  toString(): PermissionLevelValue {
    return this.value;
  }

  canEdit(): boolean {
    return this.value === "edit" || this.value === "admin";
  }

  isAdmin(): boolean {
    return this.value === "admin";
  }

  equals(other: PermissionLevel): boolean {
    return this.value === other.value;
  }
}
