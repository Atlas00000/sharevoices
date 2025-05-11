import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for images
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Process and optimize uploaded image
export const processImage = async (filePath: string): Promise<string> => {
  const optimizedPath = filePath.replace(/\.[^/.]+$/, '_optimized$&');
  
  await sharp(filePath)
    .resize(1200, 800, { // Max dimensions
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 80 }) // Optimize quality
    .toFile(optimizedPath);

  // Delete original file
  fs.unlinkSync(filePath);

  return optimizedPath;
};

// Generate image URL
export const getImageUrl = (filename: string): string => {
  return `/uploads/images/${filename}`;
}; 