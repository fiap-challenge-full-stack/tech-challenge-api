export interface UsuarioProps {
  uuid: string;
  email: string;
  senha: string;
  nome: string;
  papel: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Usuario {
  readonly uuid: string;
  readonly email: string;
  readonly senha: string;
  readonly nome: string;
  readonly papel: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: UsuarioProps) {
    this.uuid = props.uuid;
    this.email = props.email;
    this.senha = props.senha;
    this.nome = props.nome;
    this.papel = props.papel;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(email: string, senha: string, nome: string, papel: string = 'docente'): Omit<UsuarioProps, 'uuid' | 'createdAt' | 'updatedAt'> {
    return {
      email,
      senha,
      nome,
      papel
    };
  }

  toJSON() {
    return {
      uuid: this.uuid,
      email: this.email,
      nome: this.nome,
      papel: this.papel,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  get senhaHash(): string {
    return this.senha;
  }
}
