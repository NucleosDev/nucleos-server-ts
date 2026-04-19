import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env, jwtConfig } from "../../config/env";
import { logger } from "../../shared/utils/logger";
import { pool } from "../../infrastructure/persistence/db/connection";

// ==
// TIPOS
// ==

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  requestId?: string;
}

// ==
// FUNÇÃO AUXILIAR
// ==

function extractUserFromToken(decoded: any): AuthUser | null {
  const userId = decoded.sub || decoded.id;
  const userEmail = decoded.email;
  const userFullName = decoded.fullName || decoded.name || userEmail;
  const userRole = decoded.role || "user";

  if (!userId || !userEmail) return null;

  return {
    id: userId,
    email: userEmail,
    fullName: userFullName,
    role: userRole,
  };
}

// ==
// MIDDLEWARE PRINCIPAL
// ==

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const requestId = (req as any).requestId || "no-id";
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn(`🔒 [${requestId}] Token não fornecido`);
    res.status(401).json({
      success: false,
      message: "Token não fornecido",
      code: "MISSING_TOKEN",
    });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || !parts[1] || parts[1].trim() === "") {
    logger.warn(`🔒 [${requestId}] Token mal formatado`);
    res.status(401).json({
      success: false,
      message: "Token mal formatado",
      code: "INVALID_TOKEN_FORMAT",
    });
    return;
  }

  const token = parts[1].trim();

  if (!jwtConfig.secret) {
    logger.error("❌ JWT_KEY não configurada");
    res.status(500).json({
      success: false,
      message: "Erro interno de configuração",
      code: "CONFIG_ERROR",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as any;

    const user = extractUserFromToken(decoded);
    if (!user) {
      logger.warn(`🔒 [${requestId}] Payload inválido`);
      res.status(401).json({
        success: false,
        message: "Token inválido",
        code: "INVALID_PAYLOAD",
      });
      return;
    }

    (req as AuthRequest).user = user;
    logger.debug(
      ` [${requestId}] Token validado: ${user.email} (${user.role})`,
    );
    next();
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn(`🔒 [${requestId}] Token expirado`);
      res.status(401).json({
        success: false,
        message: "Token expirado. Faça login novamente.",
        code: "TOKEN_EXPIRED",
      });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(`🔒 [${requestId}] Token inválido: ${error.message}`);
      res.status(401).json({
        success: false,
        message: "Token inválido",
        code: "INVALID_TOKEN",
      });
      return;
    }
    logger.error(`❌ [${requestId}] Erro na validação do token:`, error);
    res.status(401).json({
      success: false,
      message: "Erro ao validar token",
      code: "VALIDATION_ERROR",
    });
  }
};

// ==
// MIDDLEWARE COM VERIFICAÇÃO DE BANCO
// ==

export const authMiddlewareWithDbCheck = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const requestId = (req as any).requestId || "no-id";
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn(`🔒 [${requestId}] Token não fornecido`);
    res.status(401).json({
      success: false,
      message: "Token não fornecido",
      code: "MISSING_TOKEN",
    });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || !parts[1] || parts[1].trim() === "") {
    logger.warn(`🔒 [${requestId}] Token mal formatado`);
    res.status(401).json({
      success: false,
      message: "Token mal formatado",
      code: "INVALID_TOKEN_FORMAT",
    });
    return;
  }

  const token = parts[1].trim();

  if (!jwtConfig.secret) {
    logger.error("❌ JWT_KEY não configurada");
    res.status(500).json({
      success: false,
      message: "Erro interno de configuração",
      code: "CONFIG_ERROR",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as any;

    let user = extractUserFromToken(decoded);
    if (!user) {
      logger.warn(`🔒 [${requestId}] Payload inválido`);
      res.status(401).json({
        success: false,
        message: "Token inválido",
        code: "INVALID_PAYLOAD",
      });
      return;
    }

    // Verificar no banco
    try {
      const result = await pool.query(
        `SELECT u.id, u.email, u.active, up.full_name, ur.role
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         WHERE u.id = $1 AND u.deleted_at IS NULL`,
        [user.id],
      );

      if (result.rows.length === 0) {
        logger.warn(`🔒 [${requestId}] Usuário não encontrado: ${user.id}`);
        res.status(401).json({
          success: false,
          message: "Usuário não encontrado",
          code: "USER_NOT_FOUND",
        });
        return;
      }

      const dbUser = result.rows[0];
      if (!dbUser.active) {
        logger.warn(`🔒 [${requestId}] Usuário inativo: ${user.id}`);
        res.status(401).json({
          success: false,
          message: "Usuário inativo",
          code: "USER_INACTIVE",
        });
        return;
      }

      user = {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.full_name,
        role: dbUser.role || user.role,
      };
    } catch (dbError) {
      logger.error(
        `❌ [${requestId}] Erro ao verificar usuário no banco:`,
        dbError,
      );
      // fallback: usa os dados do token
    }

    (req as AuthRequest).user = user;
    logger.debug(` [${requestId}] Token validado (com DB): ${user.email}`);
    next();
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn(`🔒 [${requestId}] Token expirado`);
      res.status(401).json({
        success: false,
        message: "Token expirado",
        code: "TOKEN_EXPIRED",
      });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(`🔒 [${requestId}] Token inválido: ${error.message}`);
      res.status(401).json({
        success: false,
        message: "Token inválido",
        code: "INVALID_TOKEN",
      });
      return;
    }
    logger.error(`❌ [${requestId}] Erro na validação:`, error);
    res.status(401).json({
      success: false,
      message: "Erro ao validar token",
      code: "VALIDATION_ERROR",
    });
  }
};

