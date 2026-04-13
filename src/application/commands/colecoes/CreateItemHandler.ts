import { Item } from "../../../domain/entities/Item";
import { ItemValor } from "../../../domain/entities/ItemValor";
import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { CreateItemCommand } from "./CreateItemCommand";
import { ItemResponseDto } from "../../dto/colecao.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class CreateItemHandler {
  constructor(
    private readonly colecaoRepository: IColecaoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: CreateItemCommand): Promise<ItemResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar permissão via coleção
    const colecaoCheck = await pool.query(
      `SELECT c.id, n.user_id 
       FROM colecoes c
       JOIN blocos b ON c.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE c.id = $1`,
      [command.colecaoId],
    );

    if (colecaoCheck.rows.length === 0) {
      throw new Error("Coleção não encontrada");
    }

    if (colecaoCheck.rows[0].user_id !== userId) {
      throw new Error("Acesso negado");
    }

    // Buscar campos da coleção
    const campos = await this.colecaoRepository.findAllCamposByColecaoId(
      command.colecaoId,
    );

    // Criar item
    const item = Item.create({ colecaoId: command.colecaoId });
    await this.colecaoRepository.saveItem(item);

    // Criar valores para cada campo
    const valoresMap: Record<string, any> = {};

    for (const campo of campos) {
      const valor = command.valores[campo.id];
      let itemValor: ItemValor;

      switch (campo.tipoCampo) {
        case "texto":
          itemValor = ItemValor.create({
            itemId: item.id,
            campoId: campo.id,
            valorTexto: valor?.toString() || null,
          });
          break;
        case "numero":
          itemValor = ItemValor.create({
            itemId: item.id,
            campoId: campo.id,
            valorNumerico: valor !== undefined ? Number(valor) : null,
          });
          break;
        case "data":
          itemValor = ItemValor.create({
            itemId: item.id,
            campoId: campo.id,
            valorData: valor ? new Date(valor) : null,
          });
          break;
        case "booleano":
          itemValor = ItemValor.create({
            itemId: item.id,
            campoId: campo.id,
            valorBooleano: valor !== undefined ? Boolean(valor) : null,
          });
          break;
        default:
          itemValor = ItemValor.create({
            itemId: item.id,
            campoId: campo.id,
            valorTexto: valor?.toString() || null,
          });
      }

      await this.colecaoRepository.saveItemValor(itemValor);
      valoresMap[campo.id] = valor;
    }

    return {
      id: item.id,
      colecaoId: item.colecaoId,
      valores: valoresMap,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
