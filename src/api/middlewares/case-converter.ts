import { Request, Response, NextFunction } from "express";

// Converte as chaves de um objeto de PascalCase para camelCase

function convertKeysToCamel(obj: any): any {
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamel(item));
  }

  const newObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    newObj[camelKey] = convertKeysToCamel(value);
  }
  return newObj;
}

// Middleware que converte o body da requisição de PascalCase para camelCase

export function caseConverterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.body && typeof req.body === "object") {
    req.body = convertKeysToCamel(req.body);
  }
  next();
}
