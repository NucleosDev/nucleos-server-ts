// // tests/setup.ts
// import { pool } from "../src/infrastructure/persistence/db/connection";

// beforeAll(async () => {
//   // Verificar conexão antes dos testes
//   try {
//     await pool.query("SELECT 1");
//   } catch (e) {
//     console.warn("DB não disponível para testes de integração");
//   }
// });

// afterAll(async () => {
//   await pool.end();
// });
