// // tests/unit/domain/Habito.test.ts
// import { Habito } from "../../../src/domain/entities/Habito";
// import { Streak } from "../../../src/domain/entities/Streak";

// describe("Habito", () => {
//   it("deve criar habito com frequencia diaria", () => {
//     const h = new Habito({ blocoId: "bloco-1", nome: "Ler 30 min" });
//     expect(h.frequencia).toBe("diaria");
//     expect(h.metaVezes).toBe(1);
//   });
// });

// describe("Streak", () => {
//   it("deve iniciar streak com 1 no primeiro registro", () => {
//     const s = new Streak({ userId: "user-1", streakType: "global" });
//     s.registrarAtividade(new Date());
//     expect(s.currentStreak).toBe(1);
//     expect(s.maxStreak).toBe(1);
//   });

//   it("deve incrementar streak em dias consecutivos", () => {
//     const s = new Streak({ userId: "user-1", streakType: "global" });
//     const ontem = new Date(Date.now() - 86_400_000);
//     s.registrarAtividade(ontem);
//     s.registrarAtividade(new Date());
//     expect(s.currentStreak).toBe(2);
//   });

//   it("deve zerar streak após dia perdido", () => {
//     const s = new Streak({ userId: "user-1", streakType: "global" });
//     const tresDiasAtras = new Date(Date.now() - 3 * 86_400_000);
//     s.registrarAtividade(tresDiasAtras);
//     s.registrarAtividade(new Date());
//     expect(s.currentStreak).toBe(1);
//   });
// });
