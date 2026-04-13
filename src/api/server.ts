import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import timeout from "connect-timeout";
import http from "http";
import { Server as SocketServer, Socket } from "socket.io";
import "dotenv/config";
import { env } from "../config/env";
import { logger } from "../shared/utils/logger";
import { router } from "./routes";
import { setupSocketHandlers } from "../api/socket/handles";
import { authenticateSocket } from "../api/socket/middleware";
import {
  pool,
  testDatabaseConnection,
} from "../infrastructure/persistence/db/connection";
import { setupRouteInterface } from "./routes/route-interface";
import { normalizeBodyMiddleware } from "./middlewares/normalize-body.middleware";

console.log("SERVER FILE EXECUTED");

interface CustomError extends Error {
  status?: number;
  code?: string;
}

const app: Express = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(normalizeBodyMiddleware); // <-- Converte PascalCase para camelCase

// CONFIG
const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV || "development";
const API_VERSION = env.API_VERSION || "v1";
const BASE_PATH = `/api/${API_VERSION}`;

const CORS_ORIGINS = env.CORS_ORIGINS
  ? env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "https://nucleos-ui.vercel.app"];

//
// ENV CHECK
//
console.log("ENV CHECK:");
console.log("CORS_ORIGINS raw:", env.CORS_ORIGINS);
console.log("CORS_ORIGINS parsed:", CORS_ORIGINS);
console.log("PORT:", env.PORT);
console.log("NODE_ENV:", env.NODE_ENV);

//
// MIDDLEWARE DE LOG DE REQUISIÇÕES (antes de tudo)
//
app.use((req, res, next) => {
  logger.info(
    `${req.method} ${req.url} - Origin: ${req.headers.origin || "sem origin"}`,
  );
  next();
});

//
// c CORS CORRIGIDO - VERSÃO MELHORADA
//
// Função para verificar origem permitida
const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true; // Permite requisições sem origin (curl, mobile, etc)

  // Em desenvolvimento, permite qualquer localhost
  if (NODE_ENV === "development") {
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      logger.info(`CORS permitido para ${origin} (modo desenvolvimento)`);
      return true;
    }
  }

  // Verifica se está na lista de permitidas
  const isAllowed = CORS_ORIGINS.includes(origin);
  if (isAllowed) {
    logger.info(`CORS permitido para: ${origin}`);
  } else {
    logger.warn(`CORS bloqueado: ${origin}`);
  }

  return isAllowed;
};

// Middleware CORS manual antes do cors() para garantir OPTIONS
app.use((req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, X-Request-ID",
    );
    res.header("Access-Control-Expose-Headers", "X-Request-ID");
  }

  if (req.method === "OPTIONS") {
    logger.info(`Preflight request para: ${req.url}`);
    res.status(204).end();
    return;
  }

  next();
});

// Configuração CORS com o pacote
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-ID",
      "Accept",
      "X-Requested-With",
    ],
    exposedHeaders: ["X-Request-ID"],
    optionsSuccessStatus: 204,
    preflightContinue: false,
  }),
);

//
// SEGURANÇA E UTIL
//
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite recursos cross-origin
    crossOriginOpenerPolicy: { policy: "unsafe-none" }, // Para desenvolvimento
  }),
);

app.use(compression());
app.use(timeout("30s"));

// Timeout handler
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (req.timedout) {
    res.status(503).json({
      success: false,
      message: "Request timeout",
    });
    return;
  }
  next();
});

//
// RATE LIMIT
//
const limiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: Number(env.RATE_LIMIT_MAX_REQUESTS) || 100000,
  skip: (req) => req.method === "OPTIONS", // Skip preflight requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Muitas requisições, tente novamente mais tarde",
  },
});
app.use("/api", limiter);

//
//  BODY PARSERS
//
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

