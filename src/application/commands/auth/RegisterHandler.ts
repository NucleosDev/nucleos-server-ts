import { RegisterCommand } from "../../commands/auth/RegisterCommand";
import { AuthResponseDto } from "../../dto/auth-response.dto";
import bcrypt from "bcrypt";
import { User } from "../../../domain/entities/User";

export class RegisterHandler {
  constructor(
    private userRepository: any, // Será tipado corretamente depois
    private jwtService: any, // Será tipado corretamente depois
  ) {}

  async execute(command: RegisterCommand): Promise<AuthResponseDto> {
    const { email, password, confirmPassword, fullName, cpf, phone, nickname } =
      command;

    // Validações obrigatórias
    if (!email || !password || !fullName || !cpf) {
      return {
        success: false,
        message: "Dados obrigatórios não informados",
      };
    }

    // Validar CPF (formato)
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      return {
        success: false,
        message: "CPF inválido",
      };
    }

    // Validar senha
    if (password !== confirmPassword) {
      return {
        success: false,
        message: "As senhas não coincidem",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "A senha deve ter pelo menos 6 caracteres",
      };
    }

    // Verificar se email já existe
    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      return {
        success: false,
        message: "E-mail já cadastrado",
      };
    }

    // Verificar se CPF já existe
    const cpfExists = await this.userRepository.existsByCpf(cleanCpf);
    if (cpfExists) {
      return {
        success: false,
        message: "CPF já cadastrado",
      };
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar usuário (construtor já cria profile, security, preference, level, role)
    const user = new User({
      email,
      phone: phone || ""
      
      
      ,
      cpf: cleanCpf,
      passwordHash,
      fullName,
      nickname,
    });

    // Salvar usuário e todas as relações
    await this.userRepository.saveWithRelations(user);

    // Gerar token
    const token = this.jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: "user",
    });

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    return {
      success: true,
      message: "Usuário registrado com sucesso!",
      token,
      expiresAt: expiresAt.toISOString(),
      userId: user.id,
      email: user.email,
      fullName: user.profile?.fullName,
      cpf: user.cpf,
      phone: user.phone,
    };
  }
}
