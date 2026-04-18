// import { User } from "../domain/entities/User";
// import { Email, CPF, Cor } from "../domain/value-objects/CPF";
// import {
//   LevelCalculator,
//   StreakCalculator,
// } from "../../infrastructure/gamification";
// import {
//   TarefaVencidaSpecification,
//   UserAtivoSpecification,
// } from "../../domain/specifications";
// import { StatusTarefa, PrioridadeTarefa } from "../../domain/enums";
// import { Tarefa } from "../../domain/entities";

// // ─── Value Objects ────────────────────────────────────────────
// describe("Email", () => {
//   it("should create valid email", () => {
//     const email = new Email("test@example.com");
//     expect(email.toString()).toBe("test@example.com");
//   });
//   it("should normalize to lowercase", () => {
//     const email = new Email("TEST@EXAMPLE.COM");
//     expect(email.toString()).toBe("test@example.com");
//   });
//   it("should throw for invalid email", () => {
//     expect(() => new Email("invalid")).toThrow();
//   });
// });

// describe("CPF", () => {
//   it("should validate a valid CPF", () => {
//     const cpf = new CPF("529.982.247-25");
//     expect(cpf.toRaw()).toBe("52998224725");
//   });
//   it("should throw for invalid CPF", () => {
//     expect(() => new CPF("111.111.111-11")).toThrow();
//   });
// });

// describe("Cor", () => {
//   it("should accept valid hex color", () => {
//     const cor = new Cor("#3B82F6");
//     expect(cor.toString()).toBe("#3b82f6");
//   });
//   it("should throw for invalid color", () => {
//     expect(() => new Cor("red")).toThrow();
//   });
// });

// // ─── Domain Entities ──────────────────────────────────────────
// describe("User", () => {
//   it("should create user with defaults", () => {
//     const user = new User("a@b.com", "hash");
//     expect(user.email).toBe("a@b.com");
//     expect(user.isEmailVerified).toBe(false);
//     expect(user.isDeleted).toBe(false);
//   });
//   it("should soft-delete correctly", () => {
//     const user = new User("a@b.com", "hash");
//     user.softDelete("admin-id");
//     expect(user.isDeleted).toBe(true);
//     expect(user.deletedAt).toBeInstanceOf(Date);
//     expect(user.deletedBy).toBe("admin-id");
//   });
// });

// describe("Tarefa", () => {
//   it("should concluir tarefa", () => {
//     const t = new Tarefa("bloco-1", "user-1", "Test task");
//     expect(t.status).toBe(StatusTarefa.PENDENTE);
//     t.concluir();
//     expect(t.status).toBe(StatusTarefa.CONCLUIDA);
//     expect(t.completedAt).toBeInstanceOf(Date);
//   });
// });

// // ─── Specifications ───────────────────────────────────────────
// describe("TarefaVencidaSpecification", () => {
//   const spec = new TarefaVencidaSpecification();

//   it("should identify overdue task", () => {
//     const t = new Tarefa("b", "u", "Late");
//     t.dueDate = new Date(Date.now() - 86400000);
//     t.status = StatusTarefa.PENDENTE;
//     expect(spec.isSatisfiedBy(t)).toBe(true);
//   });

//   it("should not flag completed task as overdue", () => {
//     const t = new Tarefa("b", "u", "Done");
//     t.dueDate = new Date(Date.now() - 86400000);
//     t.status = StatusTarefa.CONCLUIDA;
//     expect(spec.isSatisfiedBy(t)).toBe(false);
//   });
// });

// describe("UserAtivoSpecification", () => {
//   const spec = new UserAtivoSpecification();
//   it("should identify active user", () => {
//     const u = new User("a@b.com", "h");
//     u.isActive = true;
//     u.isEmailVerified = true;
//     u.isDeleted = false;
//     expect(spec.isSatisfiedBy(u)).toBe(true);
//   });
//   it("should reject deleted user", () => {
//     const u = new User("a@b.com", "h");
//     u.isActive = true;
//     u.isEmailVerified = true;
//     u.softDelete();
//     expect(spec.isSatisfiedBy(u)).toBe(false);
//   });
// });

// // ─── Gamification ─────────────────────────────────────────────
// describe("LevelCalculator", () => {
//   it("should calculate level from XP", () => {
//     expect(LevelCalculator.levelFromXP(0)).toBe(1);
//     expect(LevelCalculator.levelFromXP(100)).toBe(2);
//     expect(LevelCalculator.levelFromXP(300)).toBe(3);
//   });
//   it("should compute XP needed per level", () => {
//     expect(LevelCalculator.xpForLevel(1)).toBe(100);
//     expect(LevelCalculator.xpForLevel(5)).toBe(500);
//   });
// });

// describe("StreakCalculator", () => {
//   it("should calculate consecutive days streak", () => {
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(today.getDate() - 1);
//     const dayBefore = new Date(today);
//     dayBefore.setDate(today.getDate() - 2);

//     const streak = StreakCalculator.isConsecutive([
//       today,
//       yesterday,
//       dayBefore,
//     ]);
//     expect(streak).toBe(3);
//   });

//   it("should break streak on gap", () => {
//     const today = new Date();
//     const twoDaysAgo = new Date(today);
//     twoDaysAgo.setDate(today.getDate() - 2);

//     const streak = StreakCalculator.isConsecutive([today, twoDaysAgo]);
//     expect(streak).toBe(1);
//   });

//   it("should return 0 for empty dates", () => {
//     expect(StreakCalculator.isConsecutive([])).toBe(0);
//   });
// });
