import { env } from "./env.js";

export const databaseConfig = {
  host: env.SUPABASE_HOST,
  port: env.SUPABASE_PORT,
  database: env.SUPABASE_DATABASE,
  user: env.SUPABASE_USERNAME,
  password: env.SUPABASE_PASSWORD,
  ssl:
    env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
};