//
// REQUEST ID
//
app.use((req, res, next) => {
  const id =
    (req.headers["x-request-id"] as string) ||
    `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  req.requestId = id;
  res.setHeader("X-Request-ID", id);
  next();
});

//
// MORGAN LOGGING
//
app.use(
  morgan("dev", {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  }),
);

//
// HEALTH CHECK
//
app.get("/health", async (req, res) => {
  const dbHealthy = await testDatabaseConnection();

  res.json({
    status: dbHealthy ? "healthy" : "degraded",
    database: dbHealthy ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    cors: CORS_ORIGINS,
  });
});

// ROOT endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Nucleos API",
    version: "1.0.0",
    basePath: BASE_PATH,
    environment: NODE_ENV,
    endpoints: {
      health: "/health",
      api: BASE_PATH,
      routes: "/routes",
    },
  });
});

//
// ROUTES UI
//
setupRouteInterface(app, BASE_PATH);

//
//  API ROUTES
//
app.use(BASE_PATH, router);

// Test endpoint para verificar CORS
app.options(`${BASE_PATH}/Auth/login`, (req, res) => {
  logger.info(`Preflight para /Auth/login`);
  res.status(204).end();
});

//
// 404 HANDLER
//
app.use("*", (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

//
//  ERROR HANDLER GLOBAL
//
app.use(
  (
    err: CustomError,
    req: Request,
    res: Response,
    _next: NextFunction,
  ): void => {
    if (err.message?.includes("CORS") || err.message?.includes("Origin")) {
      res.status(403).json({
        success: false,
        message: "Acesso não permitido pela política de CORS",
      });
      return;
    }

    res.status(err.status || 500).json({
      success: false,
      message:
        NODE_ENV === "production"
          ? "Erro interno do servidor"
          : err.message || "Erro interno",
      ...(NODE_ENV !== "production" && { stack: err.stack }),
    });
  },
);

//
//  SOCKET.IO SETUP
//
const httpServer = http.createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

io.use(authenticateSocket);

io.on("connection", (socket: Socket) => {
  logger.info(`Socket conectado: ${socket.id}`);
  setupSocketHandlers(io, socket);
  socket.on("disconnect", () => {
    logger.info(` Socket desconectado: ${socket.id}`);
  });
});

app.set("io", io);

//
//  START SERVER
//
let server: http.Server;

const startServer = async (port: number): Promise<void> => {
  try {
    // Test database connection
    const dbHealthy = await testDatabaseConnection();
    if (!dbHealthy) {
      logger.error("Database connection failed - check your credentials");
      throw new Error("Database connection failed");
    }
    logger.info("Database connected successfully");

    server = httpServer.listen(port, () => {
      logger.info(` Server rodando em http://localhost:${port}`);
      logger.info(`API disponível em http://localhost:${port}${BASE_PATH}`);
      logger.info(` CORS permitido para: ${CORS_ORIGINS.join(", ")}`);
      logger.info(`🔧 Ambiente: ${NODE_ENV}`);
      logger.info(`Health check: http://localhost:${port}/health`);
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        logger.error(`Porta ${port} já está em uso`);
        logger.info(`💡 Tente: lsof -ti :${port} | xargs kill -9`);
        process.exit(1);
      } else {
        logger.error("Erro no servidor:", err);
        process.exit(1);
      }
    });
  } catch (err) {
    logger.error("Erro ao iniciar servidor:", err);
    process.exit(1);
  }
};

//
// GRACEFUL SHUTDOWN
//
const shutdown = async (signal: string) => {
  logger.warn(`Recebido sinal ${signal}, encerrando servidor...`);

  const timeout = setTimeout(() => {
    logger.error("Timeout no shutdown, forçando saída");
    process.exit(1);
  }, 10000);

  try {
    // Fecha conexões Socket.IO
    await io.close();
    logger.info("Socket.IO fechado");

    // Fecha conexões do banco
    await pool.end();
    logger.info("Pool do banco fechado");

    // Fecha servidor HTTP
    if (server) {
      server.close(() => {
        logger.info("Servidor encerrado com sucesso");
        clearTimeout(timeout);
        process.exit(0);
      });
    } else {
      clearTimeout(timeout);
      process.exit(0);
    }
  } catch (err) {
    logger.error("Erro no shutdown:", err);
    clearTimeout(timeout);
    process.exit(1);
  }
};

// Process signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
  logger.error("💥 Unhandled Rejection:", reason);
  process.exit(1);
});

// Start the server
startServer(Number(PORT));

export { app, io, httpServer };
