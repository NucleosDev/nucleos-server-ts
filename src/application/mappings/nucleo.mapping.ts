import { Nucleo } from "../../domain/entities/Nucleo";
import { NucleoDTO, NucleoResponseDto } from "../dto/nucleo.dto";

export class NucleoMapper {
  static toDTO(nucleo: Nucleo): NucleoDTO {
    return {
      id: nucleo.id,
      userId: nucleo.userId,
      nome: nucleo.nome,
      descricao: nucleo.descricao,
      tipo: nucleo.tipo,
      corDestaque: nucleo.corDestaque,
      imagemCapa: nucleo.imagemCapa,
      iconId: nucleo.iconId,
      createdAt: nucleo.createdAt,
      updatedAt: nucleo.updatedAt,
      deletedAt: nucleo.deletedAt,
    };
  }

  static toResponseDto(nucleo: Nucleo): NucleoResponseDto {
    return {
      id: nucleo.id,
      userId: nucleo.userId,
      nome: nucleo.nome,
      descricao: nucleo.descricao,
      tipo: nucleo.tipo,
      corDestaque: nucleo.corDestaque,
      imagemCapa: nucleo.imagemCapa,
      iconId: nucleo.iconId,
      createdAt: nucleo.createdAt,
      updatedAt: nucleo.updatedAt,
      deletedAt: nucleo.deletedAt,
    };
  }

  static toDTOList(nucleos: Nucleo[]): NucleoDTO[] {
    return nucleos.map((n) => NucleoMapper.toDTO(n));
  }
}
