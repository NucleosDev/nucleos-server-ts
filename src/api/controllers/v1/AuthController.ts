import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { randomUUID } from "crypto";
import { env, jwtConfig } from "../../../config/env";
import { logger } from "../../../shared/utils/logger";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { CurrentUserService } from "../../../infrastructure/services/current-user.service";
import { NotificationsController } from "./NotificationsController";

interface UserTokenPayload extends JwtPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface RegisterBody {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  cpf?: string;
  nickname?: string;
}

interface LoginBody {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// ==
// FUNÇÕES HELPERS (CORRIGIDAS COM ISSUER E AUDIENCE)
// ==
const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

const cleanPhone = (phone: string | undefined): string | null => {
  if (!phone) return null;
  return phone.replace(/\D/g, "");
};

const cleanCpf = (cpf: string | undefined): string | null => {
  if (!cpf) return null;
  return cpf.replace(/\D/g, "");
};

const generateToken = (payload: UserTokenPayload) => {
  if (!jwtConfig.secret) {
    throw new Error("JWT secret não configurado");
  }

  const token = jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
    },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    } as SignOptions,
  );

  const expiresAt = new Date(
    Date.now() + env.JWT_EXPIRES_MINUTES * 60 * 1000,
  ).toISOString();

  return { token, expiresAt };
};

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1] ?? null;
};

// ==
// CONTROLLER
// ==
export class AuthController {
  private static currentUserService: CurrentUserService | null = null;

  static initialize(currentUserService: CurrentUserService): void {
    AuthController.currentUserService = currentUserService;
  }

  // =====
  // 📝 REGISTER (CORRIGIDO)
  // =====
  static async register(req: Request, res: Response): Promise<void> {
    const client = await pool.connect();

    try {
      const {
        email,
        fullName,
        password,
        confirmPassword,
        phone,
        cpf,
        nickname,
      } = req.body as RegisterBody;

      // Validações básicas
      if (!email || !password || !fullName) {
        res.status(400).json({
          success: false,
          message: "E-mail, nome e senha são obrigatórios",
        });
        return;
      }

      if (password !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: "As senhas não coincidem",
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "A senha deve ter pelo menos 6 caracteres",
        });
        return;
      }

      const normalizedEmail = normalizeEmail(email);
      const cleanPhoneNumber = cleanPhone(phone);
      const cleanCpfNumber = cleanCpf(cpf);

      // Verificar se email já existe
      const existingEmail = await client.query(
        "SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL",
        [normalizedEmail],
      );

