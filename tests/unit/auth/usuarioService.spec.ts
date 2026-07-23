import { MemoryUsuarioRepository } from '@/auth/memoryUsuarioRepository';
import { UsuarioService, UsuarioUltimoAdminError } from '@/auth/usuarioService';
import { Usuario } from '@/auth/usuario';

describe('UsuarioService - proteção do último admin', () => {
  let repository: MemoryUsuarioRepository;
  let service: UsuarioService;

  beforeEach(() => {
    repository = new MemoryUsuarioRepository();
    service = new UsuarioService(repository);
  });

  it('impede rebaixar o único admin restante', async () => {
    const admin = await repository.create(
      Usuario.create('admin@test.com', 'hash', 'Admin Único', 'admin'),
    );

    await expect(
      service.atualizar(admin.uuid, { papel: 'docente' }, { uuid: admin.uuid, papel: 'admin' }),
    ).rejects.toBeInstanceOf(UsuarioUltimoAdminError);
  });

  it('impede deletar o único admin restante', async () => {
    const admin = await repository.create(
      Usuario.create('admin2@test.com', 'hash', 'Admin Único', 'admin'),
    );

    await expect(
      service.deletar(admin.uuid, { uuid: admin.uuid, papel: 'admin' }),
    ).rejects.toBeInstanceOf(UsuarioUltimoAdminError);
  });

  it('permite rebaixar um admin quando existe outro admin', async () => {
    const admin1 = await repository.create(
      Usuario.create('admin3@test.com', 'hash', 'Admin Um', 'admin'),
    );
    await repository.create(Usuario.create('admin4@test.com', 'hash', 'Admin Dois', 'admin'));

    const atualizado = await service.atualizar(
      admin1.uuid,
      { papel: 'docente' },
      { uuid: admin1.uuid, papel: 'admin' },
    );

    expect(atualizado.papel).toBe('docente');
  });

  it('executarEmTransacao delega para o próprio repositório em memória (sem transação real)', async () => {
    const resultado = await repository.executarEmTransacao(async (repo) => repo.countByPapel('admin'));
    expect(resultado).toBe(0);
  });
});
