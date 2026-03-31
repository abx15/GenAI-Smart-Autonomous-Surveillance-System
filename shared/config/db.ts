/**
 * Purpose: Mongoose connection instantiation handling auto-retry mechanics for resiliency.
 */
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

export const connectDB = async (uri: string, retries = 0): Promise<typeof mongoose> => {
  try {
    const connection = await mongoose.connect(uri);
    logger.info('MongoDB connected successfully');
    return connection;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      logger.warn(`MongoDB connection failed (Attempt ${retries + 1}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(uri, retries + 1);
    }
    logger.error('Could not connect to MongoDB after max retries.', error);
    process.exit(1);
  }
};
