import { Article as SharedArticle, IArticle as ISharedArticle } from '@sharedvoices/db/schemas/mongodb/article.schema';

// Re-export the shared Article model and interface
export type IArticle = ISharedArticle;
export const Article = SharedArticle;