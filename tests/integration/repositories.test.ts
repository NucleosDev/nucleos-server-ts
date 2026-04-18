// // tests/integration/repositories.test.ts
// // Testes de integração — requerem banco rodando
// // Executar com: npm run test:integration
// import { UserRepository } from "../../src/infrastructure/persistence/repositories/UserRepository";

// describe("UserRepository", () => {
//   const repo = new UserRepository();

//   it("deve verificar existência de email inexistente", async () => {
//     const exists = await repo.existsByEmail(
//       "nao-existe-" + Date.now() + "@test.com",
//     );
//     expect(exists).toBe(false);
//   }, 10000);
// });
