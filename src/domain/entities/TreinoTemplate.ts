import { v4 as uuidv4 } from "uuid";

export interface TreinoTemplateProps {
  id: string;
  blocoId: string;
  nome: string;
  descricao?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class TreinoTemplate {
  private constructor(private props: TreinoTemplateProps) {}

  get id() { return this.props.id; }
  get blocoId() { return this.props.blocoId; }
  get nome() { return this.props.nome; }
  get descricao() { return this.props.descricao; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
  get deletedAt() { return this.props.deletedAt; }

  static create(params: { blocoId: string; nome: string; descricao?: string }): TreinoTemplate {
    if (!params.nome?.trim()) throw new Error("Nome do treino é obrigatório");
    return new TreinoTemplate({
      id: uuidv4(),
      blocoId: params.blocoId,
      nome: params.nome.trim(),
      descricao: params.descricao?.trim() ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  }

  static reconstitute(data: TreinoTemplateProps): TreinoTemplate {
    return new TreinoTemplate(data);
  }

  update(data: { nome?: string; descricao?: string | null }) {
    if (data.nome !== undefined) this.props.nome = data.nome.trim();
    if (data.descricao !== undefined) this.props.descricao = data.descricao?.trim() ?? null;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return { ...this.props };
  }
}
