import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { logger } from "../../../shared/utils/logger";
import { randomUUID } from "crypto";

export class InsightsController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      const result = await pool.query(
        `SELECT ai.id, ai.user_id, ai.nucleo_id, ai.insight_type, ai.mensagem, 
                ai.priority, ai.applied, ai.created_at,
                n.nome as nucleo_nome
         FROM ai_insights ai
         LEFT JOIN nucleos n ON n.id = ai.nucleo_id
         WHERE ai.user_id = $1
         ORDER BY ai.priority DESC, ai.created_at DESC`,
        [userId],
      );

      res.json(result.rows);
    } catch (error) {
      logger.error("Erro ao listar insights:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async generate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { nucleoId } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      // Buscar dados para gerar insight
      let query = `
        SELECT COUNT(*) as total_tarefas,
               SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) as concluidas,
               COUNT(DISTINCT DATE(created_at)) as dias_ativos
        FROM tarefas t
        JOIN blocos b ON b.id = t.bloco_id
        WHERE b.nucleo_id IN (SELECT id FROM nucleos WHERE user_id = $1)
      `;
      const params = [userId];

      if (nucleoId) {
        query = `
          SELECT COUNT(*) as total_tarefas,
                 SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) as concluidas,
                 COUNT(DISTINCT DATE(t.created_at)) as dias_ativos
          FROM tarefas t
          JOIN blocos b ON b.id = t.bloco_id
          WHERE b.nucleo_id = $1
        `;
        params[0] = nucleoId;
      }

      const stats = await pool.query(query, params);
      const total = parseInt(stats.rows[0]?.total_tarefas || 0);
      const concluidas = parseInt(stats.rows[0]?.concluidas || 0);
      const progresso = total > 0 ? (concluidas / total) * 100 : 0;

      let mensagem = "";
      let insightType = "productivity";
      let priority = 3;

      if (progresso < 30) {
        mensagem =
          "Você está com baixo progresso. Que tal focar em tarefas pequenas para ganhar momentum?";
        priority = 5;
      } else if (progresso < 70) {
        mensagem = "Bom progresso! Continue assim para alcançar suas metas.";
        priority = 3;
      } else {
        mensagem = "Excelente progresso! Você está quase lá!";
        priority = 4;
      }

      const id = randomUUID();
      await pool.query(
        `INSERT INTO ai_insights (id, user_id, nucleo_id, insight_type, mensagem, priority, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [id, userId, nucleoId || null, insightType, mensagem, priority],
      );

      res.status(201).json({ id, mensagem, insightType, priority });
    } catch (error) {
      logger.error("Erro ao gerar insight:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async apply(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE ai_insights SET applied = true WHERE id = $1 AND user_id = $2 RETURNING *`,
        [id, userId],
      );

      if (result.rows.length === 0) {
        res
          .status(404)
          .json({ success: false, message: "Insight não encontrado" });
        return;
      }

      res.json({ success: true, message: "Insight aplicado!" });
    } catch (error) {
      logger.error("Erro ao aplicar insight:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async chat(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { mensagem } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      // Resposta simples simulando IA
      let resposta = "";
      const msgLower = mensagem.toLowerCase();

      if (msgLower.includes("produtividade")) {
        resposta =
          "Para aumentar sua produtividade, tente usar a técnica Pomodoro e priorizar tarefas importantes.";
      } else if (msgLower.includes("habito")) {
        resposta =
          "Para criar um hábito, comece pequeno e seja consistente. Registre seu progresso diariamente!";
      } else if (msgLower.includes("tarefa")) {
        resposta =
          "Organize suas tarefas por prioridade. Conclua as mais importantes primeiro!";
      } else {
        resposta =
          "Obrigado pela mensagem! Estou aqui para ajudar com produtividade, hábitos e organização.";
      }

      // Salvar interação
      const id = randomUUID();
      await pool.query(
        `INSERT INTO ai_interactions (id, user_id, mensagem, resposta, contexto, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          id,
          userId,
          mensagem,
          resposta,
          JSON.stringify({ timestamp: new Date() }),
        ],
      );

      res.json({ resposta });
    } catch (error) {
      logger.error("Erro no chat:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }
}
