export const ERRORS = {
  // Auth
  INVALID_CREDENTIALS: "E-mail ou senha inválidos",
  EMAIL_ALREADY_EXISTS: "E-mail já cadastrado",
  CPF_ALREADY_EXISTS: "CPF já cadastrado",
  ACCOUNT_DISABLED: "Conta desativada. Entre em contato com o suporte.",
  ACCOUNT_BLOCKED: "Conta bloqueada por excesso de tentativas.",
  TOKEN_MISSING: "Token não fornecido",
  TOKEN_INVALID: "Token inválido",
  TOKEN_EXPIRED: "Token expirado. Faça login novamente.",
  // Validation
  REQUIRED_FIELDS: "Dados obrigatórios não informados",
  PASSWORDS_DONT_MATCH: "As senhas não coincidem",
  PASSWORD_TOO_SHORT: "A senha deve ter pelo menos 6 caracteres",
  INVALID_CPF: "CPF inválido",
  // Resources
  NOT_FOUND: (resource: string) => `${resource} não encontrado`,
  FORBIDDEN: "Acesso negado. Permissão insuficiente.",
  // Business
  NUCLEO_LIMIT_REACHED: "Limite de núcleos atingido no plano gratuito",
  // Server
  INTERNAL_ERROR: "Erro interno do servidor",
} as const;
