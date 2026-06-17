import { v4 as uuidv4 } from "uuid";

export interface ConquistaProps {
  id?: string;
  nome: string;
  descricao: string;
  icone: string;
  xpReward: number;
  tipo: string;
  createdAt?: Date;
}

export class Conquista {
  readonly id: string;
  readonly nome: string;
  readonly descricao: string;
  readonly icone: string;
  readonly xpReward: number;
  readonly tipo: string;
  readonly createdAt: Date;

  constructor(props: ConquistaProps) {
    this.id = props.id ?? uuidv4();
    this.nome = props.nome;
    this.descricao = props.descricao;
    this.icone = props.icone;
    this.xpReward = props.xpReward;
    this.tipo = props.tipo;
    this.createdAt = props.createdAt ?? new Date();
  }
}
