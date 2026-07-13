import {
  UsuarioEmailEmUsoError,
  UsuarioNaoEncontradoError,
  UsuarioOperacaoNaoPermitidaError,
  UsuarioService,
  UsuarioUltimoAdminError,
} from '@/auth/usuarioService';
import { IUsuarioRepository } from '@/auth/usuarioRepository';
import { IUsuarioProps, Usuario } from '@/auth/usuario';

function criarUsuarioFake(overrides: Partial<IUsuarioProps> = {}): Usuario {
  return new Usuario({
    uuid: overrides.uuid ?? 'uuid-1',
    email: overrides.email ?? 'user@test.com',
    senha: overrides.senha ?? 'hash',
    nome: overrides.nome ?? 'Usuário Teste',
    papel: overrides.papel ?? 'docente',
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
  });
}

describe('UsuarioService', () => {
  let mockRepository: jest.Mocked<IUsuarioRepository>;
  let usuarioService: UsuarioService;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findByUuid: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByPapel: jest.fn(),
    };
    usuarioService = new UsuarioService(mockRepository);
  });

  describe('criar', () => {
    it('deve lançar UsuarioEmailEmUsoError quando o email já existe', async () => {
      mockRepository.findByEmail.mockResolvedValue(criarUsuarioFake());

      await expect(
        usuarioService.criar({ email: 'user@test.com', senha: 'Senha123@', nome: 'Novo', papel: 'docente' })
      ).rejects.toThrow(UsuarioEmailEmUsoError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('deve criar usuário com papel definido pelo admin', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(criarUsuarioFake({ papel: 'admin' }));

      const usuario = await usuarioService.criar({
        email: 'novo@test.com',
        senha: 'Senha123@',
        nome: 'Novo Admin',
        papel: 'admin',
      });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'novo@test.com', papel: 'admin' })
      );
      expect(usuario.papel).toBe('admin');
    });
  });

  describe('atualizar', () => {
    it('deve permitir que o próprio usuário atualize seu nome', async () => {
      const usuarioAlvo = criarUsuarioFake({ uuid: 'uuid-1', papel: 'docente' });
      mockRepository.findByUuid.mockResolvedValue(usuarioAlvo);
      mockRepository.update.mockResolvedValue(criarUsuarioFake({ uuid: 'uuid-1', nome: 'Novo Nome' }));

      const resultado = await usuarioService.atualizar(
        'uuid-1',
        { nome: 'Novo Nome' },
        { uuid: 'uuid-1', papel: 'docente' }
      );

      expect(mockRepository.update).toHaveBeenCalledWith('uuid-1', expect.objectContaining({ nome: 'Novo Nome' }));
      expect(resultado.nome).toBe('Novo Nome');
    });

    it('deve negar atualização de dados de outro usuário por não-admin', async () => {
      const usuarioAlvo = criarUsuarioFake({ uuid: 'uuid-2' });
      mockRepository.findByUuid.mockResolvedValue(usuarioAlvo);

      await expect(
        usuarioService.atualizar('uuid-2', { nome: 'Hack' }, { uuid: 'uuid-1', papel: 'docente' })
      ).rejects.toThrow(UsuarioOperacaoNaoPermitidaError);

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('deve ignorar o campo papel quando o requisitante não é admin', async () => {
      const usuarioAlvo = criarUsuarioFake({ uuid: 'uuid-1', papel: 'docente' });
      mockRepository.findByUuid.mockResolvedValue(usuarioAlvo);
      mockRepository.update.mockResolvedValue(usuarioAlvo);

      await usuarioService.atualizar(
        'uuid-1',
        { nome: 'Nome', papel: 'admin' },
        { uuid: 'uuid-1', papel: 'docente' }
      );

      const dadosEnviados = mockRepository.update.mock.calls[0][1];
      expect(dadosEnviados.papel).toBeUndefined();
    });

    it('deve lançar UsuarioEmailEmUsoError ao tentar usar email de outro usuário', async () => {
      const usuarioAlvo = criarUsuarioFake({ uuid: 'uuid-1', email: 'atual@test.com' });
      mockRepository.findByUuid.mockResolvedValue(usuarioAlvo);
      mockRepository.findByEmail.mockResolvedValue(criarUsuarioFake({ uuid: 'uuid-2', email: 'outro@test.com' }));

      await expect(
        usuarioService.atualizar(
          'uuid-1',
          { email: 'outro@test.com' },
          { uuid: 'uuid-1', papel: 'docente' }
        )
      ).rejects.toThrow(UsuarioEmailEmUsoError);
    });

    it('deve impedir admin de rebaixar o último admin do sistema', async () => {
      const usuarioAlvo = criarUsuarioFake({ uuid: 'uuid-1', papel: 'admin' });
      mockRepository.findByUuid.mockResolvedValue(usuarioAlvo);
      mockRepository.countByPapel.mockResolvedValue(1);

      await expect(
        usuarioService.atualizar('uuid-1', { papel: 'docente' }, { uuid: 'uuid-1', papel: 'admin' })
      ).rejects.toThrow(UsuarioUltimoAdminError);
    });

    it('deve lançar UsuarioNaoEncontradoError quando o usuário não existe', async () => {
      mockRepository.findByUuid.mockResolvedValue(null);

      await expect(
        usuarioService.atualizar('uuid-x', { nome: 'X' }, { uuid: 'uuid-x', papel: 'docente' })
      ).rejects.toThrow(UsuarioNaoEncontradoError);
    });
  });

  describe('deletar', () => {
    it('deve permitir que o próprio usuário delete sua conta', async () => {
      const usuarioAlvo = criarUsuarioFake({ uuid: 'uuid-1', papel: 'docente' });
      mockRepository.findByUuid.mockResolvedValue(usuarioAlvo);

      await usuarioService.deletar('uuid-1', { uuid: 'uuid-1', papel: 'docente' });

      expect(mockRepository.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('deve negar remoção de outro usuário por não-admin', async () => {
      const usuarioAlvo = criarUsuarioFake({ uuid: 'uuid-2' });
      mockRepository.findByUuid.mockResolvedValue(usuarioAlvo);

      await expect(
        usuarioService.deletar('uuid-2', { uuid: 'uuid-1', papel: 'docente' })
      ).rejects.toThrow(UsuarioOperacaoNaoPermitidaError);

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('deve impedir a remoção do último admin', async () => {
      const usuarioAlvo = criarUsuarioFake({ uuid: 'uuid-1', papel: 'admin' });
      mockRepository.findByUuid.mockResolvedValue(usuarioAlvo);
      mockRepository.countByPapel.mockResolvedValue(1);

      await expect(
        usuarioService.deletar('uuid-1', { uuid: 'uuid-1', papel: 'admin' })
      ).rejects.toThrow(UsuarioUltimoAdminError);

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('deve permitir admin remover outro admin quando houver mais de um', async () => {
      const usuarioAlvo = criarUsuarioFake({ uuid: 'uuid-2', papel: 'admin' });
      mockRepository.findByUuid.mockResolvedValue(usuarioAlvo);
      mockRepository.countByPapel.mockResolvedValue(2);

      await usuarioService.deletar('uuid-2', { uuid: 'uuid-1', papel: 'admin' });

      expect(mockRepository.delete).toHaveBeenCalledWith('uuid-2');
    });
  });
});
