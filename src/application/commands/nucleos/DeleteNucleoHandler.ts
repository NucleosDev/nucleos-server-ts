import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { DeleteNucleoCommand } from "./DeleteNucleoCommand";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class DeleteNucleoHandler {
  constructor(
    private readonly nucleoRepository: INucleoRepository,
    // ✅ REMOVA o CurrentUserService
  ) {}

  async execute(command: DeleteNucleoCommand): Promise<void> {
    // ✅ USA O userId DO COMMAND
    const { id, userId } = command;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const nucleo = await this.nucleoRepository.findById(id, userId);

    if (!nucleo) {
      throw new NotFoundException("Núcleo", id);
    }

    // Verificar se o usuário é o dono
    if (nucleo.userId !== userId) {
      throw new ForbiddenException(
        "Você não tem permissão para deletar este núcleo",
      );
    }

    await this.nucleoRepository.delete(id, userId);
  }
}
