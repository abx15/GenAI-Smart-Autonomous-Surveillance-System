/**
 * Purpose: Mongoose connection instantiation handling auto-retry mechanics for resiliency.
 */
import mongoose from 'mongoose';
import dns from 'dns';
import { logger } from '../utils/logger';

// CRITICAL: Override DNS servers for MongoDB Atlas SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDB(uri: string): Promise<void> {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      logger.info({ attempt, maxRetries: MAX_RETRIES }, 'Connecting to MongoDB...');

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,                    // Force IPv4 (important for Atlas)
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
      });

      logger.info('✅ MongoDB connected successfully');

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Reconnecting...');
      });

      mongoose.connection.on('error', (err) => {
        logger.error({ err }, 'MongoDB connection error');
      });

      return;

    } catch (err) {
      logger.error({ err, attempt }, `MongoDB connection attempt ${attempt} failed`);

      if (attempt >= MAX_RETRIES) {
        logger.fatal('❌ All MongoDB connection attempts exhausted. Exiting.');
        process.exit(1);
      }

      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
}
