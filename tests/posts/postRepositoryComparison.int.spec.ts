import { NativeSqlPostRepository } from '@/posts/nativeSqlPostRepository';
import { Post } from '@/posts/post';
import { db } from '@/lib/db';

describe('Repository Baseline Comparison (Native SQL vs Direct Queries)', () => {
  let nativeSqlRepo: NativeSqlPostRepository;
  const testPostsUuids: string[] = [];

  beforeAll(() => {
    nativeSqlRepo = new NativeSqlPostRepository();
  });

  afterEach(async () => {
    // Cleanup any posts created during tests
    if (testPostsUuids.length > 0) {
      await db.query('DELETE FROM "posts" WHERE uuid = ANY($1)', [testPostsUuids]);
    }
    testPostsUuids.length = 0;
  });

  afterAll(async () => {
    await db.end();
  });

  async function createTestPost(title: string, content: string, author: string): Promise<Post> {
    const res = await db.query('INSERT INTO "posts" (title, content, author) VALUES ($1, $2, $3) RETURNING *', [title, content, author]);
    const row = res.rows[0];
    const created = new Post(row.id, row.uuid, row.title, row.content, row.author, new Date(row.createdAt), new Date(row.updatedAt));
    if (created.uuid) testPostsUuids.push(created.uuid);
    return created;
  }

  it('should return identical results for findAll', async () => {
    await createTestPost('Repo Compare 1', 'Content 1', 'Author 1');
    await createTestPost('Repo Compare 2', 'Content 2', 'Author 2');

    const nativeResults = await nativeSqlRepo.findAll();

    // Baseline: Direct SQL check
    const { rows } = await db.query('SELECT * FROM "posts" ORDER BY "createdAt" DESC');
    
    expect(nativeResults.length).toBeGreaterThanOrEqual(2);
    expect(nativeResults.length).toBe(rows.length);

    for (let i = 0; i < rows.length; i++) {
      expect(nativeResults[i].uuid).toBe(rows[i].uuid);
      expect(nativeResults[i].title).toBe(rows[i].title);
      expect(nativeResults[i].content).toBe(rows[i].content);
      expect(nativeResults[i].author).toBe(rows[i].author);
    }
  });

  it('should return identical results for findById', async () => {
    const created = await createTestPost('Single Post', 'Content', 'Author');
    const uuid = created.uuid!;

    const nativeResult = await nativeSqlRepo.findById(uuid);
    
    // Baseline: Direct SQL check
    const { rows } = await db.query('SELECT * FROM "posts" WHERE uuid = $1', [uuid]);
    const baseline = rows[0];

    expect(nativeResult).not.toBeNull();
    expect(baseline).not.toBeUndefined();
    expect(nativeResult?.uuid).toBe(baseline?.uuid);
    expect(nativeResult?.title).toBe(baseline?.title);
  });

  it('should return identical results for search', async () => {
    const uniqueTerm = `UniqueTerm_${Date.now()}`;
    await createTestPost(`Title ${uniqueTerm}`, 'Content', 'Author');
    await createTestPost('Other Title', `Content ${uniqueTerm}`, 'Author');

    const nativeResults = await nativeSqlRepo.search(uniqueTerm);
    
    // Baseline: Direct SQL check
    const { rows } = await db.query(`
      SELECT * FROM "posts"
      WHERE title ILIKE $1 OR content ILIKE $1
      ORDER BY "createdAt" DESC;
    `, [`%${uniqueTerm}%`]);

    expect(nativeResults.length).toBe(2);
    expect(rows.length).toBe(2);
    
    const nativeUuids = nativeResults.map(p => p.uuid).sort();
    const baselineUuids = rows.map(r => r.uuid).sort();
    
    expect(nativeUuids).toEqual(baselineUuids);
  });
});
