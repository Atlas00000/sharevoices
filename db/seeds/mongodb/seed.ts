import { Article } from '../../schemas/mongodb/article.schema';
import { connectMongoDB } from '@sharedvoices/shared/src/database/mongodb';
import { connectElasticsearch } from '@sharedvoices/shared/src/database/elasticsearch';
import slugify from 'slugify';

export async function seedArticles(): Promise<void> {
    try {
        // Connect to MongoDB
        await connectMongoDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharedvoices');
        
        // Connect to Elasticsearch
        const elasticsearchClient = await connectElasticsearch(
            process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
        );

        // Sample articles
        const articles = [
            {
                title: 'Sustainable Development Goals: A Global Call to Action',
                content: `The Sustainable Development Goals (SDGs) represent a universal call to action to end poverty, protect the planet, and ensure that all people enjoy peace and prosperity by 2030. This article explores the 17 SDGs and their interconnected nature, highlighting how each goal contributes to a sustainable future.`,
                category: 'SDGs',
                tags: ['sustainability', 'global development', 'UN goals'],
                authorId: '00000000-0000-0000-0000-000000000001', // Admin user ID
                status: 'published',
                featuredImage: 'https://example.com/images/sdgs.jpg',
                viewCount: 1500,
                likeCount: 120,
                commentCount: 45
            },
            {
                title: 'Innovation in Humanitarian Aid: Technology for Good',
                content: `Modern technology is revolutionizing humanitarian aid delivery. From blockchain for transparent donations to AI for disaster prediction, this article examines how innovation is making humanitarian efforts more efficient and effective.`,
                category: 'Innovation',
                tags: ['technology', 'humanitarian aid', 'innovation'],
                authorId: '00000000-0000-0000-0000-000000000002', // Editor user ID
                status: 'published',
                featuredImage: 'https://example.com/images/tech-aid.jpg',
                viewCount: 800,
                likeCount: 75,
                commentCount: 30
            },
            {
                title: 'Building Peace Through Education: A Case Study',
                content: `Education plays a crucial role in peacebuilding. This case study explores how educational programs in conflict zones are helping to build bridges between communities and create lasting peace.`,
                category: 'Peace',
                tags: ['education', 'peacebuilding', 'case study'],
                authorId: '00000000-0000-0000-0000-000000000001',
                status: 'draft',
                featuredImage: 'https://example.com/images/peace-ed.jpg',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0
            }
        ];

        // Create and save articles
        for (const articleData of articles) {
            const slug = slugify(articleData.title, { lower: true, strict: true });
            const article = new Article({
                ...articleData,
                slug,
                createdAt: new Date(),
                updatedAt: new Date(),
                publishedAt: articleData.status === 'published' ? new Date() : undefined
            });

            await article.save();

            // Index in Elasticsearch
            await elasticsearchClient.index({
                index: 'articles',
                id: article._id.toString(),
                document: {
                    title: article.title,
                    content: article.content,
                    category: article.category,
                    tags: article.tags,
                    authorId: article.authorId,
                    status: article.status,
                    createdAt: article.createdAt,
                    updatedAt: article.updatedAt,
                    publishedAt: article.publishedAt
                }
            });
        }

        console.log('Articles seeded successfully');
    } catch (error) {
        console.error('Error seeding articles:', error);
        throw error;
    }
} 