import { Habito } from "../entities/Habito.js";
import { StreakDomainService } from "./StreakDomainService.js";

export class HabitoDomainService {
  static shouldCompleteToday(habito: Habito): boolean {
    const today = new Date().getDay();

    if (habito.frequencia === "diaria") return true;

    if (
      (habito.frequencia === "semanal" ||
        habito.frequencia === "personalizada") &&
      habito.diasSemana
    ) {
      return habito.diasSemana.includes(today);
    }

    return true;
  }

  static computeStreak(completionDates: Date[]): {
    atual: number;
    maximo: number;
  } {
    return StreakDomainService.calculate(completionDates);
  }

  static completionRateForPeriod(
    completionDates: Date[],
    startDate: Date,
    endDate: Date,
    habito: Habito,
  ): number {
    const relevant = completionDates.filter(
      (d) => d >= startDate && d <= endDate,
    );

    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (totalDays === 0) return 0;

    const expectedDays =
      habito.frequencia === "diaria"
        ? totalDays
        : habito.diasSemana
          ? Math.ceil((totalDays / 7) * habito.diasSemana.length)
          : totalDays;

    return Math.min(
      100,
      Math.round((relevant.length / Math.max(1, expectedDays)) * 100),
    );
  }
}
