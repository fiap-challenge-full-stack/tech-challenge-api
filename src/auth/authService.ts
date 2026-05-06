import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from './usuario';
import { IUsuarioRepository } from './usuarioRepository';
import { CreateUsuarioInput, LoginInput } from './usuarioSchemas';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciais inválidas');
    this.name = 'InvalidCredentialsError';
  }
}

export class UsuarioAlreadyExistsError extends Error {
  constructor() {
    super('Usuário já existe');
    this.name = 'UsuarioAlreadyExistsError';
  }
}

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    jwtSecret: string = process.env.JWT_SECRET || '',
    jwtExpiresIn: string = process.env.JWT_EXPIRES_IN || '7d'
  ) {
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    this.JWT_SECRET = jwtSecret;
    this.JWT_EXPIRES_IN = jwtExpiresIn;
  }

  async registrar(data: CreateUsuarioInput): Promise<{ usuario: Usuario; token: string }> {
    const usuarioExistente = await this.usuarioRepository.findByEmail(data.email);
    if (usuarioExistente) {
      throw new UsuarioAlreadyExistsError();
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);
    
    const usuario = await this.usuarioRepository.create({
      email: data.email,
      senha: senhaHash,
      nome: data.nome,
      papel: data.papel
    });

    const token = this.gerarToken(usuario);

    return { usuario, token };
  }

  async login(data: LoginInput): Promise<{ usuario: Usuario; token: string }> {
    const usuario = await this.usuarioRepository.findByEmail(data.email);
    if (!usuario) {
      throw new InvalidCredentialsError();
    }

    const senhaValida = await bcrypt.compare(data.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new InvalidCredentialsError();
    }

    const token = this.gerarToken(usuario);

    return { usuario, token };
  }

  private gerarToken(usuario: Usuario): string {
    const payload = {
      uuid: usuario.uuid,
      email: usuario.email,
      nome: usuario.nome,
      papel: usuario.papel
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as jwt.SignOptions);
  }

  verificarToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new InvalidCredentialsError();
    }
  }
}
