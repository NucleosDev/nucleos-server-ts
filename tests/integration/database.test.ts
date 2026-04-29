// // tests/integration/database.test.ts
// import {
//   pool,
//   testDatabaseConnection,
// } from "../../src/infrastructure/persistence/db/connection";

// import { userInfo } from "node:os";

// describe("Database connection", () => {
//   it("deve conectar ao banco", async () => {
//     const connected = await testDatabaseConnection();
//     expect(connected).toBe(true);
//   }, 10000);

//   afterAll(async () => {
//     await pool.end();
//   });
// });
