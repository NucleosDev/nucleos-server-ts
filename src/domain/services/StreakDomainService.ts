export class StreakDomainService {
  static calculate(dates: Date[]): { atual: number; maximo: number } {
    if (dates.length === 0) return { atual: 0, maximo: 0 };

    const sorted = [...dates]
      .map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()))
      .sort((a, b) => a.getTime() - b.getTime());

    let maximo = 1;
    let streakAtual = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]!;
      const curr = sorted[i]!;
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        streakAtual++;
        maximo = Math.max(maximo, streakAtual);
      } else if (diffDays > 1) {
        streakAtual = 1;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = sorted[sorted.length - 1]!;
    const diffFromToday = Math.round(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const atual = diffFromToday <= 1 ? streakAtual : 0;

    return { atual, maximo };
  }

  static isConsecutive(dates: Date[]): number {
    return StreakDomainService.calculate(dates).atual;
  }
}
