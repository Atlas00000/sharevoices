import request from 'supertest';
import { app } from '../../app';
import { Article } from '@sharedvoices/db/schemas/mongodb/article.schema';
import { ArticleVersion } from '@sharedvoices/db/schemas/mongodb/article-version.schema';
import { generateToken } from '../utils/auth';

describe('Content API Integration Tests', () => {
    let adminToken: string;
    let editorToken: string;
    let testArticle: any;

    beforeAll(async () => {
        adminToken = generateToken({ id: '1', role: 'admin' });
        editorToken = generateToken({ id: '2', role: 'editor' });

        // Create a test article
        const response = await request(app)
            .post('/api/content')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Test Article',
                content: 'Test content',
                category: 'test',
                tags: ['test'],
                authorId: '1'
            });

        testArticle = response.body;
    });

    afterAll(async () => {
        await Article.deleteMany({});
        await ArticleVersion.deleteMany({});
    });

    describe('Versioning', () => {
        it('should create a new version when article is updated', async () => {
            const updateResponse = await request(app)
                .put(`/api/content/${testArticle._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Updated Test Article',
                    content: 'Updated test content',
                    category: 'test',
                    tags: ['test', 'updated']
                });

            expect(updateResponse.status).toBe(200);

            const versionsResponse = await request(app)
                .get(`/api/content/${testArticle._id}/versions`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(versionsResponse.status).toBe(200);
            expect(versionsResponse.body).toHaveLength(2);
            expect(versionsResponse.body[0].version).toBe(2);
            expect(versionsResponse.body[0].title).toBe('Updated Test Article');
        });

        it('should get specific version', async () => {
            const response = await request(app)
                .get(`/api/content/${testArticle._id}/versions/1`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.version).toBe(1);
            expect(response.body.title).toBe('Test Article');
        });

        it('should restore article to specific version', async () => {
            const response = await request(app)
                .post(`/api/content/${testArticle._id}/versions/1/restore`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.title).toBe('Test Article');

            // Verify new version was created
            const versionsResponse = await request(app)
                .get(`/api/content/${testArticle._id}/versions`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(versionsResponse.body).toHaveLength(3);
            expect(versionsResponse.body[0].version).toBe(3);
        });
    });

    describe('Statistics', () => {
        it('should get article statistics', async () => {
            const response = await request(app)
                .get(`/api/content/${testArticle._id}/stats`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('totalViews');
            expect(response.body).toHaveProperty('totalLikes');
            expect(response.body).toHaveProperty('totalComments');
            expect(response.body).toHaveProperty('versionCount');
            expect(response.body).toHaveProperty('versionHistory');
            expect(response.body.versionHistory).toHaveLength(3);
        });

        it('should get global statistics', async () => {
            const response = await request(app)
                .get('/api/content/stats/global');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('totalArticles');
            expect(response.body).toHaveProperty('publishedArticles');
            expect(response.body).toHaveProperty('totalViews');
            expect(response.body).toHaveProperty('totalLikes');
            expect(response.body).toHaveProperty('totalComments');
            expect(response.body).toHaveProperty('categoryStats');
            expect(response.body).toHaveProperty('authorStats');
        });
    });

    describe('Authorization', () => {
        it('should not allow unauthorized access to versioning endpoints', async () => {
            const response = await request(app)
                .get(`/api/content/${testArticle._id}/versions`);

            expect(response.status).toBe(401);
        });

        it('should not allow unauthorized access to statistics endpoints', async () => {
            const response = await request(app)
                .get(`/api/content/${testArticle._id}/stats`);

            expect(response.status).toBe(401);
        });

        it('should not allow non-admin/editor access to versioning endpoints', async () => {
            const userToken = generateToken({ id: '3', role: 'user' });
            const response = await request(app)
                .get(`/api/content/${testArticle._id}/versions`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
        });
    });
});