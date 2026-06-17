import { TreinoTemplate } from "../../../domain/entities/TreinoTemplate";
import { IExerciciosRepository } from "../../../domain/repositories/IExerciciosRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { CreateTreinoTemplateCommand } from "./CreateTreinoTemplateCommand";

export class CreateTreinoTemplateHandler {
  constructor(private readonly repo: IExerciciosRepository) {}

  async execute(command: CreateTreinoTemplateCommand) {
    const blocoCheck = await pool.query(
      `SELECT n.user_id FROM blocos b JOIN nucleos n ON b.nucleo_id = n.id WHERE b.id = $1`,
      [command.blocoId],
    );
    if (blocoCheck.rows.length === 0) throw new Error("Bloco não encontrado");
    if (blocoCheck.rows[0].user_id !== command.userId) throw new Error("Acesso negado");

    const template = TreinoTemplate.create({
      blocoId: command.blocoId,
      nome: command.nome,
      descricao: command.descricao,
    });

    await this.repo.saveTemplate(template);

    return {
      id: template.id,
      blocoId: template.blocoId,
      nome: template.nome,
      descricao: template.descricao ?? null,
      exercicios: [],
      sessoesCount: 0,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }
}
