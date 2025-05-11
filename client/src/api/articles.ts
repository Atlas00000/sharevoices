import apiClient from './client';

export async function getFeaturedArticles() {
  const response = await apiClient.get('/api/articles?featured=true');
  return response.data;
}

export async function getLatestArticles() {
  const response = await apiClient.get('/api/articles?sort=latest');
  return response.data;
} 