import { v4 as uuidv4 } from "uuid";

export interface TreinoExercicioProps {
  id: string;
  templateId: string;
  nome: string;
  series: number;
  repeticoes: number;
  pesoKg?: number | null;
  ordem: number;
  createdAt: Date;
}

export class TreinoExercicio {
  private constructor(private props: TreinoExercicioProps) {}

  get id() { return this.props.id; }
  get templateId() { return this.props.templateId; }
  get nome() { return this.props.nome; }
  get series() { return this.props.series; }
  get repeticoes() { return this.props.repeticoes; }
  get pesoKg() { return this.props.pesoKg; }
  get ordem() { return this.props.ordem; }
  get createdAt() { return this.props.createdAt; }

  static create(params: {
    templateId: string;
    nome: string;
    series?: number;
    repeticoes?: number;
    pesoKg?: number | null;
    ordem?: number;
  }): TreinoExercicio {
    if (!params.nome?.trim()) throw new Error("Nome do exercício é obrigatório");
    return new TreinoExercicio({
      id: uuidv4(),
      templateId: params.templateId,
      nome: params.nome.trim(),
      series: params.series ?? 3,
      repeticoes: params.repeticoes ?? 10,
      pesoKg: params.pesoKg ?? null,
      ordem: params.ordem ?? 0,
      createdAt: new Date(),
    });
  }

  static reconstitute(data: TreinoExercicioProps): TreinoExercicio {
    return new TreinoExercicio(data);
  }

  toJSON() {
    return { ...this.props };
  }
}
