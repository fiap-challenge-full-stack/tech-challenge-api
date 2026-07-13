import { PrismaClient } from '@prisma/client';
import { PrismaUsuarioRepository } from '../auth/prismaUsuarioRepository';
import { AuthService } from '../auth/authService';
import { AuthController } from '../auth/authController';
import { UsuarioService } from '../auth/usuarioService';
import { UsuarioController } from '../auth/usuarioController';
import { NativeSqlPostRepository } from '../posts/nativeSqlPostRepository';
import { PostService } from '../posts/postService';
import { PostController } from '../posts/postController';

const prisma = new PrismaClient();

const usuarioRepository = new PrismaUsuarioRepository(prisma);
const authService = new AuthService(usuarioRepository);
const authController = new AuthController(authService);

const usuarioService = new UsuarioService(usuarioRepository);
const usuarioController = new UsuarioController(usuarioService);

const postRepository = new NativeSqlPostRepository();
const postService = new PostService(postRepository);
const postController = new PostController(postService);

export const container = {
  prisma,
  auth: {
    repository: usuarioRepository,
    service: authService,
    controller: authController,
  },
  usuarios: {
    repository: usuarioRepository,
    service: usuarioService,
    controller: usuarioController,
  },
  posts: {
    repository: postRepository,
    service: postService,
    controller: postController,
  },
};
