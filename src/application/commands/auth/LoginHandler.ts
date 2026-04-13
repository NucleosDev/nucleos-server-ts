import { LoginCommand } from "../../commands/auth/LoginCommand";
import { AuthResponseDto } from "../../dto/auth-response.dto";
import bcrypt from "bcrypt";
import { User } from "../../../domain/entities/User";

export class LoginHandler {
  constructor(
    private userRepository: any, // Será tipado corretamente depois
    private jwtService: any, // Será tipado corretamente depois
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const { email, password, rememberMe } = command;

    // Validação básica
    if (!email || !password) {
      return {
        success: false,
        message: "E-mail ou senha inválidos",
      };
    }

    // Buscar usuário com todas as relações
    const user = await this.userRepository.findByEmailWithRelations(email);

    // Anti enumeração de usuário (timing attack)
    if (!user) {
      await bcrypt.compare(password, "$2b$10$fakehashfakehashfakehashfakehash");
      return {
        success: false,
        message: "E-mail ou senha inválidos",
      };
    }

    // Verificar se usuário está ativo
    if (!user.active) {
      return {
        success: false,
        message: "Conta desativada. Entre em contato com o suporte.",
      };
    }

    // Verificar senha
    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      // Incrementar tentativas falhas
      user.incrementFailedAttempts();

      // Verificar bloqueio após 5 tentativas
      if (user.security && user.security.failedAttempts >= 5) {
        user.deactivate();
        await this.userRepository.save(user);

        return {
          success: false,
          message:
            "Conta bloqueada por excesso de tentativas. Contate o suporte.",
        };
      }

      await this.userRepository.save(user);

      return {
        success: false,
        message: "E-mail ou senha inválidos",
      };
    }

    // Login bem-sucedido
    user.resetFailedAttempts();
    user.updateLastLogin();
    await this.userRepository.save(user);

    // Gerar token
    const expiresAt = rememberMe
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 60 * 60 * 1000);

    const token = this.jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.roles[0]?.role ?? "user",
    });

    return {
      success: true,
      message: "Login realizado com sucesso!",
      token,
      expiresAt: expiresAt.toISOString(),
      userId: user.id,
      email: user.email,
      fullName: user.profile?.fullName,
      cpf: user.cpf,
      phone: user.phone,
      level: user.level?.level,
      currentXp: user.level?.currentXp,
      nextLevelXp: user.level?.nextLevelXp,
    };
  }
}
