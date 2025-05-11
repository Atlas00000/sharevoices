import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index';

const api = request(app);

beforeAll(async () => {
  // Use a test database
  const url = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/sharedvoices_test';
  await mongoose.connect(url, { dbName: 'sharedvoices_test' });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('Article API', () => {
  let articleId: string;

  it('should create a new article', async () => {
    const res = await api.post('/api/articles').send({
      title: 'Test Article',
      content: 'Test content',
      author: 'Test Author',
      category: 'Test Category'
    });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Article');
    articleId = res.body._id;
  });

  it('should get all articles', async () => {
    const res = await api.get('/api/articles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a specific article', async () => {
    const res = await api.get(`/api/articles/${articleId}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(articleId);
  });

  it('should update an article', async () => {
    const res = await api.put(`/api/articles/${articleId}`).send({
      title: 'Updated Title',
      content: 'Updated content',
      author: 'Test Author',
      category: 'Test Category'
    });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  it('should delete an article', async () => {
    const res = await api.delete(`/api/articles/${articleId}`);
    expect(res.status).toBe(204);
  });
}); 