import { Request, Response, NextFunction } from "express";
import { ParsedQs } from "qs";

/**
 * Converte strings de PascalCase para camelCase
 */
function pascalToCamel(str: string): string {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Type guard para verificar se é um objeto
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Normaliza um objeto, convertendo todas as chaves de PascalCase para camelCase
 */
function normalizeKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => normalizeKeys(item));
  }

  if (isObject(obj)) {
    const normalized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = pascalToCamel(key);
      normalized[newKey] = normalizeKeys(value);
    }

    return normalized;
  }

  return obj;
}

/**
 * Normaliza query params (mantendo a tipagem do Express)
 */
function normalizeQuery(query: ParsedQs): ParsedQs {
  const result: ParsedQs = {};

  for (const [key, value] of Object.entries(query)) {
    const newKey = pascalToCamel(key);
    if (Array.isArray(value)) {
      result[newKey] = value.map((v) => {
        if (isObject(v)) return normalizeQuery(v as ParsedQs);
        return v;
      });
    } else if (isObject(value)) {
      result[newKey] = normalizeQuery(value as ParsedQs);
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Normaliza params (aceita string ou string[])
 */
function normalizeParams(
  params: Record<string, string | string[]>,
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(params)) {
    const newKey = pascalToCamel(key);
    result[newKey] = value;
  }

  return result;
}

/**
 * Middleware que normaliza o body da requisição
 * Converte campos PascalCase para camelCase
 */
export const normalizeBodyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (isObject(req.body)) {
    req.body = normalizeKeys(req.body) as Record<string, unknown>;
  }
  next();
};

/**
 * Middleware que normaliza body, query e params
 */
export const normalizeAllMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Normaliza body
  if (isObject(req.body)) {
    req.body = normalizeKeys(req.body) as Record<string, unknown>;
  }

  // Normaliza query (com tipagem correta)
  if (req.query && typeof req.query === "object") {
    req.query = normalizeQuery(req.query);
  }

  // Normaliza params (com tipagem correta)
  if (req.params && typeof req.params === "object") {
    req.params = normalizeParams(req.params) as any;
  }

  next();
};
