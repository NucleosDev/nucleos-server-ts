import { Email } from "../domain/value-objects/Email.js";
import { CPF } from "../domain/value-objects/CPF.js";
import { Tarefa } from "../domain/entities/Tarefa.js";
import { Habito } from "../domain/entities/Habito.js";
import { StreakDomainService } from "../domain/services/StreakDomainService.js";
import { GamificacaoDomainService } from "../domain/services/GamificacaoDomainService.js";
import { TarefaDomainService } from "../domain/services/TarefaDomainService.js";
import { DomainException } from "../domain/exceptions/DomainException.js";
import { NotFoundException } from "../domain/exceptions/NotFoundException.js";
import { BusinessRuleException } from "../domain/exceptions/BusinessRuleException.js";

// ─── Value Objects ─────────────────────────────────────────────────────────

describe("Email", () => {
  it("creates a valid email and normalizes to lowercase", () => {
    const email = new Email("TEST@EXAMPLE.COM");
    expect(email.toString()).toBe("test@example.com");
  });

  it("creates valid email with subdomains", () => {
    const email = new Email("user@mail.example.com");
    expect(email.toString()).toBe("user@mail.example.com");
  });

  it("throws for missing @", () => {
    expect(() => new Email("invalidemail.com")).toThrow();
  });

  it("throws for empty string", () => {
    expect(() => new Email("")).toThrow();
  });

  it("equals compares correctly", () => {
    const a = new Email("a@b.com");
    const b = new Email("A@B.COM");
    expect(a.equals(b)).toBe(true);
  });
});

describe("CPF", () => {
  it("validates a valid CPF", () => {
    const cpf = new CPF("529.982.247-25");
    expect(cpf.toRaw()).toBe("52998224725");
  });

  it("formats correctly", () => {
    const cpf = new CPF("52998224725");
    expect(cpf.toFormatted()).toBe("529.982.247-25");
  });

  it("throws for invalid CPF (all same digits)", () => {
    expect(() => new CPF("111.111.111-11")).toThrow();
  });

  it("throws for short CPF", () => {
    expect(() => new CPF("123")).toThrow();
  });

  it("equals compares correctly", () => {
    const a = new CPF("529.982.247-25");
    const b = new CPF("52998224725");
    expect(a.equals(b)).toBe(true);
  });
});

// ─── Domain Entities ────────────────────────────────────────────────────────

describe("Tarefa", () => {
  const makeTarefa = () =>
    Tarefa.create({
      blocoId: "bloco-1",
      titulo: "Test task",
      prioridade: "media",
      posicao: 0,
    });

  it("creates with default status pendente", () => {
    const t = makeTarefa();
    expect(t.status).toBe("pendente");
    expect(t.isConcluida).toBe(false);
  });

  it("throws when titulo is too short", () => {
    expect(() =>
      Tarefa.create({ blocoId: "b", titulo: "ab", prioridade: "media", posicao: 0 }),
    ).toThrow();
  });

  it("concluir sets status and completedAt", () => {
    const t = makeTarefa();
    t.concluir();
    expect(t.status).toBe("concluida");
    expect(t.concluidaEm).toBeInstanceOf(Date);
    expect(t.isConcluida).toBe(true);
  });

  it("throws on double concluir", () => {
    const t = makeTarefa();
    t.concluir();
    expect(() => t.concluir()).toThrow();
  });

  it("reabrir resets status", () => {
    const t = makeTarefa();
    t.concluir();
    t.reabrir();
    expect(t.status).toBe("pendente");
    expect(t.concluidaEm).toBeNull();
  });

  it("softDelete marks deletedAt", () => {
    const t = makeTarefa();
    t.softDelete();
    expect(t.isDeleted).toBe(true);
    expect(t.deletedAt).toBeInstanceOf(Date);
  });

  it("isAtrasada for past due pending task", () => {
    const t = Tarefa.create({
      blocoId: "b",
      titulo: "Late task",
      prioridade: "alta",
      posicao: 0,
      dataVencimento: new Date(Date.now() - 86_400_000),
    });
    expect(t.isAtrasada).toBe(true);
  });

  it("isAtrasada is false for completed task", () => {
    const t = Tarefa.create({
      blocoId: "b",
      titulo: "Done late",
      prioridade: "alta",
      posicao: 0,
      dataVencimento: new Date(Date.now() - 86_400_000),
    });
    t.concluir();
    expect(t.isAtrasada).toBe(false);
  });
});

describe("Habito", () => {
  it("creates with default frequency diaria", () => {
    const h = Habito.create({ blocoId: "b", nome: "Meditar", frequencia: "diaria" });
    expect(h.frequencia).toBe("diaria");
    expect(h.diasSemana).toBeNull();
  });

  it("throws when nome is too short", () => {
    expect(() =>
      Habito.create({ blocoId: "b", nome: "ab", frequencia: "diaria" }),
    ).toThrow();
  });

  it("stores diasSemana for semanal frequency", () => {
    const h = Habito.create({
      blocoId: "b",
      nome: "Exercício",
      frequencia: "semanal",
      diasSemana: [1, 3, 5],
    });
    expect(h.diasSemana).toEqual([1, 3, 5]);
  });

  it("updateNome trims and validates", () => {
    const h = Habito.create({ blocoId: "b", nome: "Ler livro", frequencia: "diaria" });
    h.updateNome("  Ler artigos  ");
    expect(h.nome).toBe("Ler artigos");
  });
});

