import { Post } from '@/posts/post';

describe('Post Entity', () => {
  it('should create a new post with valid data', () => {
    const post = Post.create('Test Title', 'Test Content', 'Test Author');
    expect(post.title).toBe('Test Title');
    expect(post.content).toBe('Test Content');
    expect(post.author).toBe('Test Author');
    expect(post.createdAt).toBeInstanceOf(Date);
  });

  it('should throw an error if title is empty', () => {
    expect(() => Post.create('', 'Content', 'Author')).toThrow('Title is required');
  });

  it('should throw an error if content is empty', () => {
    expect(() => Post.create('Title', '', 'Author')).toThrow('Content is required');
  });

  it('should throw an error if author is empty', () => {
    expect(() => Post.create('Title', 'Content', '')).toThrow('Author is required');
  });

  it('should update post data', () => {
    const post = Post.create('Old Title', 'Old Content', 'Old Author');
    const oldUpdatedAt = post.updatedAt;
    
    // Wait a bit to ensure updatedAt changes if it uses new Date()
    // Or we can just check if it's a Date and if it's called.
    
    post.update('New Title', 'New Content', 'New Author');
    
    expect(post.title).toBe('New Title');
    expect(post.content).toBe('New Content');
    expect(post.author).toBe('New Author');
    expect(post.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
  });

  it('should partially update post data', () => {
    const post = Post.create('Old Title', 'Old Content', 'Old Author');
    
    post.update('New Title');
    
    expect(post.title).toBe('New Title');
    expect(post.content).toBe('Old Content');
    expect(post.author).toBe('Old Author');
  });

  it('should throw error if update results in invalid state', () => {
    const post = Post.create('Title', 'Content', 'Author');
    expect(() => post.update('')).toThrow('Title is required');
  });
});

