import { IExerciciosRepository } from "../../../domain/repositories/IExerciciosRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { DeleteTreinoTemplateCommand } from "./DeleteTreinoTemplateCommand";

export class DeleteTreinoTemplateHandler {
  constructor(private readonly repo: IExerciciosRepository) {}

  async execute(command: DeleteTreinoTemplateCommand): Promise<void> {
    const template = await this.repo.findTemplateById(command.id);
    if (!template) throw new Error("Treino não encontrado");

    const blocoCheck = await pool.query(
      `SELECT n.user_id FROM blocos b JOIN nucleos n ON b.nucleo_id = n.id WHERE b.id = $1`,
      [template.blocoId],
    );
    if (blocoCheck.rows.length === 0 || blocoCheck.rows[0].user_id !== command.userId) {
      throw new Error("Acesso negado");
    }

    await this.repo.deleteTemplate(command.id);
  }
}