// ─── Domain Services ────────────────────────────────────────────────────────

describe("StreakDomainService", () => {
  it("returns 0 for empty dates", () => {
    const { atual, maximo } = StreakDomainService.calculate([]);
    expect(atual).toBe(0);
    expect(maximo).toBe(0);
  });

  it("calculates consecutive days streak", () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(today.getDate() - 2);

    const { atual, maximo } = StreakDomainService.calculate([
      today,
      yesterday,
      dayBefore,
    ]);
    expect(atual).toBe(3);
    expect(maximo).toBe(3);
  });

  it("breaks streak on gap", () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    const { atual } = StreakDomainService.calculate([today, twoDaysAgo]);
    expect(atual).toBe(1);
  });

  it("returns 0 atual when last date was 2+ days ago", () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    const { atual, maximo } = StreakDomainService.calculate([
      threeDaysAgo,
      fourDaysAgo,
    ]);
    expect(atual).toBe(0);
    expect(maximo).toBe(2);
  });
});

describe("GamificacaoDomainService", () => {
  it("levelFromXp returns 1 for 0 XP", () => {
    expect(GamificacaoDomainService.levelFromXp(0)).toBe(1);
  });

  it("xpForLevel(1) equals BASE_XP (100)", () => {
    expect(GamificacaoDomainService.xpForLevel(1)).toBe(100);
  });

  it("higher level requires more XP", () => {
    expect(GamificacaoDomainService.xpForLevel(5)).toBeGreaterThan(
      GamificacaoDomainService.xpForLevel(1),
    );
  });

  it("levelFromXp increases with more XP", () => {
    const lvl1 = GamificacaoDomainService.levelFromXp(0);
    const lvl2 = GamificacaoDomainService.levelFromXp(100);
    expect(lvl2).toBeGreaterThan(lvl1);
  });

  it("xpForAction returns expected values", () => {
    expect(GamificacaoDomainService.xpForAction("task_complete")).toBe(10);
    expect(GamificacaoDomainService.xpForAction("habit_register")).toBe(15);
    expect(GamificacaoDomainService.xpForAction("habit_streak_7")).toBe(50);
  });
});

describe("TarefaDomainService", () => {
  it("completionRate returns 0 for empty array", () => {
    expect(TarefaDomainService.completionRate([])).toBe(0);
  });

  it("completionRate calculates correctly", () => {
    const t1 = Tarefa.create({ blocoId: "b", titulo: "Task 1", prioridade: "baixa", posicao: 0 });
    const t2 = Tarefa.create({ blocoId: "b", titulo: "Task 2", prioridade: "baixa", posicao: 1 });
    t2.concluir();
    expect(TarefaDomainService.completionRate([t1, t2])).toBe(50);
  });

  it("sortByPriority puts alta first", () => {
    const low = Tarefa.create({ blocoId: "b", titulo: "Low task", prioridade: "baixa", posicao: 0 });
    const high = Tarefa.create({ blocoId: "b", titulo: "High task", prioridade: "alta", posicao: 1 });
    const sorted = TarefaDomainService.sortByPriority([low, high]);
    expect(sorted[0]?.prioridade).toBe("alta");
  });

  it("markOverdue returns only overdue pending tasks", () => {
    const overdueTask = Tarefa.create({
      blocoId: "b",
      titulo: "Overdue task",
      prioridade: "media",
      posicao: 0,
      dataVencimento: new Date(Date.now() - 86_400_000),
    });
    const futureTask = Tarefa.create({
      blocoId: "b",
      titulo: "Future task",
      prioridade: "media",
      posicao: 1,
      dataVencimento: new Date(Date.now() + 86_400_000),
    });
    const overdue = TarefaDomainService.markOverdue([overdueTask, futureTask]);
    expect(overdue).toHaveLength(1);
    expect(overdue[0]?.titulo).toBe("Overdue task");
  });
});

// ─── Domain Exceptions ──────────────────────────────────────────────────────

describe("Domain Exceptions", () => {
  it("DomainException preserves message and code", () => {
    const ex = new DomainException("Something failed", "ERR_001");
    expect(ex.message).toBe("Something failed");
    expect(ex.code).toBe("ERR_001");
    expect(ex).toBeInstanceOf(Error);
  });

  it("NotFoundException formats resource name", () => {
    const ex = new NotFoundException("Habito", "abc-123");
    expect(ex.message).toContain("abc-123");
    expect(ex.code).toBe("NOT_FOUND");
  });

  it("NotFoundException without id", () => {
    const ex = new NotFoundException("Bloco");
    expect(ex.message).toContain("Bloco");
  });

  it("BusinessRuleException sets correct code", () => {
    const ex = new BusinessRuleException("Cannot delete active bloco");
    expect(ex.code).toBe("BUSINESS_RULE_VIOLATION");
    expect(ex).toBeInstanceOf(DomainException);
  });
});
