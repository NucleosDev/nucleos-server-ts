import { IExerciciosRepository } from "../../../domain/repositories/IExerciciosRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { UpdateTreinoTemplateCommand } from "./UpdateTreinoTemplateCommand";

export class UpdateTreinoTemplateHandler {
  constructor(private readonly repo: IExerciciosRepository) {}

  async execute(command: UpdateTreinoTemplateCommand) {
    const template = await this.repo.findTemplateById(command.id);
    if (!template) throw new Error("Treino não encontrado");

    const blocoCheck = await pool.query(
      `SELECT n.user_id FROM blocos b JOIN nucleos n ON b.nucleo_id = n.id WHERE b.id = $1`,
      [template.blocoId],
    );
    if (blocoCheck.rows.length === 0 || blocoCheck.rows[0].user_id !== command.userId) {
      throw new Error("Acesso negado");
    }

    template.update({ nome: command.nome, descricao: command.descricao });
    await this.repo.updateTemplate(template);

    const exercicios = await this.repo.findExerciciosByTemplateId(template.id);
    const sessoesCount = await this.repo.countSessoesByTemplateId(template.id);

    return {
      id: template.id,
      blocoId: template.blocoId,
      nome: template.nome,
      descricao: template.descricao ?? null,
      exercicios: exercicios.map((e) => ({
        id: e.id,
        templateId: e.templateId,
        nome: e.nome,
        series: e.series,
        repeticoes: e.repeticoes,
        pesoKg: e.pesoKg ?? null,
        ordem: e.ordem,
      })),
      sessoesCount,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }
}
