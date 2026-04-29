// tests/unit/api/auth.test.ts
// Testes de integração leve para o fluxo de auth
// Para rodar: npm test -- tests/unit/api/auth.test.ts

describe("Auth flow", () => {
  it("deve ter RegisterCommand e LoginCommand definidos", async () => {
    const { RegisterCommand } =
      await import("../../../src/application/commands/auth/RegisterCommand");
    const { LoginCommand } =
      await import("../../../src/application/commands/auth/LoginCommand");
    expect(RegisterCommand).toBeDefined();
    expect(LoginCommand).toBeDefined();
  });
});
