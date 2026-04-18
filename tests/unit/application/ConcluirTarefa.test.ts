// // tests/unit/application/ConcluirTarefa.test.ts
// import { ConcluirTarefaHandler } from "../../../src/application/commands/tarefas/ConcluirTarefaHandler";
// import { ConcluirTarefaCommand } from "../../../src/application/commands/tarefas/ConcluirTarefaCommand";
// import { Tarefa } from "../../../src/domain/entities/Tarefa";

// const mockTarefa = new Tarefa({
//   blocoId: "bloco-1",
//   titulo: "Estudar TypeScript",
// });
// const mockTarefaRepo = {
//   findById: jest.fn().mockResolvedValue(mockTarefa),
//   update: jest.fn().mockResolvedValue(undefined),
//   findByBlocoId: jest.fn(),
//   findVencendo: jest.fn(),
//   create: jest.fn(),
//   softDelete: jest.fn(),
// };

// describe("ConcluirTarefaHandler", () => {
//   it("deve concluir tarefa", async () => {
//     const handler = new ConcluirTarefaHandler(mockTarefaRepo as any);
//     const result = await handler.execute(
//       new ConcluirTarefaCommand(mockTarefa.id),
//     );
//     expect(result.status).toBe("concluida");
//     expect(mockTarefaRepo.update).toHaveBeenCalled();
//   });

//   it("deve lancar NotFoundException para tarefa inexistente", async () => {
//     mockTarefaRepo.findById.mockResolvedValueOnce(null);
//     const handler = new ConcluirTarefaHandler(mockTarefaRepo as any);
//     await expect(
//       handler.execute(new ConcluirTarefaCommand("id-invalido")),
//     ).rejects.toThrow("não encontrado");
//   });
// });
