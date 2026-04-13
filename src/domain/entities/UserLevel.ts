export class UserLevel {
  id: string;
  userId: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXpEarned: number;
  updatedAt: Date;

  constructor(params: { userId: string }) {
    this.id = crypto.randomUUID();
    this.userId = params.userId;
    this.level = 1;
    this.currentXp = 0;
    this.nextLevelXp = 100;
    this.totalXpEarned = 0;
    this.updatedAt = new Date();
  }

  addXp(amount: number): { leveledUp: boolean; newLevel: number } {
    this.currentXp += amount;
    this.totalXpEarned += amount;
    let leveledUp = false;

    while (this.currentXp >= this.nextLevelXp) {
      this.currentXp -= this.nextLevelXp;
      this.level++;
      this.nextLevelXp = Math.floor(this.nextLevelXp * 1.2);
      leveledUp = true;
    }

    this.updatedAt = new Date();
    return { leveledUp, newLevel: this.level };
  }
}
