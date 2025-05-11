import schedule from 'node-schedule';
import { Article, ArticleStatus } from '../models/Article';

// Store active jobs
const activeJobs = new Map<string, schedule.Job>();

// Schedule article publication
export const scheduleArticlePublication = async (articleId: string, publishDate: Date) => {
  // Cancel existing job if any
  if (activeJobs.has(articleId)) {
    activeJobs.get(articleId)?.cancel();
  }

  // Create new job
  const job = schedule.scheduleJob(publishDate, async () => {
    try {
      const article = await Article.findById(articleId);
      if (article && article.status === ArticleStatus.DRAFT) {
        article.status = ArticleStatus.PUBLISHED;
        article.publishedAt = new Date();
        await article.save();
      }
    } catch (error) {
      console.error(`Error publishing scheduled article ${articleId}:`, error);
    } finally {
      activeJobs.delete(articleId);
    }
  });

  // Store job reference
  activeJobs.set(articleId, job);
};

// Cancel scheduled publication
export const cancelScheduledPublication = (articleId: string) => {
  if (activeJobs.has(articleId)) {
    activeJobs.get(articleId)?.cancel();
    activeJobs.delete(articleId);
  }
};

// Initialize scheduled articles on server start
export const initializeScheduledArticles = async () => {
  try {
    const scheduledArticles = await Article.find({
      status: ArticleStatus.DRAFT,
      publishedAt: { $gt: new Date() }
    });

    for (const article of scheduledArticles) {
      if (article.publishedAt) {
        scheduleArticlePublication(article._id.toString(), article.publishedAt);
      }
    }
  } catch (error) {
    console.error('Error initializing scheduled articles:', error);
  }
}; 