// src/api/controllers/v1/NotificationsController.ts
import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { logger } from "../../../shared/utils/logger";
import { randomUUID } from "crypto";

export class NotificationsController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      const { limit = 50, page = 1 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await pool.query(
        `SELECT id, titulo, mensagem, read, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      );

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM notifications WHERE user_id = $1`,
        [userId],
      );

      const notifications = result.rows.map((row) => ({
        id: row.id,
        titulo: row.titulo,
        mensagem: row.mensagem,
        lida: row.read,
        createdAt: row.created_at,
      }));

      res.json({
        success: true,
        data: notifications,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error) {
      logger.error("Erro ao listar notificações:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      await pool.query(
        `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`,
        [id, userId],
      );

      res.json({ success: true, message: "Notificação marcada como lida" });
    } catch (error) {
      logger.error("Erro ao marcar notificação:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      await pool.query(
        `UPDATE notifications SET read = true WHERE user_id = $1 AND read = false`,
        [userId],
      );

      res.json({
        success: true,
        message: "Todas notificações marcadas como lidas",
      });
    } catch (error) {
      logger.error("Erro ao marcar todas notificações:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  // 🔥 MÉTODO FALTANDO - ADICIONAR ESTE
  static async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      const result = await pool.query(
        `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false`,
        [userId],
      );

      res.json({
        success: true,
        data: { count: parseInt(result.rows[0].count) },
      });
    } catch (error) {
      logger.error("Erro ao buscar contagem de não lidas:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      await pool.query(
        `DELETE FROM notifications WHERE id = $1 AND user_id = $2`,
        [id, userId],
      );

      res.status(204).send();
    } catch (error) {
      logger.error("Erro ao deletar notificação:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async createNotification(
    userId: string,
    titulo: string,
    mensagem: string,
  ): Promise<void> {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO notifications (id, user_id, titulo, mensagem, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [id, userId, titulo, mensagem],
    );
  }
}
