import { IExerciciosRepository } from "../../../domain/repositories/IExerciciosRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { GetTreinosByBlocoQuery } from "./GetTreinosByBlocoQuery";

export class GetTreinosByBlocoHandler {
  constructor(private readonly repo: IExerciciosRepository) {}

  async execute(query: GetTreinosByBlocoQuery) {
    const blocoCheck = await pool.query(
      `SELECT n.user_id FROM blocos b JOIN nucleos n ON b.nucleo_id = n.id WHERE b.id = $1`,
      [query.blocoId],
    );
    if (blocoCheck.rows.length === 0) throw new Error("Bloco não encontrado");
    if (blocoCheck.rows[0].user_id !== query.userId) throw new Error("Acesso negado");

    const templates = await this.repo.findTemplatesByBlocoId(query.blocoId);

    const result = await Promise.all(
      templates.map(async (template) => {
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
      }),
    );

    return result;
  }
}
