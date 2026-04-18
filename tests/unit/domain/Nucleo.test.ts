// // tests/unit/domain/Nucleo.test.ts
// import { Nucleo } from "../../../src/domain/entities/Nucleo";
// import { TipoNucleo } from "../../../src/domain/enums/TipoNucleo";

// describe("Nucleo", () => {
//   it("deve criar nucleo com valores padrão", () => {
//     const n = new Nucleo("user-1", "Meus Estudos");
//     expect(n.userId).toBe("user-1");
//     expect(n.nome).toBe("Meus Estudos");
//     expect(n.tipo).toBe(TipoNucleo.PESSOAL);
//     expect(n.deletedAt).toBeNull();
//   });

//   it("deve atualizar nucleo", () => {
//     const n = new Nucleo("user-1", "Estudos");
//     const before = n.updatedAt;
//     n.update("Academia", undefined, TipoNucleo.PESSOAL, "#ff0000");
//     expect(n.nome).toBe("Academia");
//     expect(n.corDestaque).toBe("#ff0000");
//   });

//   it("deve soft delete", () => {
//     const n = new Nucleo("user-1", "Nucleo");
//     n.softDelete();
//     expect(n.deletedAt).toBeInstanceOf(Date);
//   });
// });