// ==
// MIDDLEWARE OPCIONAL (NÃO BLOQUEIA)
// ==

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

  const token = authHeader.split(" ")[1];
  if (!token || !jwtConfig.secret) return next();

  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as any;
    const user = extractUserFromToken(decoded);
    if (user) (req as AuthRequest).user = user;
  } catch (error) {
    // ignora
  }
  next();
};

// ==
// MIDDLEWARE ADMIN
// ==

export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await authMiddlewareWithDbCheck(req, res, (err) => {
    if (err) return next(err);
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, message: "Não autenticado" });
      return;
    }
    if (user.role !== "admin") {
      res
        .status(403)
        .json({ success: false, message: "Acesso negado: admin necessário" });
      return;
    }
    next();
  });
};

// ==
// ALIAS PARA COMPATIBILIDADE (depois das declarações)
// ==

export const authenticate = authMiddleware;
export const optionalAuthenticate = optionalAuthMiddleware;
export const requireAdmin = adminAuthMiddleware;

// ==
// MIDDLEWARE PARA ROLES
// ==

export const requireRole = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, message: "Não autenticado" });
      return;
    }
    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: `Acesso negado. Necessário: ${roles.join(", ")}`,
        code: "FORBIDDEN",
      });
      return;
    }
    next();
  };
};

// ==
// MIDDLEWARE PARA PERMISSÕES
// ==

export const requirePermission = (permission: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await authMiddlewareWithDbCheck(req, res, (err) => {
      if (err) return next(err);
      const user = (req as AuthRequest).user;
      if (!user) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }
      if (user.role === "admin") return next();
      if (user.role !== permission) {
        res.status(403).json({
          success: false,
          message: `Permissão necessária: ${permission}`,
        });
        return;
      }
      next();
    });
  };
};

// ==
// MIDDLEWARE PARA PROPRIEDADE DE NÚCLEO
// ==

export const requireNucleoOwnership = (paramName: string = "id") => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const nucleoId = req.params[paramName];
    if (!nucleoId) {
      res
        .status(400)
        .json({ success: false, message: "ID do núcleo não fornecido" });
      return;
    }

    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, message: "Não autenticado" });
      return;
    }

    try {
      const result = await pool.query(
        `SELECT user_id FROM nucleos WHERE id = $1 AND deleted_at IS NULL`,
        [nucleoId],
      );
      if (result.rows.length === 0) {
        res
          .status(404)
          .json({ success: false, message: "Núcleo não encontrado" });
        return;
      }
      if (result.rows[0].user_id !== user.id && user.role !== "admin") {
        res
          .status(403)
          .json({ success: false, message: "Você não é o dono deste núcleo" });
        return;
      }
      next();
    } catch (error) {
      logger.error("Erro ao verificar propriedade:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  };
};
