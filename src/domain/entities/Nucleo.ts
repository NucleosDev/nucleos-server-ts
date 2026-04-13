import { v4 as uuidv4 } from "uuid";
import { Bloco } from "./Bloco";
import { CalendarioEvento } from "./CalendarioEvento";
import { NucleoTimer } from "./NucleoTimer";
import { Meta } from "./Meta";
import { NucleoCompartilhamento } from "./NucleoCompartilhamento";
import { NucleoRelation } from "./NucleoRelation";
import { NucleoAchievement } from "./NucleoAchievement";
import { NucleoIcon } from "./NucleoIcon";
import { User } from "./User";

export type TipoNucleo = string;

export interface NucleoProps {
  id?: string;
  userId: string;
  iconId?: string | null;
  nome: string;
  descricao?: string | null;
  tipo?: string;
  corDestaque?: string | null;
  imagemCapa?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Nucleo {
  private _blocos: Bloco[] = [];
  private _calendarioEventos: CalendarioEvento[] = [];
  private _nucleoTimers: NucleoTimer[] = [];
  private _metas: Meta[] = [];
  private _compartilhamentos: NucleoCompartilhamento[] = [];
  private _relations: NucleoRelation[] = [];
  private _achievements: NucleoAchievement[] = [];
  private _user?: User;
  private _icon?: NucleoIcon;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private _iconId: string | null,
    private _nome: string,
    private _descricao: string | null,
    private _tipo: string,
    private _corDestaque: string | null,
    private _imagemCapa: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
  ) {}

  static create(props: NucleoProps): Nucleo {
    if (!props.nome || props.nome.trim().length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }

    return new Nucleo(
      props.id || uuidv4(),
      props.userId,
      props.iconId || null,
      props.nome.trim(),
      props.descricao || null,
      props.tipo || "pessoal",
      props.corDestaque || null,
      props.imagemCapa || null,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
      props.deletedAt || null,
    );
  }

  static reconstitute(
    props: Required<NucleoProps> & { iconId?: string | null },
  ): Nucleo {
    return new Nucleo(
      props.id!,
      props.userId,
      props.iconId || null,
      props.nome,
      props.descricao || null,
      props.tipo,
      props.corDestaque || null,
      props.imagemCapa || null,
      props.createdAt!,
      props.updatedAt!,
      props.deletedAt || null,
    );
  }

  //  GETTERS PRINCIPAIS
  get id(): string {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get iconId(): string | null {
    return this._iconId;
  }
  get nome(): string {
    return this._nome;
  }
  get descricao(): string | null {
    return this._descricao;
  }
  get tipo(): string {
    return this._tipo;
  }
  get corDestaque(): string | null {
    return this._corDestaque;
  }
  get imagemCapa(): string | null {
    return this._imagemCapa;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }
  get isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  //  GETTERS DE NAVEGAÇÃO
  get blocos(): readonly Bloco[] {
    return this._blocos;
  }
  get calendarioEventos(): readonly CalendarioEvento[] {
    return this._calendarioEventos;
  }
  get nucleoTimers(): readonly NucleoTimer[] {
    return this._nucleoTimers;
  }
  get metas(): readonly Meta[] {
    return this._metas;
  }
  get compartilhamentos(): readonly NucleoCompartilhamento[] {
    return this._compartilhamentos;
  }
  get relations(): readonly NucleoRelation[] {
    return this._relations;
  }
  get achievements(): readonly NucleoAchievement[] {
    return this._achievements;
  }
  get user(): User | undefined {
    return this._user;
  }
  get icon(): NucleoIcon | undefined {
    return this._icon;
  }

  //  SETTERS DE NAVEGAÇÃO (para ORM)
  set user(value: User | undefined) {
    this._user = value;
  }
  set icon(value: NucleoIcon | undefined) {
    this._icon = value;
  }

  //  MÉTODOS PARA ADICIONAR RELAÇÕES
  addBloco(bloco: Bloco): void {
    this._blocos.push(bloco);
  }

  addCalendarioEvento(evento: CalendarioEvento): void {
    this._calendarioEventos.push(evento);
  }

  addNucleoTimer(timer: NucleoTimer): void {
    this._nucleoTimers.push(timer);
  }

  addMeta(meta: Meta): void {
    this._metas.push(meta);
  }

  addCompartilhamento(compartilhamento: NucleoCompartilhamento): void {
    this._compartilhamentos.push(compartilhamento);
  }

  addRelation(relation: NucleoRelation): void {
    this._relations.push(relation);
  }

  addAchievement(achievement: NucleoAchievement): void {
    this._achievements.push(achievement);
  }

  //  MÉTODOS DE DOMÍNIO
  updateNome(nome: string): void {
    if (!nome || nome.trim().length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }
    this._nome = nome.trim();
    this.touch();
  }

  updateDescricao(descricao: string | null): void {
    this._descricao = descricao;
    this.touch();
  }

  updateTipo(tipo: string): void {
    if (!tipo || tipo.trim().length === 0) {
      throw new Error("Tipo não pode ser vazio");
    }
    this._tipo = tipo.trim();
    this.touch();
  }

  updateCor(cor: string | null): void {
    this._corDestaque = cor;
    this.touch();
  }

  updateImagem(imagem: string | null): void {
    this._imagemCapa = imagem;
    this.touch();
  }

  updateIcon(iconId: string | null): void {
    this._iconId = iconId;
    this.touch();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.touch();
  }

  restore(): void {
    this._deletedAt = null;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  //  TO JSON
  toJSON() {
    return {
      id: this._id,
      userId: this._userId,
      iconId: this._iconId,
      nome: this._nome,
      descricao: this._descricao,
      tipo: this._tipo,
      corDestaque: this._corDestaque,
      imagemCapa: this._imagemCapa,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      deletedAt: this._deletedAt?.toISOString() || null,
      // Navegações (opcionais, podem ser omitidas se não carregadas)
      blocos: this._blocos.map((b) => b.toJSON?.() || b),
      calendarioEventos: this._calendarioEventos.map((e) => e.toJSON?.() || e),
      metas: this._metas.map((m) => m.toJSON?.() || m),
      achievements: this._achievements.map((a) => a.toJSON?.() || a),
    };
  }
}
