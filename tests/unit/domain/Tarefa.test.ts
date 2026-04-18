// // tests/unit/domain/Tarefa.test.ts
// import { Tarefa } from "../../../src/domain/entities/Tarefa";

// describe("Tarefa", () => {
//   it("deve criar tarefa com status pendente", () => {
//     const t = new Tarefa({ blocoId: "bloco-1", titulo: "Minha tarefa" });
//     expect(t.status).toBe("pendente");
//     expect(t.titulo).toBe("Minha tarefa");
//     expect(t.prioridade).toBe("media");
//   });

//   it("deve concluir tarefa", () => {
//     const t = new Tarefa({ blocoId: "bloco-1", titulo: "Tarefa" });
//     t.concluir();
//     expect(t.status).toBe("concluida");
//     expect(t.concluidaEm).toBeInstanceOf(Date);
//   });

//   it("deve marcar tarefa atrasada", () => {
//     const dataPassada = new Date(Date.now() - 86_400_000);
//     const t = new Tarefa({
//       blocoId: "bloco-1",
//       titulo: "Tarefa",
//       dataVencimento: dataPassada,
//     });
//     expect(t.estaAtrasada()).toBe(true);
//     t.marcarAtrasada();
//     expect(t.status).toBe("atrasada");
//   });

//   it("deve reabrir tarefa concluida", () => {
//     const t = new Tarefa({ blocoId: "bloco-1", titulo: "Tarefa" });
//     t.concluir();
//     t.reabrir();
//     expect(t.status).toBe("pendente");
//     expect(t.concluidaEm).toBeNull();
//   });
// });
