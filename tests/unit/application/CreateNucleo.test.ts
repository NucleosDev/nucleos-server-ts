// // tests/unit/application/CreateNucleo.test.ts
// import { CreateNucleoHandler } from "../../../src/application/commands/nucleos/CreateNucleoHandler";
// import { CreateNucleoCommand } from "../../../src/application/commands/nucleos/CreateNucleoCommand";

// const mockNucleoRepo = {
//   countByUserId: jest.fn().mockResolvedValue(0),
//   create: jest.fn().mockResolvedValue(undefined),
//   findById: jest.fn(),
//   findByUserId: jest.fn(),
//   update: jest.fn(),
//   softDelete: jest.fn(),
//   existsByIdAndUser: jest.fn(),
// };

// describe("CreateNucleoHandler", () => {
//   it("deve criar nucleo com sucesso", async () => {
//     const handler = new CreateNucleoHandler(mockNucleoRepo as any);
//     const cmd = new CreateNucleoCommand("user-1", "Academia");
//     const result = await handler.execute(cmd);
//     expect(result.nome).toBe("Academia");
//     expect(mockNucleoRepo.create).toHaveBeenCalled();
//   });

//   it("deve lancar erro se limite de nucleos atingido", async () => {
//     mockNucleoRepo.countByUserId.mockResolvedValueOnce(3);
//     const handler = new CreateNucleoHandler(mockNucleoRepo as any);
//     const cmd = new CreateNucleoCommand("user-1", "Novo Nucleo");
//     await expect(handler.execute(cmd)).rejects.toThrow("Limite");
//   });
// });
