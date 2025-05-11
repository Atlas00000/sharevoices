import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { ArticleCategory } from '../models/Article';

// Sanitization options
const sanitizeOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img'
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'id']
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedClasses: {
    '*': ['text-*', 'bg-*', 'p-*', 'm-*', 'border-*']
  }
};

// Content validation schema
export const contentSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be less than 50,000 characters'),
  category: z.nativeEnum(ArticleCategory, {
    errorMap: () => ({ message: 'Invalid category. Must be one of: ' + Object.values(ArticleCategory).join(', ') })
  }),
  excerpt: z.string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),
  featuredImage: z.string()
    .url('Invalid image URL')
    .optional(),
  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional()
});

// Sanitize HTML content
export const sanitizeContent = (content: string): string => {
  return sanitizeHtml(content, sanitizeOptions);
};

// Validate and sanitize article content
export const validateAndSanitizeContent = (data: any) => {
  try {
    // Validate data structure
    const validatedData = contentSchema.parse(data);

    // Sanitize content
    return {
      ...validatedData,
      content: sanitizeContent(validatedData.content),
      excerpt: validatedData.excerpt ? sanitizeContent(validatedData.excerpt) : undefined
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
    }
    throw error;
  }
};