import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { GetNucleosQuery } from "./GetNucleosQuery";
import { NucleoResponseDto } from "../../dto/nucleo.dto";
import { NucleoIconRepository } from "../../../infrastructure/persistence/repositories/NucleoIconRepository";
import {
  getCache,
  setCache,
  CacheKeys,
  TTL,
} from "../../../infrastructure/cache/redis.service";

export class GetNucleosHandler {
  constructor(
    private readonly nucleoRepository: INucleoRepository,
    private readonly nucleoIconRepository: NucleoIconRepository,
  ) {}

  async execute(query: GetNucleosQuery): Promise<NucleoResponseDto[]> {
    const cacheKey = CacheKeys.nucleosByUser(query.userId);
    const cached = await getCache<NucleoResponseDto[]>(cacheKey);
    if (cached) return cached;

    const nucleos = await this.nucleoRepository.findAllByUserId(query.userId);

    const result: NucleoResponseDto[] = [];
    for (const nucleo of nucleos) {
      let iconName: string | null = null;
      if (nucleo.iconId) {
        const icon = await this.nucleoIconRepository.findById(nucleo.iconId);
        iconName = icon?.name ?? null;
      }

      result.push({
        id: nucleo.id,
        userId: nucleo.userId,
        nome: nucleo.nome,
        descricao: nucleo.descricao,
        tipo: nucleo.tipo,
        corDestaque: nucleo.corDestaque,
        imagemCapa: nucleo.imagemCapa,
        iconId: iconName,
        createdAt: nucleo.createdAt,
        updatedAt: nucleo.updatedAt,
        deletedAt: nucleo.deletedAt,
      });
    }

    await setCache(cacheKey, result, TTL.DEFAULT);
    return result;
  }
}
