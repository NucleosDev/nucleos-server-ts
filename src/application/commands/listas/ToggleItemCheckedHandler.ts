import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { ToggleItemCheckedCommand } from "./ToggleItemCheckedCommand";
import { ItemListaResponseDto } from "../../dto/lista.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class ToggleItemCheckedHandler {
  constructor(
    private readonly listaRepository: IListaRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(
    command: ToggleItemCheckedCommand,
  ): Promise<ItemListaResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const item = await this.listaRepository.findItemById(command.id);
    if (!item) {
      throw new Error("Item não encontrado");
    }

    // Verificar permissão via lista
    const listaCheck = await pool.query(
      `SELECT n.user_id 
       FROM listas l
       JOIN blocos b ON l.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE l.id = $1`,
      [item.listaId],
    );

    if (listaCheck.rows[0]?.user_id !== userId) {
      throw new Error("Acesso negado");
    }

    if (command.checked !== undefined) {
      item.setChecked(command.checked);
    } else {
      item.toggleChecked();
    }

    await this.listaRepository.updateItem(item);

    return {
      id: item.id,
      listaId: item.listaId,
      categoriaId: item.categoriaId,
      nome: item.nome,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
      checked: item.checked,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
