import { Client } from '@elastic/elasticsearch';
import logger from '../logger';

let client: Client;

export async function connectElasticsearch(url: string): Promise<Client> {
  try {
    client = new Client({ node: url });
    await client.ping();
    logger.info('Connected to Elasticsearch');
    return client;
  } catch (error) {
    logger.error('Elasticsearch connection error:', error);
    throw error;
  }
}

export async function disconnectElasticsearch(): Promise<void> {
  try {
    if (client) {
      await client.close();
      logger.info('Disconnected from Elasticsearch');
    }
  } catch (error) {
    logger.error('Elasticsearch disconnection error:', error);
    throw error;
  }
}

// Initialize Elasticsearch indices
export async function initializeIndices(): Promise<void> {
  try {
    // Articles index
    await client.indices.create({
      index: 'articles',
      body: {
        mappings: {
          properties: {
            title: { type: 'text', analyzer: 'english' },
            content: { type: 'text', analyzer: 'english' },
            category: { type: 'keyword' },
            tags: { type: 'keyword' },
            authorId: { type: 'keyword' },
            status: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            publishedAt: { type: 'date' }
          }
        }
      }
    }, { ignore: [400] }); // Ignore 400 if index already exists

    logger.info('Elasticsearch indices initialized');
  } catch (error) {
    logger.error('Failed to initialize Elasticsearch indices:', error);
    throw error;
  }
}

process.on('SIGINT', async () => {
  await disconnectElasticsearch();
  process.exit(0);
}); 