import { TreinoTemplate } from "../entities/TreinoTemplate";
import { TreinoExercicio } from "../entities/TreinoExercicio";

export interface IExerciciosRepository {
  // TreinoTemplate
  saveTemplate(template: TreinoTemplate): Promise<void>;
  findTemplateById(id: string): Promise<TreinoTemplate | null>;
  findTemplatesByBlocoId(blocoId: string): Promise<TreinoTemplate[]>;
  updateTemplate(template: TreinoTemplate): Promise<void>;
  deleteTemplate(id: string): Promise<void>;

  // TreinoExercicio
  saveExercicio(exercicio: TreinoExercicio): Promise<void>;
  findExerciciosByTemplateId(templateId: string): Promise<TreinoExercicio[]>;
  deleteExercicio(id: string): Promise<void>;

  // Sessions count
  countSessoesByTemplateId(templateId: string): Promise<number>;
}
