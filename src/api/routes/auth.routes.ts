import { Router } from "express";
import { AuthController } from "../controllers/v1/AuthController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

//
// SCHEMAS
//

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6),
    fullName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    phone: z.string().optional(),
    cpf: z.string().optional(),
  })
  .refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

//
// ROTAS PÚBLICAS
//

router.post("/login", validate(loginSchema), AuthController.login);
router.post("/register", validate(registerSchema), AuthController.register);
router.post("/refresh-token", AuthController.refreshToken);

//
// ROTAS PROTEGIDAS
//
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/me", authMiddleware, AuthController.me);
router.get("/me/plan", AuthController.getMyPlan);

export { router as authRoutes };
