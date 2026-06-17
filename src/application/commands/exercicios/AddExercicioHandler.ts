import { TreinoExercicio } from "../../../domain/entities/TreinoExercicio";
import { IExerciciosRepository } from "../../../domain/repositories/IExerciciosRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { AddExercicioCommand } from "./AddExercicioCommand";

export class AddExercicioHandler {
  constructor(private readonly repo: IExerciciosRepository) {}

  async execute(command: AddExercicioCommand) {
    const template = await this.repo.findTemplateById(command.templateId);
    if (!template) throw new Error("Treino não encontrado");

    const blocoCheck = await pool.query(
      `SELECT n.user_id FROM blocos b JOIN nucleos n ON b.nucleo_id = n.id WHERE b.id = $1`,
      [template.blocoId],
    );
    if (blocoCheck.rows.length === 0 || blocoCheck.rows[0].user_id !== command.userId) {
      throw new Error("Acesso negado");
    }

    const existing = await this.repo.findExerciciosByTemplateId(command.templateId);
    const ordem = command.ordem ?? existing.length;

    const exercicio = TreinoExercicio.create({
      templateId: command.templateId,
      nome: command.nome,
      series: command.series,
      repeticoes: command.repeticoes,
      pesoKg: command.pesoKg,
      ordem,
    });

    await this.repo.saveExercicio(exercicio);

    return {
      id: exercicio.id,
      templateId: exercicio.templateId,
      nome: exercicio.nome,
      series: exercicio.series,
      repeticoes: exercicio.repeticoes,
      pesoKg: exercicio.pesoKg ?? null,
      ordem: exercicio.ordem,
    };
  }
}
