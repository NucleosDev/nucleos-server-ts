import { IExerciciosRepository } from "../../../domain/repositories/IExerciciosRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { RemoveExercicioCommand } from "./RemoveExercicioCommand";

export class RemoveExercicioHandler {
  constructor(private readonly repo: IExerciciosRepository) {}

  async execute(command: RemoveExercicioCommand): Promise<void> {
    const result = await pool.query(
      `SELECT te.template_id, n.user_id
       FROM treino_exercicios te
       JOIN treino_templates tt ON te.template_id = tt.id
       JOIN blocos b ON tt.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE te.id = $1`,
      [command.id],
    );
    if (result.rows.length === 0) throw new Error("Exercício não encontrado");
    if (result.rows[0].user_id !== command.userId) throw new Error("Acesso negado");

    await this.repo.deleteExercicio(command.id);
  }
}
