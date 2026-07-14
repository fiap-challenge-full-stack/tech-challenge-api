import { Comentario } from '@/comentarios/comentario';
import {
  ComentarioService,
  ComentarioNotFoundError,
  PostDoComentarioNotFoundError,
  ComentarioOperacaoNaoPermitidaError,
} from '@/comentarios/comentarioService';
import { IComentarioRepository } from '@/comentarios/comentarioRepository';
import { IPostRepository } from '@/posts/postRepository';
import { Post } from '@/posts/post';

describe('ComentarioService', () => {
  let comentarioService: ComentarioService;
  let mockComentarioRepository: jest.Mocked<IComentarioRepository>;
  let mockPostRepository: jest.Mocked<IPostRepository>;

  const autorDoComentario = { uuid: 'autor-uuid', nome: 'Autor', papel: 'aluno' };
  const outroUsuario = { uuid: 'outro-uuid', nome: 'Outro', papel: 'aluno' };
  const admin = { uuid: 'admin-uuid', nome: 'Admin', papel: 'admin' };

  beforeEach(() => {
    mockComentarioRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPostUuid: jest.fn(),
      delete: jest.fn(),
    };
    mockPostRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    };
    comentarioService = new ComentarioService(mockComentarioRepository, mockPostRepository);
  });

  describe('create (uso feliz)', () => {
    it('cria um comentario quando o post existe', async () => {
      const post = Post.create('T', 'C', 'A');
      mockPostRepository.findById.mockResolvedValue(post);
      const created = Comentario.create('post-uuid', autorDoComentario.uuid, autorDoComentario.nome, 'Ótimo post!');
      mockComentarioRepository.create.mockResolvedValue(created);

      const result = await comentarioService.create('post-uuid', { conteudo: 'Ótimo post!' }, autorDoComentario);

      expect(mockPostRepository.findById).toHaveBeenCalledWith('post-uuid');
      expect(mockComentarioRepository.create).toHaveBeenCalledWith(expect.any(Comentario));
      expect(result).toBe(created);
    });
  });

  describe('create (falha)', () => {
    it('lanca PostDoComentarioNotFoundError quando o post nao existe', async () => {
      mockPostRepository.findById.mockResolvedValue(null);

      await expect(
        comentarioService.create('post-inexistente', { conteudo: 'Comentario' }, autorDoComentario),
      ).rejects.toThrow(PostDoComentarioNotFoundError);
      expect(mockComentarioRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('listByPost', () => {
    it('retorna os comentarios do post quando ele existe', async () => {
      const post = Post.create('T', 'C', 'A');
      mockPostRepository.findById.mockResolvedValue(post);
      const comentarios = [Comentario.create('post-uuid', 'u1', 'Nome', 'Oi')];
      mockComentarioRepository.findByPostUuid.mockResolvedValue(comentarios);

      const result = await comentarioService.listByPost('post-uuid');

      expect(result).toBe(comentarios);
    });

    it('lanca PostDoComentarioNotFoundError quando o post nao existe', async () => {
      mockPostRepository.findById.mockResolvedValue(null);

      await expect(comentarioService.listByPost('post-inexistente')).rejects.toThrow(PostDoComentarioNotFoundError);
    });
  });

  describe('delete (uso feliz)', () => {
    it('permite que o autor do comentario o exclua', async () => {
      const comentario = Comentario.create('post-uuid', autorDoComentario.uuid, autorDoComentario.nome, 'Oi');
      mockComentarioRepository.findById.mockResolvedValue(comentario);

      await comentarioService.delete('comentario-uuid', autorDoComentario);

      expect(mockComentarioRepository.delete).toHaveBeenCalledWith('comentario-uuid');
    });

    it('permite que um admin exclua o comentario de outro usuario', async () => {
      const comentario = Comentario.create('post-uuid', autorDoComentario.uuid, autorDoComentario.nome, 'Oi');
      mockComentarioRepository.findById.mockResolvedValue(comentario);

      await comentarioService.delete('comentario-uuid', admin);

      expect(mockComentarioRepository.delete).toHaveBeenCalledWith('comentario-uuid');
    });
  });

  describe('delete (falha)', () => {
    it('lanca ComentarioNotFoundError quando o comentario nao existe', async () => {
      mockComentarioRepository.findById.mockResolvedValue(null);

      await expect(comentarioService.delete('inexistente', autorDoComentario)).rejects.toThrow(ComentarioNotFoundError);
      expect(mockComentarioRepository.delete).not.toHaveBeenCalled();
    });

    it('lanca ComentarioOperacaoNaoPermitidaError quando outro usuario comum tenta excluir', async () => {
      const comentario = Comentario.create('post-uuid', autorDoComentario.uuid, autorDoComentario.nome, 'Oi');
      mockComentarioRepository.findById.mockResolvedValue(comentario);

      await expect(comentarioService.delete('comentario-uuid', outroUsuario)).rejects.toThrow(
        ComentarioOperacaoNaoPermitidaError,
      );
      expect(mockComentarioRepository.delete).not.toHaveBeenCalled();
    });
  });
});
