import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { UpdateItemCommand } from "./UpdateItemCommand";
import { ItemResponseDto } from "../../dto/colecao.dto";
import { ItemValor } from "../../../domain/entities/ItemValor";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class UpdateItemHandler {
  constructor(
    private readonly colecaoRepository: IColecaoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: UpdateItemCommand): Promise<ItemResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const item = await this.colecaoRepository.findItemById(command.id);
    if (!item) {
      throw new Error("Item não encontrado");
    }

    // Verificar permissão via coleção
    const colecaoCheck = await pool.query(
      `SELECT n.user_id 
       FROM itens i
       JOIN colecoes c ON i.colecao_id = c.id
       JOIN blocos b ON c.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE i.id = $1`,
      [command.id],
    );

    if (colecaoCheck.rows[0]?.user_id !== userId) {
      throw new Error("Acesso negado");
    }

    // Buscar campos da coleção
    const campos = await this.colecaoRepository.findAllCamposByColecaoId(
      item.colecaoId,
    );

    // Atualizar valores
    const valoresMap: Record<string, any> = {};

    for (const campo of campos) {
      const valor = command.valores[campo.id];
      let itemValor = await this.colecaoRepository.findItemValorByItemAndCampo(
        command.id,
        campo.id,
      );

      if (itemValor) {
        // Atualizar valor existente
        switch (campo.tipoCampo) {
          case "texto":
            itemValor.updateValorTexto(valor?.toString() || null);
            break;
          case "numero":
            itemValor.updateValorNumerico(
              valor !== undefined ? Number(valor) : null,
            );
            break;
          case "data":
            itemValor.updateValorData(valor ? new Date(valor) : null);
            break;
          case "booleano":
            itemValor.updateValorBooleano(
              valor !== undefined ? Boolean(valor) : null,
            );
            break;
        }
        await this.colecaoRepository.updateItemValor(itemValor);
      } else {
        // Criar novo valor
        let newItemValor: any;
        switch (campo.tipoCampo) {
          case "texto":
            newItemValor = ItemValor.create({
              itemId: command.id,
              campoId: campo.id,
              valorTexto: valor?.toString() || null,
            });
            break;
          case "numero":
            newItemValor = ItemValor.create({
              itemId: command.id,
              campoId: campo.id,
              valorNumerico: valor !== undefined ? Number(valor) : null,
            });
            break;
          case "data":
            newItemValor = ItemValor.create({
              itemId: command.id,
              campoId: campo.id,
              valorData: valor ? new Date(valor) : null,
            });
            break;
          case "booleano":
            newItemValor = ItemValor.create({
              itemId: command.id,
              campoId: campo.id,
              valorBooleano: valor !== undefined ? Boolean(valor) : null,
            });
            break;
          default:
            newItemValor = ItemValor.create({
              itemId: command.id,
              campoId: campo.id,
              valorTexto: valor?.toString() || null,
            });
        }
        await this.colecaoRepository.saveItemValor(newItemValor);
      }
      valoresMap[campo.id] = valor;
    }

    await this.colecaoRepository.updateItem(item);

    return {
      id: item.id,
      colecaoId: item.colecaoId,
      valores: valoresMap,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
