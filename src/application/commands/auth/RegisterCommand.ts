export class RegisterCommand {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  cpf: string;
  nickname?: string;

  constructor(params: {
    email: string;
    fullName: string;
    password: string;
    confirmPassword: string;
    cpf: string;
    phone?: string;
    nickname?: string;
  }) {
    this.email = params.email;
    this.fullName = params.fullName;
    this.password = params.password;
    this.confirmPassword = params.confirmPassword;
    this.cpf = params.cpf;
    this.phone = params.phone;
    this.nickname = params.nickname;
  }
}
