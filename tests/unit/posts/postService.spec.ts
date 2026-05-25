import { Post } from '@/posts/post';
import { PostService, PostNotFoundError } from '@/posts/postService';
import { IPostRepository } from '@/posts/postRepository';

describe('PostService', () => {
  let postService: PostService;
  let mockPostRepository: jest.Mocked<IPostRepository>;

  beforeEach(() => {
    mockPostRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    };
    postService = new PostService(mockPostRepository);
  });

  describe('create', () => {
    it('should create a new post using the repository', async () => {
      const postData = { title: 'Test', content: 'Content', author: 'Author' };
      const createdPost = Post.create(postData.title, postData.content, postData.author);
      mockPostRepository.create.mockResolvedValue(createdPost);

      const result = await postService.create(postData);

      expect(mockPostRepository.create).toHaveBeenCalledWith(expect.any(Post));
      expect(result).toBe(createdPost);
    });
  });

  describe('listAll', () => {
    it('should return all posts from the repository', async () => {
      const posts = [Post.create('T1', 'C1', 'A1'), Post.create('T2', 'C2', 'A2')];
      mockPostRepository.findAll.mockResolvedValue(posts);

      const result = await postService.listAll();

      expect(mockPostRepository.findAll).toHaveBeenCalled();
      expect(result).toBe(posts);
    });
  });

  describe('findByUuid', () => {
    it('should return a post by its uuid from the repository', async () => {
      const post = Post.create('T1', 'C1', 'A1');
      mockPostRepository.findById.mockResolvedValue(post);

      const result = await postService.findByUuid('uuid-1');

      expect(mockPostRepository.findById).toHaveBeenCalledWith('uuid-1');
      expect(result).toBe(post);
    });

    it('should return null if repository returns null', async () => {
      mockPostRepository.findById.mockResolvedValue(null);
      const result = await postService.findByUuid('uuid-not-found');
      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('should search posts in the repository', async () => {
      const posts = [Post.create('T1', 'C1', 'A1')];
      mockPostRepository.search.mockResolvedValue(posts);

      const result = await postService.search('query');

      expect(mockPostRepository.search).toHaveBeenCalledWith('query');
      expect(result).toBe(posts);
    });
  });

  describe('update', () => {
    it('should update an existing post in the repository', async () => {
      const existingPost = Post.create('Old', 'Old', 'Old');
      mockPostRepository.findById.mockResolvedValue(existingPost);
      mockPostRepository.update.mockResolvedValue(existingPost);

      const updateData = { title: 'New' };
      const result = await postService.update('uuid-1', updateData);

      expect(mockPostRepository.findById).toHaveBeenCalledWith('uuid-1');
      expect(existingPost.title).toBe('New');
      expect(mockPostRepository.update).toHaveBeenCalledWith(existingPost);
      expect(result).toBe(existingPost);
    });

    it('should throw PostNotFoundError if post not found', async () => {
      mockPostRepository.findById.mockResolvedValue(null);
      await expect(postService.update('uuid-1', { title: 'New' })).rejects.toThrow(PostNotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete an existing post from the repository', async () => {
      const existingPost = Post.create('T', 'C', 'A');
      mockPostRepository.findById.mockResolvedValue(existingPost);

      await postService.delete('uuid-1');

      expect(mockPostRepository.findById).toHaveBeenCalledWith('uuid-1');
      expect(mockPostRepository.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw PostNotFoundError if post not found for deletion', async () => {
      mockPostRepository.findById.mockResolvedValue(null);
      await expect(postService.delete('uuid-1')).rejects.toThrow(PostNotFoundError);
    });
  });
});
