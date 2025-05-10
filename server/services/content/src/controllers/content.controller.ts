import { Request, Response } from 'express';
import { Article } from '@sharedvoices/db/schemas/mongodb/article.schema';
import { connectElasticsearch, ElasticsearchClient } from '@sharedvoices/shared/src/database/elasticsearch';
import { validate } from 'class-validator';
import slugify from 'slugify';
import { ArticleVersion } from '@sharedvoices/db/schemas/mongodb/article-version.schema';
import { cache, Cache } from '../utils/cache';

export class ContentController {
    private elasticsearchClient = connectElasticsearch(process.env.ELASTICSEARCH_URL || 'http://localhost:9200');

    // Create a new article
    async create(req: Request, res: Response) {
        try {
            const { title, content, category, tags, authorId, featuredImage, mediaUrls } = req.body;

            // Generate slug from title
            const slug = slugify(title, { lower: true, strict: true });

            // Create article
            const article = new Article({
                title,
                content,
                slug,
                category,
                tags,
                authorId,
                featuredImage,
                mediaUrls,
                status: 'draft'
            });

            // Validate article
            const errors = await validate(article);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            // Save to MongoDB
            await article.save();

            // Index in Elasticsearch
            const client = await this.elasticsearchClient;
            await client.index({
                index: 'articles',
                id: (article as any)._id.toString(),
                document: {
                    title,
                    content,
                    category,
                    tags,
                    authorId,
                    status: 'draft',
                    createdAt: article.createdAt,
                    updatedAt: article.updatedAt
                }
            });

            return res.status(201).json(article);
        } catch (error) {
            console.error('Error creating article:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get all articles with pagination and filters
    async getAll(req: Request, res: Response) {
        try {
            const {
                page = 1,
                limit = 10,
                category,
                status,
                authorId,
                search
            } = req.query;

            const cacheKey = Cache.getArticleListKey({ page, limit, category, status, authorId, search });
            const cachedData = await cache.get(cacheKey);

            if (cachedData) {
                return res.json(cachedData);
            }

            const skip = (Number(page) - 1) * Number(limit);
            const query: any = {};

            if (category) query.category = category;
            if (status) query.status = status;
            if (authorId) query.authorId = authorId;

            // If search query exists, use Elasticsearch
            if (search) {
                const client = await this.elasticsearchClient;
                const searchResults = await client.search({
                    index: 'articles',
                    body: {
                        query: {
                            multi_match: {
                                query: search as string,
                                fields: ['title^2', 'content'],
                                fuzziness: 'AUTO'
                            }
                        },
                        from: skip,
                        size: Number(limit)
                    }
                });
                const articleIds = (searchResults.hits.hits as Array<{ _id: string }>).map((hit) => hit._id);
                query._id = { $in: articleIds };
            }

            const [articles, total] = await Promise.all([
                Article.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit)),
                Article.countDocuments(query)
            ]);

            const response = {
                articles,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit))
            };

            await cache.set(cacheKey, response);
            return res.json(response);
        } catch (error) {
            console.error('Error fetching articles:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get article by ID or slug
    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const cacheKey = Cache.getArticleKey(id);
            const cachedArticle = await cache.get(cacheKey);

            if (cachedArticle) {
                return res.json(cachedArticle);
            }

            const article = await Article.findOne({
                $or: [
                    { _id: id },
                    { slug: id }
                ]
            });

            if (!article) {
                return res.status(404).json({ message: 'Article not found' });
            }

            // Increment view count
            article.viewCount += 1;
            await article.save();

            await cache.set(cacheKey, article);
            return res.json(article);
        } catch (error) {
            console.error('Error fetching article:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Update article
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, content, category, tags, status, featuredImage, mediaUrls } = req.body;

            const article = await Article.findById(id);
            if (!article) {
                return res.status(404).json({ message: 'Article not found' });
            }

            // Update fields
            if (title) {
                article.title = title;
                article.slug = slugify(title, { lower: true, strict: true });
            }
            if (content) article.content = content;
            if (category) article.category = category;
            if (tags) article.tags = tags;
            if (status) article.status = status;
            if (featuredImage) article.featuredImage = featuredImage;
            if (mediaUrls) article.mediaUrls = mediaUrls;

            // Validate article
            const errors = await validate(article);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            // Save to MongoDB
            await article.save();

            // Update Elasticsearch index
            const client = await this.elasticsearchClient;
            await client.update({
                index: 'articles',
                id: (article as any)._id.toString(),
                doc: {
                    title: article.title,
                    content: article.content,
                    category: article.category,
                    tags: article.tags,
                    status: article.status,
                    updatedAt: article.updatedAt
                }
            });

            // Invalidate caches
            await Promise.all([
                cache.del(Cache.getArticleKey(id)),
                cache.invalidatePattern('articles:*'),
                cache.del(Cache.getArticleStatsKey(id)),
                cache.del(Cache.getGlobalStatsKey())
            ]);

            return res.json(article);
        } catch (error) {
            console.error('Error updating article:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Delete article
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const article = await Article.findById(id);

            if (!article) {
                return res.status(404).json({ message: 'Article not found' });
            }

            // Delete from MongoDB
            await article.deleteOne();

            // Delete from Elasticsearch
            const client = await this.elasticsearchClient;
            await client.delete({
                index: 'articles',
                id: (article as any)._id.toString()
            });

            // Invalidate caches
            await Promise.all([
                cache.del(Cache.getArticleKey(id)),
                cache.invalidatePattern('articles:*'),
                cache.del(Cache.getArticleStatsKey(id)),
                cache.del(Cache.getGlobalStatsKey())
            ]);

            return res.status(204).send();
        } catch (error) {
            console.error('Error deleting article:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Publish article
    async publish(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const article = await Article.findById(id);

            if (!article) {
                return res.status(404).json({ message: 'Article not found' });
            }

            article.status = 'published';
            article.publishedAt = new Date();
            await article.save();

            // Update Elasticsearch index
            const client = await this.elasticsearchClient;
            await client.update({
                index: 'articles',
                id: (article as any)._id.toString(),
                doc: {
                    status: 'published',
                    publishedAt: article.publishedAt
                }
            });

            return res.json(article);
        } catch (error) {
            console.error('Error publishing article:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get article versions
    async getVersions(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const versions = await ArticleVersion.find({ articleId: id })
                .sort({ version: -1 });

            return res.json(versions);
        } catch (error) {
            console.error('Error fetching article versions:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get specific version
    async getVersion(req: Request, res: Response) {
        try {
            const { id, version } = req.params;
            const articleVersion = await ArticleVersion.findOne({
                articleId: id,
                version: Number(version)
            });

            if (!articleVersion) {
                return res.status(404).json({ message: 'Version not found' });
            }

            return res.json(articleVersion);
        } catch (error) {
            console.error('Error fetching article version:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Restore article to specific version
    async restoreVersion(req: Request, res: Response) {
        try {
            const { id, version } = req.params;
            const articleVersion = await ArticleVersion.findOne({
                articleId: id,
                version: Number(version)
            });

            if (!articleVersion) {
                return res.status(404).json({ message: 'Version not found' });
            }

            const article = await Article.findById(id);
            if (!article) {
                return res.status(404).json({ message: 'Article not found' });
            }

            // Update article with version data
            article.title = articleVersion.title;
            article.content = articleVersion.content;
            article.category = articleVersion.category;
            article.tags = articleVersion.tags;
            await article.save();

            // Create new version entry for the restore
            const newVersion = new ArticleVersion({
                ...articleVersion.toObject(),
                articleId: (article as any)._id,
                version: (await ArticleVersion.countDocuments({ articleId: id })) + 1,
                changes: [{
                    field: 'restore',
                    oldValue: null,
                    newValue: `Restored to version ${version}`
                }],
                createdBy: (req as any).user?.id
            });
            await newVersion.save();

            return res.json(article);
        } catch (error) {
            console.error('Error restoring article version:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get article statistics
    async getStatistics(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const cacheKey = Cache.getArticleStatsKey(id);
            const cachedStats = await cache.get(cacheKey);

            if (cachedStats) {
                return res.json(cachedStats);
            }

            const article = await Article.findById(id);
            if (!article) {
                return res.status(404).json({ message: 'Article not found' });
            }

            const versions = await ArticleVersion.find({ articleId: id })
                .sort({ version: -1 });

            const stats = {
                totalViews: article.viewCount,
                totalLikes: article.likeCount,
                totalComments: article.commentCount,
                versionCount: versions.length,
                lastUpdated: article.updatedAt,
                lastPublished: article.publishedAt,
                averageViewsPerDay: calculateAverageViewsPerDay(article),
                engagementRate: calculateEngagementRate(article),
                versionHistory: versions.map(v => ({
                    version: v.version,
                    createdAt: v.createdAt,
                    changes: v.changes.length
                }))
            };

            await cache.set(cacheKey, stats, 300); // Cache for 5 minutes
            return res.json(stats);
        } catch (error) {
            console.error('Error fetching article statistics:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get global statistics
    async getGlobalStatistics(req: Request, res: Response) {
        try {
            const cacheKey = Cache.getGlobalStatsKey();
            const cachedStats = await cache.get(cacheKey);

            if (cachedStats) {
                return res.json(cachedStats);
            }

            const [
                totalArticles,
                publishedArticles,
                totalViews,
                totalLikes,
                totalComments,
                categoryStats,
                authorStats
            ] = await Promise.all([
                Article.countDocuments(),
                Article.countDocuments({ status: 'published' }),
                Article.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
                Article.aggregate([{ $group: { _id: null, total: { $sum: '$likeCount' } } }]),
                Article.aggregate([{ $group: { _id: null, total: { $sum: '$commentCount' } } }]),
                Article.aggregate([
                    { $group: { _id: '$category', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]),
                Article.aggregate([
                    { $group: { _id: '$authorId', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ])
            ]);

            const stats = {
                totalArticles,
                publishedArticles,
                totalViews: totalViews[0]?.total || 0,
                totalLikes: totalLikes[0]?.total || 0,
                totalComments: totalComments[0]?.total || 0,
                categoryStats,
                authorStats
            };

            await cache.set(cacheKey, stats, 300); // Cache for 5 minutes
            return res.json(stats);
        } catch (error) {
            console.error('Error fetching global statistics:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

// Helper functions
function calculateAverageViewsPerDay(article: any): number {
    if (!article.publishedAt) return 0;
    const daysSincePublished = Math.max(
        1,
        Math.ceil((Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60 * 24))
    );
    return article.viewCount / daysSincePublished;
}

function calculateEngagementRate(article: any): number {
    const totalEngagement = article.likeCount + article.commentCount;
    return article.viewCount > 0 ? (totalEngagement / article.viewCount) * 100 : 0;
}