import { ComentarioController } from '@/comentarios/comentarioController';
import {
  ComentarioService,
  ComentarioNotFoundError,
  PostDoComentarioNotFoundError,
  ComentarioOperacaoNaoPermitidaError,
} from '@/comentarios/comentarioService';
import { Response } from 'express';
import { Comentario } from '@/comentarios/comentario';
import { IAuthRequest } from '@/auth/authMiddleware';
import { CodigoErro } from '@/shared/erros';

const POST_UUID = '11111111-1111-4111-8111-111111111111';
const COMENTARIO_UUID = '22222222-2222-4222-8222-222222222222';

describe('ComentarioController', () => {
  let comentarioController: ComentarioController;
  let mockComentarioService: jest.Mocked<ComentarioService>;
  let mockRequest: Partial<IAuthRequest>;
  let mockResponse: Partial<Response>;

  const usuarioAutenticado = { uuid: 'user-uuid', email: 'a@a.com', nome: 'Fulano', papel: 'aluno' };

  beforeEach(() => {
    mockComentarioService = {
      create: jest.fn(),
      listByPost: jest.fn(),
      delete: jest.fn(),
    } as any;

    comentarioController = new ComentarioController(mockComentarioService);

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('create (uso feliz)', () => {
    it('retorna 201 com o comentario criado', async () => {
      mockRequest.usuario = usuarioAutenticado;
      mockRequest.params = { postUuid: POST_UUID };
      mockRequest.body = { conteudo: 'Comentario valido' };
      const criado = Comentario.create(POST_UUID, usuarioAutenticado.uuid, usuarioAutenticado.nome, 'Comentario valido');
      mockComentarioService.create.mockResolvedValue(criado);

      await comentarioController.create(mockRequest as IAuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ sucesso: true, dados: expect.objectContaining({ conteudo: 'Comentario valido' }) }),
      );
    });
  });

  describe('create (falha)', () => {
    it('retorna 401 quando nao ha usuario autenticado', async () => {
      mockRequest.params = { postUuid: POST_UUID };
      mockRequest.body = { conteudo: 'Comentario valido' };

      await comentarioController.create(mockRequest as IAuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockComentarioService.create).not.toHaveBeenCalled();
    });

    it('retorna 404 quando o post nao existe', async () => {
      mockRequest.usuario = usuarioAutenticado;
      mockRequest.params = { postUuid: POST_UUID };
      mockRequest.body = { conteudo: 'Comentario valido' };
      mockComentarioService.create.mockRejectedValue(new PostDoComentarioNotFoundError());

      await comentarioController.create(mockRequest as IAuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ codigo: CodigoErro.POST_NAO_ENCONTRADO }),
      );
    });
  });

  describe('create (validacao)', () => {
    it('retorna 400 quando o conteudo e muito curto', async () => {
      mockRequest.usuario = usuarioAutenticado;
      mockRequest.params = { postUuid: POST_UUID };
      mockRequest.body = { conteudo: 'Oi' };

      await comentarioController.create(mockRequest as IAuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ codigo: CodigoErro.VALIDACAO_CAMPO_INVALIDO, errors: expect.any(Array) }),
      );
      expect(mockComentarioService.create).not.toHaveBeenCalled();
    });

    it('retorna 400 quando o postUuid nao e um uuid valido', async () => {
      mockRequest.usuario = usuarioAutenticado;
      mockRequest.params = { postUuid: 'nao-e-um-uuid' };
      mockRequest.body = { conteudo: 'Comentario valido' };

      await comentarioController.create(mockRequest as IAuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ codigo: CodigoErro.VALIDACAO_CAMPO_INVALIDO }),
      );
      expect(mockComentarioService.create).not.toHaveBeenCalled();
    });
  });

  describe('listByPost (validacao)', () => {
    it('retorna 400 quando o postUuid nao e um uuid valido', async () => {
      mockRequest.params = { postUuid: 'nao-e-um-uuid' };

      await comentarioController.listByPost(mockRequest as IAuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockComentarioService.listByPost).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('retorna 204 quando o comentario e excluido com sucesso', async () => {
      mockRequest.usuario = usuarioAutenticado;
      mockRequest.params = { uuid: COMENTARIO_UUID };
      mockComentarioService.delete.mockResolvedValue(undefined);

      await comentarioController.delete(mockRequest as IAuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('retorna 404 quando o comentario nao existe', async () => {
      mockRequest.usuario = usuarioAutenticado;
      mockRequest.params = { uuid: COMENTARIO_UUID };
      mockComentarioService.delete.mockRejectedValue(new ComentarioNotFoundError());

      await comentarioController.delete(mockRequest as IAuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ codigo: CodigoErro.COMENTARIO_NAO_ENCONTRADO }),
      );
    });

    it('retorna 403 quando o usuario nao e autor nem admin', async () => {
      mockRequest.usuario = usuarioAutenticado;
      mockRequest.params = { uuid: COMENTARIO_UUID };
      mockComentarioService.delete.mockRejectedValue(new ComentarioOperacaoNaoPermitidaError());

      await comentarioController.delete(mockRequest as IAuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ codigo: CodigoErro.COMENTARIO_OPERACAO_NAO_PERMITIDA }),
      );
    });

    it('retorna 400 quando o uuid nao e valido', async () => {
      mockRequest.usuario = usuarioAutenticado;
      mockRequest.params = { uuid: 'nao-e-um-uuid' };

      await comentarioController.delete(mockRequest as IAuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockComentarioService.delete).not.toHaveBeenCalled();
    });
  });
});
