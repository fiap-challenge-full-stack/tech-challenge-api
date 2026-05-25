import { PostController } from '@/posts/postController';
import { PostService, PostNotFoundError } from '@/posts/postService';
import { Request, Response } from 'express';
import { Post } from '@/posts/post';
import { ZodError } from 'zod';

describe('PostController', () => {
  let postController: PostController;
  let mockPostService: jest.Mocked<PostService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockPostService = {
      create: jest.fn(),
      listAll: jest.fn(),
      findByUuid: jest.fn(),
      search: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    postController = new PostController(mockPostService);

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('create', () => {
    it('should return 201 when post is created successfully', async () => {
      const postData = { title: 'Test Title', content: 'Test content with more than 10 characters', author: 'Author' };
      mockRequest.body = postData;
      const createdPost = Post.create(postData.title, postData.content, postData.author);
      mockPostService.create.mockResolvedValue(createdPost);

      await postController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdPost);
    });

    it('should return 400 when validation fails', async () => {
      mockRequest.body = { title: 'T' }; // Fails min 3 and missing fields

      await postController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Falha na validação dos campos',
        errors: expect.any(Array)
      }));
    });
  });

  describe('getById', () => {
    it('should return 200 when post is found', async () => {
      mockRequest.params = { id: 'uuid-1' };
      const post = Post.create('Test Title', 'Test content with more than 10 chars', 'Author');
      mockPostService.findByUuid.mockResolvedValue(post);

      await postController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(post);
    });

    it('should return 404 when post is not found', async () => {
      mockRequest.params = { id: 'uuid-1' };
      mockPostService.findByUuid.mockResolvedValue(null);

      await postController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Post not found' });
    });
  });

  describe('update', () => {
    it('should return 200 when post is updated successfully', async () => {
      mockRequest.params = { id: 'uuid-1' };
      mockRequest.body = { title: 'New Valid Title' };
      const updatedPost = Post.create('New Valid Title', 'Test content with more than 10 chars', 'Author');
      mockPostService.update.mockResolvedValue(updatedPost);

      await postController.update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedPost);
    });

    it('should return 404 when post to update is not found', async () => {
      mockRequest.params = { id: 'uuid-1' };
      mockRequest.body = { title: 'New' };
      mockPostService.update.mockRejectedValue(new PostNotFoundError());

      await postController.update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Post not found' });
    });
  });

  describe('delete', () => {
    it('should return 204 when post is deleted successfully', async () => {
      mockRequest.params = { id: 'uuid-1' };
      mockPostService.delete.mockResolvedValue(undefined);

      await postController.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 when post to delete is not found', async () => {
      mockRequest.params = { id: 'uuid-1' };
      mockPostService.delete.mockRejectedValue(new PostNotFoundError());

      await postController.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 for generic errors', async () => {
      mockRequest.params = { id: 'uuid-1' };
      mockPostService.delete.mockRejectedValue(new Error('Database connection failed'));

      await postController.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
    });
  });
});
