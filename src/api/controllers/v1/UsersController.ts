import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { logger } from "../../../shared/utils/logger";

export class UsersController {
  //  GET CURRENT USER

  static async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
        return;
      }

      const result = await pool.query(
        `SELECT 
          u.id, u.email, u.phone, u.cpf, u.email_verified, u.active, u.created_at, u.updated_at,
          up.full_name, up.nickname, up.avatar_url,
          ul.level, ul.current_xp, ul.next_level_xp, ul.total_xp_earned, ul.updated_at as level_updated_at,
          ur.role,
          upre.theme, upre.language, upre.notifications, upre.shortcuts, upre.dashboard_layout,
          us.last_login, us.failed_attempts,
          s.plan_id, p.name as plan_name, p.max_nucleos, p.max_blocos_por_nucleo, p.max_membros_por_nucleo,
          s.is_active as subscription_active, s.expires_at as subscription_expires_at
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
         LEFT JOIN user_levels ul ON ul.user_id = u.id
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         LEFT JOIN user_preferences upre ON upre.user_id = u.id
         LEFT JOIN user_security us ON us.user_id = u.id
         LEFT JOIN subscriptions s ON s.user_id = u.id AND s.is_active = true
         LEFT JOIN plans p ON p.id = s.plan_id
         WHERE u.id = $1 AND u.deleted_at IS NULL`,
        [userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
        return;
      }

      const user = result.rows[0];

      res.json({
        id: user.id,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        emailVerified: user.email_verified,
        active: user.active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        fullName: user.full_name,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        level: user.level || 1,
        currentXp: user.current_xp || 0,
        nextLevelXp: user.next_level_xp || 100,
        totalXpEarned: user.total_xp_earned || 0,
        role: user.role || "user",
        preferences: {
          theme: user.theme || "system",
          language: user.language || "pt-BR",
          notifications: user.notifications,
          shortcuts: user.shortcuts,
          dashboardLayout: user.dashboard_layout,
        },
        security: {
          lastLogin: user.last_login,
          failedAttempts: user.failed_attempts || 0,
        },
        subscription: user.plan_name
          ? {
              planId: user.plan_id,
              planName: user.plan_name,
              maxNucleos: user.max_nucleos,
              maxBlocosPorNucleo: user.max_blocos_por_nucleo,
              maxMembrosPorNucleo: user.max_membros_por_nucleo,
              isActive: user.subscription_active,
              expiresAt: user.subscription_expires_at,
            }
          : null,
      });
    } catch (error) {
      logger.error("❌ Erro ao buscar usuário:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao buscar dados do usuário",
      });
    }
  }

  // UPDATE PROFILE

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
        return;
      }

      const { fullName, nickname, avatarUrl } = req.body;

      if (!fullName && !nickname && !avatarUrl) {
        res.status(400).json({
          success: false,
          message: "Nenhum campo para atualizar",
        });
        return;
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (fullName !== undefined) {
        updates.push(`full_name = $${paramIndex++}`);
        values.push(fullName);
      }

      if (nickname !== undefined) {
        updates.push(`nickname = $${paramIndex++}`);
        values.push(nickname);
      }

      if (avatarUrl !== undefined) {
        updates.push(`avatar_url = $${paramIndex++}`);
        values.push(avatarUrl);
      }

      values.push(userId);

      await pool.query(
        `UPDATE user_profiles 
         SET ${updates.join(", ")}, updated_at = NOW()
         WHERE user_id = $${paramIndex}`,
        values,
      );

      // Buscar usuário atualizado
      const result = await pool.query(
        `SELECT 
          u.id, u.email, u.phone, u.cpf, u.email_verified, u.active, u.created_at,
          up.full_name, up.nickname, up.avatar_url,
          ul.level, ul.current_xp, ul.next_level_xp, ul.total_xp_earned,
          ur.role
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
         LEFT JOIN user_levels ul ON ul.user_id = u.id
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         WHERE u.id = $1 AND u.deleted_at IS NULL`,
        [userId],
      );

      const user = result.rows[0];

      logger.info(`✅ Perfil atualizado: ${user.email}`);

      res.json({
        id: user.id,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        emailVerified: user.email_verified,
        active: user.active,
        createdAt: user.created_at,
        fullName: user.full_name,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        level: user.level || 1,
        currentXp: user.current_xp || 0,
        nextLevelXp: user.next_level_xp || 100,
        totalXpEarned: user.total_xp_earned || 0,
        role: user.role || "user",
      });
    } catch (error) {
      logger.error("❌ Erro ao atualizar perfil:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao atualizar perfil",
      });
    }
  }

  // ⚙️ UPDATE PREFERENCES

  static async updatePreferences(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
        return;
      }

      const { theme, language, notifications, shortcuts, dashboardLayout } =
        req.body;

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (theme !== undefined) {
        updates.push(`theme = $${paramIndex++}`);
        values.push(theme);
      }

      if (language !== undefined) {
        updates.push(`language = $${paramIndex++}`);
        values.push(language);
      }

      if (notifications !== undefined) {
        updates.push(`notifications = $${paramIndex++}`);
        values.push(JSON.stringify(notifications));
      }

      if (shortcuts !== undefined) {
        updates.push(`shortcuts = $${paramIndex++}`);
        values.push(JSON.stringify(shortcuts));
      }

      if (dashboardLayout !== undefined) {
        updates.push(`dashboard_layout = $${paramIndex++}`);
        values.push(JSON.stringify(dashboardLayout));
      }

      if (updates.length === 0) {
        res.status(400).json({
          success: false,
          message: "Nenhum campo para atualizar",
        });
        return;
      }

      updates.push(`updated_at = NOW()`);
      values.push(userId);

      await pool.query(
        `UPDATE user_preferences 
         SET ${updates.join(", ")}
         WHERE user_id = $${paramIndex}`,
        values,
      );

      logger.info(`✅ Preferências atualizadas: ${userId}`);

      res.json({
        success: true,
        message: "Preferências atualizadas com sucesso",
      });
    } catch (error) {
      logger.error("❌ Erro ao atualizar preferências:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao atualizar preferências",
      });
    }
  }

  // 📊 GET USER STATS

  static async getUserStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
        return;
      }

      const result = await pool.query(
        `SELECT 
          (SELECT COUNT(*) FROM nucleos WHERE user_id = $1 AND deleted_at IS NULL) as total_nucleos,
          (SELECT COUNT(*) FROM tarefas t JOIN blocos b ON t.bloco_id = b.id WHERE b.nucleo_id IN (SELECT id FROM nucleos WHERE user_id = $1) AND t.status = 'concluida') as total_tarefas_concluidas,
          (SELECT COUNT(*) FROM habitos h JOIN blocos b ON h.bloco_id = b.id WHERE b.nucleo_id IN (SELECT id FROM nucleos WHERE user_id = $1)) as total_habitos,
          (SELECT COUNT(*) FROM listas l JOIN blocos b ON l.bloco_id = b.id WHERE b.nucleo_id IN (SELECT id FROM nucleos WHERE user_id = $1)) as total_listas,
          (SELECT COALESCE(SUM(duracao_segundos), 0) FROM timers WHERE nucleo_id IN (SELECT id FROM nucleos WHERE user_id = $1)) as total_tempo_focado,
          (SELECT COALESCE(SUM(xp_amount), 0) FROM xp_logs WHERE user_id = $1) as total_xp_ganho,
          (SELECT COUNT(*) FROM streaks WHERE user_id = $1 AND current_streak > 0) as streaks_ativos
         FROM users WHERE id = $1`,
        [userId],
      );

      const stats = result.rows[0];

      res.json({
        success: true,
        data: {
          totalNucleos: parseInt(stats.total_nucleos) || 0,
          totalTarefasConcluidas: parseInt(stats.total_tarefas_concluidas) || 0,
          totalHabitos: parseInt(stats.total_habitos) || 0,
          totalListas: parseInt(stats.total_listas) || 0,
          totalTempoFocado: parseInt(stats.total_tempo_focado) || 0,
          totalXpGanho: parseInt(stats.total_xp_ganho) || 0,
          streaksAtivos: parseInt(stats.streaks_ativos) || 0,
        },
      });
    } catch (error) {
      logger.error("❌ Erro ao buscar estatísticas:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao buscar estatísticas",
      });
    }
  }

  // 🏆 GET USER ACHIEVEMENTS

  static async getUserAchievements(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
        return;
      }

      const result = await pool.query(
        `SELECT 
          c.id, c.nome, c.descricao, c.icone_url, c.xp_recompensa,
          uc.desbloqueado_em
         FROM conquistas c
         LEFT JOIN user_conquistas uc ON uc.conquista_id = c.id AND uc.user_id = $1
         ORDER BY uc.desbloqueado_em DESC NULLS LAST, c.created_at ASC`,
        [userId],
      );

      const achievements = result.rows.map((row) => ({
        id: row.id,
        nome: row.nome,
        descricao: row.descricao,
        iconeUrl: row.icone_url,
        xpRecompensa: row.xp_recompensa,
        desbloqueadoEm: row.desbloqueado_em,
        desbloqueado: !!row.desbloqueado_em,
      }));

      res.json({
        success: true,
        data: achievements,
      });
    } catch (error) {
      logger.error("❌ Erro ao buscar conquistas:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao buscar conquistas",
      });
    }
  }

  // 📜 GET XP LOGS

  static async getXpLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { limit = 50, page = 1 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
        return;
      }

      const offset = (Number(page) - 1) * Number(limit);

      const result = await pool.query(
        `SELECT 
          id, xp_amount, source, created_at, nucleo_id
         FROM xp_logs
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      );

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM xp_logs WHERE user_id = $1`,
        [userId],
      );

      const logs = result.rows.map((row) => ({
        id: row.id,
        xpAmount: row.xp_amount,
        source: row.source,
        createdAt: row.created_at,
        nucleoId: row.nucleo_id,
      }));

      res.json({
        success: true,
        data: logs,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(
            parseInt(countResult.rows[0].count) / Number(limit),
          ),
        },
      });
    } catch (error) {
      logger.error("❌ Erro ao buscar logs de XP:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao buscar logs de XP",
      });
    }
  }

  // 🔋 GET ENERGY LOGS

  static async getEnergyLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { limit = 50, page = 1 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
        return;
      }

      const offset = (Number(page) - 1) * Number(limit);

      const result = await pool.query(
        `SELECT 
          id, energy_amount, created_at, nucleo_id
         FROM energy_logs
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      );

      const logs = result.rows.map((row) => ({
        id: row.id,
        energyAmount: row.energy_amount,
        createdAt: row.created_at,
        nucleoId: row.nucleo_id,
      }));

      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      logger.error("❌ Erro ao buscar logs de energia:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao buscar logs de energia",
      });
    }
  }

  // 💳 GET CURRENT PLAN

  static async getCurrentPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
        return;
      }

      const result = await pool.query(
        `SELECT 
          p.id, p.name, p.max_nucleos, p.max_blocos_por_nucleo, p.max_membros_por_nucleo, p.price, p.features,
          s.started_at, s.expires_at, s.is_active, s.cancel_at_period_end
         FROM subscriptions s
         JOIN plans p ON s.plan_id = p.id
         WHERE s.user_id = $1 AND s.is_active = true
         LIMIT 1`,
        [userId],
      );

      if (result.rows.length === 0) {
        // Retornar plano free padrão
        const freePlan = await pool.query(
          `SELECT id, name, max_nucleos, max_blocos_por_nucleo, max_membros_por_nucleo, price, features
           FROM plans WHERE name = 'free' LIMIT 1`,
        );

        if (freePlan.rows.length > 0) {
          res.json({
            success: true,
            data: {
              ...freePlan.rows[0],
              isActive: false,
              message: "Usuário sem assinatura ativa. Plano free sugerido.",
            },
          });
          return;
        }

        res.status(404).json({
          success: false,
          message: "Nenhum plano encontrado",
        });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      logger.error("❌ Erro ao buscar plano:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao buscar plano",
      });
    }
  }

  // 📋 GET USER ACTIVITY LOGS

  static async getActivityLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { limit = 50, page = 1 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
        return;
      }

      const offset = (Number(page) - 1) * Number(limit);

      const result = await pool.query(
        `SELECT 
          id, acao, metadata, created_at
         FROM activity_logs
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      );

      const logs = result.rows.map((row) => ({
        id: row.id,
        acao: row.acao,
        metadata: row.metadata,
        createdAt: row.created_at,
      }));

      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      logger.error("❌ Erro ao buscar logs de atividade:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao buscar logs de atividade",
      });
    }
  }

  // 🗑️ DELETE ACCOUNT (SOFT DELETE)

  static async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
        return;
      }

      await pool.query(
        `UPDATE users 
         SET deleted_at = NOW(), active = false, updated_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL`,
        [userId],
      );

      logger.info(`🗑️ Conta deletada (soft delete): ${userId}`);

      res.status(204).send();
    } catch (error) {
      logger.error("❌ Erro ao deletar conta:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao deletar conta",
      });
    }
  }

  // 🔄 REACTIVATE ACCOUNT

  static async reactivateAccount(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
        return;
      }

      await pool.query(
        `UPDATE users 
         SET deleted_at = NULL, active = true, updated_at = NOW()
         WHERE id = $1 AND deleted_at IS NOT NULL`,
        [userId],
      );

      logger.info(`✅ Conta reativada: ${userId}`);

      res.json({
        success: true,
        message: "Conta reativada com sucesso",
      });
    } catch (error) {
      logger.error("❌ Erro ao reativar conta:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao reativar conta",
      });
    }
  }
}
