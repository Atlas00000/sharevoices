import mongoose from 'mongoose';

export async function connectMongoDB(uri: string) {
  try {
    await mongoose.connect(uri, {
      // useNewUrlParser: true, // not needed in mongoose 6+
      // useUnifiedTopology: true, // not needed in mongoose 6+
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
} 