      if (existingEmail.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: "E-mail já cadastrado",
        });
        return;
      }

      // Verificar se CPF já existe (se fornecido)
      if (cleanCpfNumber) {
        const existingCpf = await client.query(
          "SELECT id FROM users WHERE cpf = $1 AND deleted_at IS NULL",
          [cleanCpfNumber],
        );

        if (existingCpf.rows.length > 0) {
          res.status(409).json({
            success: false,
            message: "CPF já cadastrado",
          });
          return;
        }
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(password, 10);

      // Gerar IDs
      const userId = randomUUID();
      const profileId = randomUUID();
      const securityId = randomUUID();
      const roleId = randomUUID();
      const levelId = randomUUID();

      // Preparar dados
      const userNickname = nickname || fullName.split(" ")[0] || "Usuário";
      const avatarUrl = `https://ui-avatars.com/api/?background=random&color=fff&name=${encodeURIComponent(fullName)}`;

      // Buscar plano gratuito (free plan)
      const freePlanResult = await client.query(
        `SELECT id FROM plans WHERE name ILIKE '%free%' OR name ILIKE '%gratuito%' OR price = 0 LIMIT 1`,
      );

      let freePlanId: string | null = null;
      if (freePlanResult.rows.length > 0) {
        freePlanId = freePlanResult.rows[0].id;
      } else {
        // Se não existir plano free, criar um
        const newPlan = await client.query(
          `INSERT INTO plans (id, name, max_nucleos, price, created_at)
           VALUES ($1, $2, $3, $4, NOW())
           RETURNING id`,
          [randomUUID(), "Gratuito", 3, 0],
        );
        freePlanId = newPlan.rows[0].id;
      }

      // INICIAR TRANSAÇÃO
      await client.query("BEGIN");

      try {
        // 1. Inserir na tabela users
        await client.query(
          `INSERT INTO users (id, email, phone, cpf, password_hash, email_verified, active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
          [
            userId,
            normalizedEmail,
            cleanPhoneNumber || "",
            cleanCpfNumber || "",
            passwordHash,
            false,
            true,
          ],
        );

        // 2. Inserir na tabela user_profiles
        await client.query(
          `INSERT INTO user_profiles (id, user_id, full_name, nickname, avatar_url, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [profileId, userId, fullName, userNickname, avatarUrl],
        );

        // 3. Inserir na tabela user_security
        await client.query(
          `INSERT INTO user_security (id, user_id, failed_attempts, password_updated_at)
           VALUES ($1, $2, $3, NOW())`,
          [securityId, userId, 0],
        );

        // 4. Inserir na tabela user_roles (role padrão = 'user')
        await client.query(
          `INSERT INTO user_roles (id, user_id, role)
           VALUES ($1, $2, $3)`,
          [roleId, userId, "user"],
        );

        // 5. Inserir na tabela user_preferences
        await client.query(
          `INSERT INTO user_preferences (user_id, theme, language, notifications, shortcuts, dashboard_layout, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            userId,
            "system",
            "pt-BR",
            JSON.stringify({ push: true, email: true, streaks: true }),
            JSON.stringify({}),
            JSON.stringify({}),
          ],
        );

        // 6. Inserir na tabela user_levels (nível 1, XP 0)
        await client.query(
          `INSERT INTO user_levels (id, user_id, level, current_xp, next_level_xp, total_xp_earned, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [levelId, userId, 1, 0, 100, 0],
        );

        // 7. Inserir subscription (plano gratuito)
        if (freePlanId) {
          const subscriptionId = randomUUID();
          await client.query(
            `INSERT INTO subscriptions (id, user_id, plan_id, started_at, expires_at)
             VALUES ($1, $2, $3, NOW(), NULL)`,
            [subscriptionId, userId, freePlanId],
          );
        }

        // 8. Criar um núcleo padrão para o usuário começar
        const defaultNucleoId = randomUUID();
        await client.query(
          `INSERT INTO nucleos (id, user_id, nome, tipo, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [defaultNucleoId, userId, "Meu Primeiro Núcleo", "pessoal"],
        );

        // COMMIT DA TRANSAÇÃO
        await client.query("COMMIT");

        // Gerar token JWT com issuer e audience
        const { token, expiresAt } = generateToken({
          id: userId,
          email: normalizedEmail,
          fullName: fullName,
          role: "user",
        });

        logger.info(
          ` Novo usuário registrado: ${normalizedEmail} (ID: ${userId})`,
        );

        // Resposta no formato que o frontend espera
        res.status(201).json({
          success: true,
          message: "Usuário criado com sucesso!",
          token: token,
          refreshtoken: null,
          expiresAt: expiresAt,
          userId: userId,
          email: normalizedEmail,
          fullName: fullName,
          user: {
            id: userId,
            email: normalizedEmail,
            fullName: fullName,
            nickname: userNickname,
            avatarUrl: avatarUrl,
            level: 1,
            currentXp: 0,
            nextLevelXp: 100,
            emailVerified: false,
            active: true,
          },
        });
        return;
      } catch (dbError) {
        await client.query("ROLLBACK");
        throw dbError;
      }
    } catch (error) {
      logger.error("❌ Erro no registro:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao criar usuário",
        error:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      });
    } finally {
      client.release();
    }
  }

  // =====
  // 🔐 LOGIN (CORRIGIDO COM ISSUER E AUDIENCE)
  // =====
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, rememberMe } = req.body as LoginBody;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "E-mail e senha são obrigatórios",
        });
        return;
      }

      const normalizedEmail = normalizeEmail(email);

      // Buscar usuário com todas as informações necessárias
      const result = await pool.query(
        `SELECT 
          u.id, u.email, u.phone, u.cpf, u.password_hash, u.email_verified, u.active,
          up.full_name, up.nickname, up.avatar_url,
          us.failed_attempts, us.last_login,
          ur.role,
          ul.level, ul.current_xp, ul.next_level_xp, ul.total_xp_earned
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
         LEFT JOIN user_security us ON us.user_id = u.id
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         LEFT JOIN user_levels ul ON ul.user_id = u.id
         WHERE u.email = $1 AND u.deleted_at IS NULL`,
        [normalizedEmail],
      );

      if (result.rows.length === 0) {
        // Anti timing attack
        await bcrypt.compare(
          password,
          "$2b$10$fakehashfakehashfakehashfakehash",
        );
        res.status(401).json({
          success: false,
          message: "E-mail ou senha inválidos",
        });
        return;
      }

      const user = result.rows[0];

      // Verificar se usuário está ativo
      if (!user.active) {
        res.status(401).json({
          success: false,
          message: "Conta desativada. Entre em contato com o suporte.",
        });
        return;
      }

      // Verificar senha
      const passwordValid = await bcrypt.compare(password, user.password_hash);

      if (!passwordValid) {
        // Incrementar tentativas falhas
        await pool.query(
          `UPDATE user_security 
           SET failed_attempts = failed_attempts + 1
           WHERE user_id = $1`,
          [user.id],
        );

        // Verificar bloqueio após 5 tentativas
        const securityResult = await pool.query(
          `SELECT failed_attempts FROM user_security WHERE user_id = $1`,
          [user.id],
        );

        if (securityResult.rows[0]?.failed_attempts >= 5) {
          await pool.query(`UPDATE users SET active = false WHERE id = $1`, [
            user.id,
          ]);

          res.status(401).json({
            success: false,
            message:
              "Conta bloqueada por excesso de tentativas. Contate o suporte.",
          });
          return;
        }

        res.status(401).json({
          success: false,
          message: "E-mail ou senha inválidos",
        });
        return;
      }

      // Login bem-sucedido - resetar tentativas e atualizar last_login
      await pool.query(
        `UPDATE user_security 
         SET failed_attempts = 0, last_login = NOW()
         WHERE user_id = $1`,
        [user.id],
      );

      // Gerar token COM issuer e audience
      const expiresIn = rememberMe ? "7d" : jwtConfig.expiresIn;
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role || "user",
        },
        jwtConfig.secret,
        {
          expiresIn: expiresIn,
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience,
        } as SignOptions,
      );

      await NotificationsController.createNotification(
        user.id,
        "Você sabia que Nucleos surgiu de um projeto de faculdade? Loucura, não é?",
        `Que bom que você chegou ${user.fullName || user.email}, aproveite sua jornada hoje!`,
      );
      const expiresAt = new Date(
        Date.now() +
          (rememberMe
            ? 7 * 24 * 60 * 60 * 1000
            : env.JWT_EXPIRES_MINUTES * 60 * 1000),
      ).toISOString();

      logger.info(` Login realizado: ${user.email} (ID: ${user.id})`);

      // Resposta no formato que o frontend espera
      res.json({
        success: true,
        message: "Login realizado com sucesso!",
        token: token,
        refreshtoken: null,
        expiresAt: expiresAt,
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          cpf: user.cpf,
          phone: user.phone,
          level: user.level || 1,
          currentXp: user.current_xp || 0,
          nextLevelXp: user.next_level_xp || 100,
          totalXpEarned: user.total_xp_earned || 0,
          emailVerified: user.email_verified,
          active: user.active,
          role: user.role || "user",
        },
      });
      return;
    } catch (error) {
      logger.error("❌ Erro no login:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao realizar login",
      });
      return;
    }
  }

  // =====
  // 👤 ME (USUÁRIO ATUAL) - NOVA VERSÃO COM MEDIATOR
  // =====
  static async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Token inválido",
        });
        return;
      }

      const result = await pool.query(
        `SELECT 
        u.id, u.email, u.phone, u.cpf, u.email_verified, u.active, u.created_at,
        up.full_name, up.nickname, up.avatar_url,
        ul.level, ul.current_xp, ul.next_level_xp, ul.total_xp_earned,
        ur.role,
        s.plan_id, 
        p.name as plan_name,
        p.max_nucleos as plan_max_nucleos,
        p.max_blocos_por_nucleo as plan_max_blocos,
        p.max_membros_por_nucleo as plan_max_membros,
        p.features as plan_features,
        s.is_active as subscription_active,
        s.expires_at as subscription_expires_at
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      LEFT JOIN user_levels ul ON ul.user_id = u.id
      LEFT JOIN user_roles ur ON ur.user_id = u.id
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

      const plan = user.plan_name
        ? {
            id: user.plan_id,
            name: user.plan_name,
            maxNucleos: user.plan_max_nucleos,
            maxBlocosPorNucleo: user.plan_max_blocos,
            maxMembrosPorNucleo: user.plan_max_membros,
            features: user.plan_features,
            isActive: user.subscription_active,
            expiresAt: user.subscription_expires_at,
          }
        : null;

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          cpf: user.cpf,
          phone: user.phone,
          emailVerified: user.email_verified,
          active: user.active,
          role: user.role || "user",
          level: user.level || 1,
          currentXp: user.current_xp || 0,
          nextLevelXp: user.next_level_xp || 100,
          totalXpEarned: user.total_xp_earned || 0,
          plan: plan,
          createdAt: user.created_at,
        },
      });
      return;
    } catch (error: any) {
      logger.error("❌ Erro no me:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao buscar dados do usuário",
      });
      return;
    }
  }

  // Adicionar ao AuthController

  static async getMyPlan(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Não autenticado",
        });
        return;
      }

      const result = await pool.query(
        `SELECT 
        p.id, p.name, p.max_nucleos, p.max_blocos_por_nucleo, 
        p.max_membros_por_nucleo, p.price, p.features,
        s.started_at, s.expires_at, s.is_active, s.cancel_at_period_end
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.user_id = $1 AND s.is_active = true
      LIMIT 1`,
        [userId],
      );

      if (result.rows.length === 0) {
        // Usuário sem plano ativo - retornar plano free padrão
        const freePlan = await pool.query(
          `SELECT id, name, max_nucleos, max_blocos_por_nucleo, 
                max_membros_por_nucleo, price, features
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
      return;
    } catch (error) {
      logger.error("❌ Erro ao buscar plano:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao buscar plano",
      });
      return;
    }
  }

  // =====
  // 🔄 REFRESH TOKEN
  // =====
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const oldToken = extractToken(req);

      if (!oldToken) {
        res.status(401).json({
          success: false,
          message: "Token não fornecido",
        });
        return;
      }

      if (!jwtConfig.secret) {
        throw new Error("JWT secret não configurado");
      }

      const decoded = jwt.verify(oldToken, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }) as UserTokenPayload;

      // Verificar se usuário ainda existe e está ativo
      const userResult = await pool.query(
        `SELECT u.id, u.email, u.active, ur.role, up.full_name
         FROM users u
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         LEFT JOIN user_profiles up ON up.user_id = u.id
         WHERE u.id = $1 AND u.deleted_at IS NULL`,
        [decoded.id],
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].active) {
        res.status(401).json({
          success: false,
          message: "Usuário não encontrado ou inativo",
        });
        return;
      }

      const user = userResult.rows[0];

      const { token, expiresAt } = generateToken({
        id: user.id,
        email: user.email,
        fullName: user.full_name || decoded.fullName,
        role: user.role || "user",
      });

      res.json({
        success: true,
        token: token,
        refreshtoken: null,
        expiresAt: expiresAt,
      });
      return;
    } catch (error) {
      logger.error("❌ Erro no refresh:", error);
      res.status(401).json({
        success: false,
        message: "Token inválido ou expirado",
      });
      return;
    }
  }

  // =====
  // 🚪 LOGOUT
  // =====
  static async logout(req: Request, res: Response): Promise<void> {
    logger.info(`Logout realizado: ${(req as any).user?.email}`);
    res.json({
      success: true,
      message: "Logout realizado com sucesso",
    });
    return;
  }
}
