import { ArticleCategory } from './models/Article';
import { validateAndSanitizeContent } from './utils/contentValidation';

// Test data
const testData = {
  title: 'Test Article',
  content: 'This is a test article',
  category: 'technology'
};

console.log('Test data:', testData);

try {
  // Validate the data
  const validatedData = validateAndSanitizeContent(testData);
  console.log('Validation successful!');
  console.log('Validated data:', validatedData);
} catch (error) {
  console.error('Validation error:', error);
}
