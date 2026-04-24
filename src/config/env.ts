// src/config/env.ts
import "dotenv/config";
import { z } from "zod";

// SCHEMA DE VALIDAÇÃO - SMTP AGORA OPCIONAL
const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("5000"),
  API_VERSION: z.string().default("v1"),

  // Supabase Database
  SUPABASE_HOST: z.string().min(1, "SUPABASE_HOST é obrigatório"),
  SUPABASE_PORT: z.string().transform(Number).default("5432"),
  SUPABASE_DATABASE: z.string().min(1, "SUPABASE_DATABASE é obrigatório"),
  SUPABASE_USERNAME: z.string().min(1, "SUPABASE_USERNAME é obrigatório"),
  SUPABASE_PASSWORD: z.string().min(1, "SUPABASE_PASSWORD é obrigatório"),

  // JWT
  JWT_KEY: z.string().min(32, "JWT_KEY deve ter no mínimo 32 caracteres"),
  JWT_ISSUER: z.string().url("JWT_ISSUER deve ser uma URL válida"),
  JWT_AUDIENCE: z.string().url("JWT_AUDIENCE deve ser uma URL válida"),
  JWT_EXPIRES_MINUTES: z.string().transform(Number).default("90"),

  // Redis (opcional)
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().transform(Number).default("6379"),
  REDIS_PASSWORD: z.string().optional(),

  // Email - AGORA OPCIONAL (só valida se existir)
  SMTP_HOST: z.string().optional().default("smtp.gmail.com"),
  SMTP_PORT: z.string().transform(Number).optional().default("587"),
  SMTP_USER: z.string().optional().default("dev@nucleos.com"),
  SMTP_PASS: z.string().optional().default("temp"),
  EMAIL_FROM: z.string().optional().default("noreply@nucleos.com"),

  // CORS
  CORS_ORIGINS: z.string().optional().default("http://localhost:3000"),

  // Rate Limit
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default("100000"),
});

// ==
// VALIDAÇÃO E EXPORT
// ==
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Erro na configuração das variáveis de ambiente:");
  console.error(parsedEnv.error.format());

  // Em desenvolvimento, não dar erro fatal
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "⚠️ Continuando com configurações padrão (modo desenvolvimento)",
    );
  } else {
    throw new Error("Configuração de ambiente inválida");
  }
}

// Usar valores padrão se falhar
const envData = parsedEnv.success
  ? parsedEnv.data
  : {
      NODE_ENV: "development",
      PORT: 5000,
      API_VERSION: "v1",
      SUPABASE_HOST: process.env.SUPABASE_HOST || "",
      SUPABASE_PORT: 5432,
      SUPABASE_DATABASE: process.env.SUPABASE_DATABASE || "",
      SUPABASE_USERNAME: process.env.SUPABASE_USERNAME || "",
      SUPABASE_PASSWORD: process.env.SUPABASE_PASSWORD || "",
      JWT_KEY: process.env.JWT_KEY || "default-jwt-key-for-development-only",
      JWT_ISSUER: process.env.JWT_ISSUER || "http://localhost:5000",
      JWT_AUDIENCE: process.env.JWT_AUDIENCE || "http://localhost:3000",
      JWT_EXPIRES_MINUTES: 90,
      REDIS_HOST: "localhost",
      REDIS_PORT: 6379,
      REDIS_PASSWORD: undefined,
      SMTP_HOST: "smtp.gmail.com",
      SMTP_PORT: 587,
      SMTP_USER: "dev@nucleos.com",
      SMTP_PASS: "temp",
      EMAIL_FROM: "noreply@nucleos.com",
      CORS_ORIGINS: "http://localhost:3000",
      RATE_LIMIT_WINDOW_MS: 900000,
      RATE_LIMIT_MAX_REQUESTS: 100000,
    };

export const env = parsedEnv.success ? parsedEnv.data : envData;

// TIPOS PARA O ENV
export type Env = z.infer<typeof envSchema>;

// CONFIGURAÇÕES DERIVADAS
export const dbConfig = {
  host: env.SUPABASE_HOST,
  port: env.SUPABASE_PORT,
  database: env.SUPABASE_DATABASE,
  user: env.SUPABASE_USERNAME,
  password: env.SUPABASE_PASSWORD,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const jwtConfig = {
  secret: env.JWT_KEY,
  expiresIn: `${env.JWT_EXPIRES_MINUTES}m`,
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
};

export const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};

export const emailConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  from: env.EMAIL_FROM,
};

export const corsConfig = {
  origins: env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
  maxAge: 86400,
};

export const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

// VALIDAÇÕES ADICIONAIS
export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

// LOG DE CONFIGURAÇÃO (apenas em desenvolvimento)
if (isDevelopment) {
  console.log(" Variáveis de ambiente carregadas com sucesso");
  console.log(`Ambiente: ${env.NODE_ENV}`);
  console.log(`Porta: ${env.PORT}`);
  console.log(
    `Banco: ${env.SUPABASE_HOST}:${env.SUPABASE_PORT}/${env.SUPABASE_DATABASE}`,
  );
  console.log(`JWT: ${env.JWT_KEY ? "Configurado" : "Não configurado"}`);
  console.log(
    `Email: ${env.SMTP_USER || "Desabilitado (modo desenvolvimento)"}`,
  );
  console.log(`CORS: ${corsConfig.origins.join(", ")}`);
}
